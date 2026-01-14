import React, { useEffect, useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import { useBranches } from '../hooks/useBranches';
import { useCategories } from '../hooks/useCategories';
import { useBrands } from '../hooks/useBrands';
import { useDebounce } from '../hooks/useDebounce';
import { useAuth } from '../providers/AuthProvider';
import { ProductWithBranchInfo } from '../../domain/entities/ProductBranch';
import Loader from '../components/shared/Loader';
import Pagination from '../components/shared/Pagination';
import { ToastContainer, useToast } from '../components/shared/Toast';

export const InventoryPage: React.FC = () => {
  const { inventory, pagination, isLoading, error, goToPage, applyFilters, setStock, clearError } = useInventory();
  const { branches, fetchBranches, isLoading: branchesLoading } = useBranches();
  const { categories, fetchCategories } = useCategories();
  const { brands, fetchBrands } = useBrands();
  const auth = useAuth();
  const toast = useToast();

  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'available'>('available');
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');
  const [brandFilter, setBrandFilter] = useState<number | 'all'>('all');
  
  const debouncedSearch = useDebounce(searchInput, 500);
  
  const [editModal, setEditModal] = useState<{
    open: boolean;
    item: ProductWithBranchInfo | null;
  }>({ open: false, item: null });
  const [editHasStock, setEditHasStock] = useState(false);
  const [editStockQty, setEditStockQty] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBranches();
    fetchCategories();
    fetchBrands();
  }, [fetchBranches, fetchCategories, fetchBrands]);

  useEffect(() => {
    if (branches.length > 0 && selectedBranchId === null) {
      const userBranchId = auth.user?.branchId;
      if (userBranchId && branches.find(b => b.id === userBranchId)) {
        setSelectedBranchId(userBranchId);
      } else {
        setSelectedBranchId(branches[0].id);
      }
    }
  }, [branches, selectedBranchId, auth.user]);

  useEffect(() => {
    if (selectedBranchId) {
      applyFilters(selectedBranchId, {
        search: debouncedSearch || undefined,
        onlyAvailable: stockFilter === 'available',
        categoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
        brandId: brandFilter !== 'all' ? brandFilter : undefined,
      });
    }
  }, [selectedBranchId, debouncedSearch, stockFilter, categoryFilter, brandFilter, applyFilters]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, toast, clearError]);

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBranchId(Number(e.target.value));
  };

  const openEditModal = (item: ProductWithBranchInfo) => {
    setEditModal({ open: true, item });
    setEditHasStock(item.branch.hasStock);
    setEditStockQty(item.branch.stockQty?.toString() ?? '');
  };

  const closeEditModal = () => {
    setEditModal({ open: false, item: null });
  };

  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.item || !selectedBranchId) return;
    
    const previousHasStock = editModal.item.branch.hasStock;
    const newHasStock = editHasStock;
    
    setSaving(true);
    try {
      const result = await setStock(editModal.item.id, selectedBranchId, {
        hasStock: editHasStock,
        stockQty: editStockQty ? parseInt(editStockQty, 10) : null,
      });
      if (result) {
        toast.success(result.deleted 
          ? 'Producto marcado como no disponible en esta sucursal'
          : 'Stock actualizado correctamente'
        );
        closeEditModal();
        
        // Si el estado cambió, refrescar la vista para aplicar filtros del backend
        if (previousHasStock !== newHasStock) {
          await applyFilters(selectedBranchId, {
            search: debouncedSearch || undefined,
            onlyAvailable: stockFilter === 'available',
            categoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
            brandId: brandFilter !== 'all' ? brandFilter : undefined,
          });
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error al actualizar stock');
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (price: Record<string, number> | undefined) => {
    if (!price) return '—';
    const entries = Object.entries(price);
    if (entries.length === 0) return '—';
    const [, value] = entries[0];
    return `Bs. ${value.toFixed(2)}`;
  };

  const selectedBranch = branches.find(b => b.id === selectedBranchId);

  return (
    <>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(17,93,216,0.12),transparent_60%),radial-gradient(circle_at_80%_0%,rgba(255,100,27,0.08),transparent_55%)]" />
        <div className="relative space-y-10 px-6 py-8 lg:px-10 lg:py-12">
          <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-brand-900 via-brand-700 to-brand-500 text-white shadow-2xl">
            <div
              className="absolute inset-0 opacity-30"
              style={{ backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 45%)' }}
            />
            <div className="grid gap-10 px-8 py-10 md:px-12 lg:grid-cols-[2fr,1.2fr]">
              <div className="space-y-6">
                <p className="text-xs uppercase tracking-[0.45em] text-white/70">Control de Stock</p>
                <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                  Inventario por Sucursal
                </h2>
                <div className="space-y-3 rounded-2xl bg-white/10 p-4 backdrop-blur border border-white/10">
                  <div className="flex flex-col gap-3 md:flex-row">
                    <div className="flex-1">
                      <label className="block text-xs uppercase tracking-wide text-white/70 mb-1">Sucursal</label>
                      <select
                        className="w-full rounded-lg px-4 py-2.5 text-sm font-medium bg-white/20 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
                        value={selectedBranchId ?? ''}
                        onChange={handleBranchChange}
                        disabled={branchesLoading}
                      >
                        {branches.map(branch => (
                          <option key={branch.id} value={branch.id} className="text-lead-900">
                            {branch.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs uppercase tracking-wide text-white/70 mb-1">Buscar</label>
                      <input
                        className="input-plain w-full"
                        placeholder="Nombre, código de barras o código interno..."
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3 md:flex-row">
                    <div className="flex-1">
                      <label className="block text-xs uppercase tracking-wide text-white/70 mb-1">Categoría</label>
                      <select
                        className="w-full rounded-lg px-4 py-2.5 text-sm font-medium bg-white/20 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                      >
                        <option value="all" className="text-lead-900">Todas las categorías</option>
                        {categories.filter(c => c.state).map(cat => (
                          <option key={cat.id} value={cat.id} className="text-lead-900">{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs uppercase tracking-wide text-white/70 mb-1">Marca</label>
                      <select
                        className="w-full rounded-lg px-4 py-2.5 text-sm font-medium bg-white/20 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
                        value={brandFilter}
                        onChange={e => setBrandFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                      >
                        <option value="all" className="text-lead-900">Todas las marcas</option>
                        {brands.filter(b => b.state).map(brand => (
                          <option key={brand.id} value={brand.id} className="text-lead-900">{brand.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {(['available', 'all'] as const).map(filter => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setStockFilter(filter)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          stockFilter === filter
                            ? 'bg-lead-50 text-brand-700 shadow-lg'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        {filter === 'available' ? 'En Inventario' : 'Catálogo Completo'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 rounded-[2rem] bg-white/10 blur-xl" />
                <div className="relative flex items-center justify-center rounded-[2rem] border border-white/20 bg-white/10 px-7 py-8 backdrop-blur">
                  <div className="rounded-2xl bg-gradient-to-br from-brand-900 to-brand-600 px-8 py-6 shadow-lg text-center w-full">
                    <p className="text-xs uppercase tracking-wide text-white/80">Total Productos</p>
                    <p className="mt-2 text-4xl font-semibold text-white">{pagination.total.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-8 xl:grid-cols-[1fr]">
            <div className="card shadow-xl ring-1 ring-black/5">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-lead-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-brand-900">
                    Stock en {selectedBranch?.name ?? 'Sucursal'}
                  </h3>
                  <p className="text-sm text-lead-500">
                    {pagination.totalPages > 0 && `Página ${pagination.page} de ${pagination.totalPages} • `}
                    {pagination.total.toLocaleString()} productos total
                  </p>
                </div>
              </div>

              {isLoading && inventory.length === 0 ? (
                <Loader />
              ) : inventory.length === 0 ? (
                <div className="rounded-md border bg-white p-6 text-center text-sm text-gray-600 shadow-sm">
                  {debouncedSearch || categoryFilter !== 'all' || brandFilter !== 'all' || stockFilter === 'available'
                    ? 'No se encontraron productos con los filtros seleccionados.'
                    : 'No hay productos en el inventario de esta sucursal.'}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-lg border border-lead-200 bg-lead-50 shadow-lg">
                    <table className="min-w-full text-sm">
                      <thead className="bg-brand-600 text-xs uppercase tracking-wider text-white">
                        <tr>
                          <th className="px-4 py-4 text-left font-semibold">Producto</th>
                          <th className="px-4 py-4 text-left font-semibold">Categoría</th>
                          <th className="px-4 py-4 text-left font-semibold">Marca</th>
                          <th className="px-4 py-4 text-left font-semibold">Código</th>
                          <th className="px-4 py-4 text-center font-semibold">Disponible</th>
                          <th className="px-4 py-4 text-center font-semibold">Stock</th>
                          <th className="px-4 py-4 text-left font-semibold">Precio</th>
                          <th className="w-32 px-4 py-4 text-center font-semibold">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-lead-200">
                        {inventory.map(item => (
                          <tr key={item.id} className="transition-colors hover:bg-white">
                            <td className="px-4 py-3 font-medium text-brand-900">
                              {item.name}
                            </td>
                            <td className="px-4 py-3 text-lead-600">
                              {item.category.name}
                            </td>
                            <td className="px-4 py-3 text-lead-600">
                              {item.brand.name}
                            </td>
                            <td className="px-4 py-3 text-lead-600 font-mono text-xs">
                              {item.barcode || item.internalCode || '—'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                item.branch.hasStock 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {item.branch.hasStock ? 'Sí' : 'No'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`font-semibold ${
                                !item.branch.stockQty || item.branch.stockQty === 0
                                  ? 'text-red-600'
                                  : item.branch.stockQty <= 5
                                  ? 'text-amber-600'
                                  : 'text-green-600'
                              }`}>
                                {item.branch.stockQty ?? 0}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-lead-600">
                              {formatPrice(item.salePrice)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => openEditModal(item)}
                                className="rounded bg-brand-100 px-3 py-1.5 font-medium text-brand-700 transition hover:bg-brand-200"
                              >
                                Editar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {pagination.totalPages > 0 && (
                    <div className="mt-6">
                      <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.total}
                        itemsPerPage={pagination.limit}
                        onPageChange={goToPage}
                        isLoading={isLoading}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      </div>

      {editModal.open && editModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-lead-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="mx-4 my-10 w-full max-w-md overflow-hidden rounded-xl bg-lead-50 shadow-2xl ring-1 ring-black/5">
            <div className="flex items-center justify-between bg-brand-600 px-6 py-4 text-white">
              <h3 className="text-lg font-semibold tracking-wide">Editar Stock</h3>
              <button
                onClick={closeEditModal}
                className="rounded-full p-1 text-brand-100 hover:text-white hover:bg-brand-700 transition-colors"
                disabled={saving}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveStock} className="space-y-5 px-6 py-6">
              <div className="rounded-lg bg-brand-50 p-3 border border-brand-100">
                <p className="text-sm font-medium text-brand-900">{editModal.item.name}</p>
                <div className="flex gap-4 mt-1 text-xs text-brand-600">
                  <span>{editModal.item.category.name}</span>
                  <span>•</span>
                  <span>{editModal.item.brand.name}</span>
                </div>
                {(editModal.item.barcode || editModal.item.internalCode) && (
                  <p className="text-xs text-brand-500 font-mono mt-1">
                    {editModal.item.barcode || editModal.item.internalCode}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editHasStock}
                    onChange={(e) => setEditHasStock(e.target.checked)}
                    className="h-5 w-5 rounded border-lead-300 text-brand-600 focus:ring-brand-500"
                    disabled={saving}
                  />
                  <span className="text-sm font-medium text-lead-700">Tiene stock disponible en esta sucursal</span>
                </label>
                <p className="mt-1 ml-8 text-xs text-lead-500">
                  {editHasStock 
                    ? 'El producto está disponible para venta en esta sucursal.'
                    : 'Desmarcar eliminará el registro de stock para esta sucursal.'}
                </p>
              </div>

              {editHasStock && (
                <div>
                  <label htmlFor="stockQty" className="block text-sm font-medium text-lead-700">
                    Cantidad en Stock
                  </label>
                  <input
                    type="number"
                    id="stockQty"
                    value={editStockQty}
                    onChange={(e) => setEditStockQty(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-lead-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
                    placeholder="0"
                    min="0"
                    disabled={saving}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-lead-100">
                <button
                  type="button"
                  className="rounded bg-white px-4 py-2 text-sm font-medium text-lead-700 border border-lead-300 hover:bg-lead-100 transition-colors"
                  onClick={closeEditModal}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded bg-accent-500 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
    </>
  );
};
