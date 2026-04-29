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

export const StockPage: React.FC = () => {
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
  const [statsOpen, setStatsOpen] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 500);

  const [editModal, setEditModal] = useState<{ open: boolean; item: ProductWithBranchInfo | null }>({ open: false, item: null });
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
    if (error) { toast.error(error); clearError(); }
  }, [error, toast, clearError]);

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBranchId(Number(e.target.value));
  };

  const openEditModal = (item: ProductWithBranchInfo) => {
    setEditModal({ open: true, item });
    setEditHasStock(item.branch.hasStock);
    setEditStockQty(item.branch.stockQty?.toString() ?? '');
  };

  const closeEditModal = () => setEditModal({ open: false, item: null });

  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.item || !selectedBranchId) return;
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
        goToPage(pagination.page);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error al actualizar stock');
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (prices: Array<{ priceTypeId: number; price: number }> | undefined) => {
    if (!prices || prices.length === 0) return '—';
    const regular = prices.find(p => p.priceTypeId === 1);
    if (regular) return `Bs. ${regular.price.toFixed(2)}`;
    return `Bs. ${prices[0].price.toFixed(2)}`;
  };

  const selectedBranch = branches.find(b => b.id === selectedBranchId);

  const sortedBranches = React.useMemo(() => {
    return [...branches].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [branches]);

  const selectCls = 'w-full rounded-lg px-4 py-2.5 text-sm font-medium bg-white/20 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30';

  const sortedInventory = [...inventory].sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  return (
    <>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(17,93,216,0.12),transparent_60%),radial-gradient(circle_at_80%_0%,rgba(255,100,27,0.08),transparent_55%)]" />

        <div className="relative space-y-6 px-3 py-5 sm:px-6 sm:py-8 lg:px-10 lg:py-12">

          <section className="relative overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-gradient-to-r from-brand-900 via-brand-700 to-brand-500 text-white shadow-2xl">
            <div
              className="absolute inset-0 opacity-30"
              style={{ backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 45%)' }}
            />

            <div className="relative grid gap-6 px-5 py-7 sm:px-8 sm:py-10 md:px-12 lg:grid-cols-[2fr,1.2fr] lg:items-start">

              <div className="flex flex-col gap-5">

                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[0.6rem] uppercase tracking-[0.45em] text-white/70">Control de Stock</p>
                    <h2 className="text-xl font-semibold leading-tight sm:text-2xl md:text-3xl lg:text-4xl">
                      Stock por Sucursal
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStatsOpen(o => !o)}
                    className="lg:hidden mt-1 shrink-0 flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur transition hover:bg-white/20"
                  >
                    <span>{statsOpen ? 'Ocultar' : 'Ver'} stats</span>
                    <svg
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${statsOpen ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-3 rounded-2xl bg-white/10 p-3 sm:p-4 backdrop-blur border border-white/10">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="flex-1">
                      <label className="block text-xs uppercase tracking-wide text-white/70 mb-1">Sucursal</label>
                      <select
                        className={selectCls}
                        value={selectedBranchId ?? ''}
                        onChange={handleBranchChange}
                        disabled={branchesLoading}
                      >
                        {sortedBranches.map(branch => (
                          <option key={branch.id} value={branch.id} className="text-lead-900">
                            {branch.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs uppercase tracking-wide text-white/70 mb-1">Buscar</label>
                      <input
                        className="input-plain w-full text-sm"
                        placeholder="Nombre, código de barras..."
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="flex-1">
                      <label className="block text-xs uppercase tracking-wide text-white/70 mb-1">Categoría</label>
                      <select
                        className={selectCls}
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
                        className={selectCls}
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

                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    {(['available', 'all'] as const).map(filter => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setStockFilter(filter)}
                        className={`w-full rounded-full px-4 py-2 text-sm font-semibold transition sm:w-auto ${stockFilter === filter
                          ? 'bg-lead-50 text-brand-700 shadow-lg'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}
                      >
                        {filter === 'available' ? 'En Stock' : 'Catálogo Completo'}
                      </button>
                    ))}
                  </div>
                </div>

                {statsOpen && (
                  <div className="lg:hidden">
                    <div className="relative rounded-2xl border border-white/20 bg-white/10 px-5 py-6 backdrop-blur">
                      <div className="rounded-xl bg-gradient-to-br from-brand-900 to-brand-600 px-4 py-4 shadow-lg text-center">
                        <p className="text-xs uppercase tracking-wide text-white/80">Total Productos</p>
                        <p className="mt-1.5 text-3xl font-semibold text-white">{pagination.total.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden lg:block">
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

            </div>
          </section>

          <section>
            <div className="card shadow-xl ring-1 ring-black/5">
              <div className="mb-6 flex flex-col gap-2 border-b border-lead-100 pb-4">
                <h3 className="text-lg font-bold text-brand-900 sm:text-xl">
                  Stock en {selectedBranch?.name ?? 'Sucursal'}
                </h3>
                <p className="text-sm text-lead-500">
                  {pagination.totalPages > 0 && `Página ${pagination.page} de ${pagination.totalPages} • `}
                  {pagination.total.toLocaleString()} productos total
                </p>
              </div>

              {isLoading && inventory.length === 0 ? (
                <Loader />
              ) : (
                <>
                  <div className="flex flex-col gap-3 md:hidden">
                    {sortedInventory.length === 0 ? (
                      <p className="py-8 text-center text-sm text-lead-500">
                        {debouncedSearch || categoryFilter !== 'all' || brandFilter !== 'all'
                          ? 'No se encontraron productos con los filtros seleccionados.'
                          : 'No hay productos en el stock de esta sucursal.'}
                      </p>
                    ) : sortedInventory.map(item => (
                      <div key={item.id} className="rounded-xl border border-lead-200 bg-lead-50 p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 max-w-[60%]">
                            <p className="font-semibold text-brand-900 whitespace-normal break-words">{item.name}</p>
                            <p className="text-xs text-lead-500 mt-0.5">{item.category.name} · {item.brand.name}</p>
                            {(item.barcode || item.internalCode) && (
                              <p className="text-xs font-mono text-lead-400 mt-0.5">{item.barcode || item.internalCode}</p>
                            )}
                          </div>
                          <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${item.branch.hasStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {item.branch.hasStock ? 'Disponible' : 'No disp.'}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex gap-4 text-xs text-lead-600">
                            <div>
                              <span className="text-lead-400 uppercase tracking-wide">Stock </span>
                              <span className={`font-semibold ${!item.branch.stockQty || item.branch.stockQty === 0
                                ? 'text-red-600'
                                : item.branch.stockQty <= 5
                                  ? 'text-amber-600'
                                  : 'text-green-600'
                                }`}>
                                {item.branch.stockQty ?? 0}
                              </span>
                            </div>
                            <div>
                              <span className="text-lead-400 uppercase tracking-wide">Precio </span>
                              <span className="font-semibold text-lead-800">{formatPrice(item.prices)}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="rounded-lg bg-brand-100 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-200"
                          >
                            Editar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="hidden md:block overflow-x-auto rounded-lg border border-lead-200 bg-lead-50 shadow-lg">
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
                        {sortedInventory.length === 0 ? (
                          <tr>
                            <td className="px-4 py-6 text-center text-sm text-lead-600" colSpan={8}>
                              {debouncedSearch || categoryFilter !== 'all' || brandFilter !== 'all'
                                ? 'No se encontraron productos con los filtros seleccionados.'
                                : 'No hay productos en el stock de esta sucursal.'}
                            </td>
                          </tr>
                        ) : sortedInventory.map(item => (
                          <tr key={item.id} className="transition-colors hover:bg-white">
                            <td className="px-4 py-3 font-medium text-brand-900">{item.name}</td>
                            <td className="px-4 py-3 text-lead-600">{item.category.name}</td>
                            <td className="px-4 py-3 text-lead-600">{item.brand.name}</td>
                            <td className="px-4 py-3 text-lead-600 font-mono text-xs">{item.barcode || item.internalCode || '—'}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${item.branch.hasStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {item.branch.hasStock ? 'Sí' : 'No'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`font-semibold ${!item.branch.stockQty || item.branch.stockQty === 0
                                ? 'text-red-600'
                                : item.branch.stockQty <= 5
                                  ? 'text-amber-600'
                                  : 'text-green-600'
                                }`}>
                                {item.branch.stockQty ?? 0}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-lead-600">{formatPrice(item.prices)}</td>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-lead-900/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-xl bg-lead-50 shadow-2xl ring-1 ring-black/5">
            <div className="sticky top-0 z-10 flex items-center justify-between bg-brand-600 px-5 py-4 text-white">
              <h3 className="text-base font-semibold tracking-wide">Editar Stock</h3>
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

            <form onSubmit={handleSaveStock} className="space-y-5 px-5 py-5">
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
                    onChange={e => setEditHasStock(e.target.checked)}
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
                    onChange={e => setEditStockQty(e.target.value)}
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
                  className="rounded bg-accent-500 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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