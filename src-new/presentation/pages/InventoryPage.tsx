import React, { useEffect, useState, useMemo } from 'react';
import { useProductSuppliers } from '../hooks/useProductSuppliers';
import { useProducts } from '../hooks/useProducts';
import { useSuppliers } from '../hooks/useSuppliers';
import { ProductSupplier } from '../../domain/entities/ProductSupplier';
import { Product } from '../../domain/entities/Product';
import { Supplier } from '../../domain/entities/Supplier';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import Loader from '../components/shared/Loader';
import ErrorMessage from '../components/shared/ErrorMessage';

export const InventoryPage: React.FC = () => {
  const {
    productSuppliers,
    isLoading,
    error,
    fetchProductSuppliers,
    createProductSupplier,
    updateProductSupplier,
    updateProductSupplierState,
  } = useProductSuppliers();

  const { products, fetchProducts } = useProducts();
  const { suppliers, fetchSuppliers } = useSuppliers();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductSupplier | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ProductSupplier | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  /* Form state */
  const [productId, setProductId] = useState<number | ''>('');
  const [supplierId, setSupplierId] = useState<number | ''>('');
  const [agreedBuyPrice, setAgreedBuyPrice] = useState('');

  useEffect(() => {
    fetchProductSuppliers();
    fetchProducts();
    fetchSuppliers();
  }, [fetchProductSuppliers, fetchProducts, fetchSuppliers]);

  /* Helpers */
  const getProductName = (id: number): string => products.find(p => p.id === id)?.name ?? `#${id}`;
  const getSupplierName = (id: number): string => suppliers.find(s => s.id === id)?.name ?? `#${id}`;

  /* ───────── Filtros ───────── */
  const filtered = useMemo(() => {
    let list = productSuppliers;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(ps =>
        getProductName(ps.productId).toLowerCase().includes(q) ||
        getSupplierName(ps.supplierId).toLowerCase().includes(q)
      );
    }
    return list;
  }, [productSuppliers, search, products, suppliers]);

  /* ───────── Stats ───────── */
  const totalActive = productSuppliers.filter(ps => ps.state).length;
  const totalInactive = productSuppliers.filter(ps => !ps.state).length;

  /* ───────── Modal Handlers ───────── */
  const openCreate = () => {
    setEditing(null);
    setProductId('');
    setSupplierId('');
    setAgreedBuyPrice('');
    setModalOpen(true);
  };

  const openEdit = (ps: ProductSupplier) => {
    setEditing(ps);
    setProductId(ps.productId);
    setSupplierId(ps.supplierId);
    setAgreedBuyPrice(ps.agreedBuyPrice?.toString() ?? '');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (productId === '' || supplierId === '') return;
    setSaving(true);
    const data = {
      productId: Number(productId),
      supplierId: Number(supplierId),
      agreedBuyPrice: parseFloat(agreedBuyPrice) || 0,
      state: editing?.state ?? true,
    };
    try {
      if (editing?.id) {
        await updateProductSupplier(editing.id, data);
      } else {
        await createProductSupplier(data);
      }
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = (ps: ProductSupplier) => setConfirmDelete(ps);

  const confirmDeactivate = async () => {
    if (!confirmDelete) return;
    setBusyId(confirmDelete.id);
    try {
      await updateProductSupplierState(confirmDelete.id, false);
    } finally {
      setBusyId(null);
      setConfirmDelete(null);
    }
  };

  const formatPrice = (val: number | undefined) => (val !== undefined ? `Bs. ${val.toFixed(2)}` : '—');

  /* ───────── Table Row ───────── */
  const isBusy = (id: number) => busyId != null && busyId === id;

  /* ───────── Render ───────── */
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-lead-100 via-white to-brand-50">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-r from-brand-600 to-brand-800 py-10 text-white shadow-lg">
          <div className="absolute inset-0 opacity-10" style={{ backgroundSize: '30px 30px' }} />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Inventario</h1>
                <p className="mt-1 text-brand-200">Relaciones Producto – Proveedor</p>
              </div>
              <button onClick={openCreate} className="btn-primary flex items-center gap-2 self-start md:self-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Nueva Relación
              </button>
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-brand-200">Total</p>
                <p className="text-2xl font-bold">{productSuppliers.length}</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-brand-200">Activos</p>
                <p className="text-2xl font-bold">{totalActive}</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-brand-200">Inactivos</p>
                <p className="text-2xl font-bold">{totalInactive}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Filtros */}
        <section className="mx-auto -mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4 rounded-xl bg-white p-4 shadow-lg">
            <input
              type="text"
              placeholder="Buscar producto o proveedor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input flex-1 min-w-[200px]"
            />
            {/* status filter removed */}
          </div>
        </section>

        {/* Tabla */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {isLoading && <Loader />}
          {error && <ErrorMessage message={error} />}
          {!isLoading && !error && (
            filtered.length === 0 ? (
              <div className="rounded-md border bg-white p-6 text-center text-sm text-gray-600 shadow-sm">
                No hay relaciones cargadas todavía.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-lead-200 bg-lead-50 shadow-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-brand-600 text-xs uppercase tracking-wider text-white">
                    <tr>
                      <th className="px-4 py-4 text-left font-semibold">ID</th>
                      <th className="px-4 py-4 text-left font-semibold">Producto</th>
                      <th className="px-4 py-4 text-left font-semibold">Proveedor</th>
                      <th className="px-4 py-4 text-left font-semibold">Precio Acordado</th>
                      <th className="px-4 py-4 text-left font-semibold">Estado</th>
                      <th className="w-40 px-4 py-4 text-center align-middle font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-lead-200">
                    {filtered.map(ps => (
                      <tr key={ps.id} className="transition-colors hover:bg-white">
                        <td className="px-4 py-3 font-medium text-brand-900">{ps.id}</td>
                        <td className="px-4 py-3 text-lead-600">{getProductName(ps.productId)}</td>
                        <td className="px-4 py-3 text-lead-600">{getSupplierName(ps.supplierId)}</td>
                        <td className="px-4 py-3 text-lead-600">{formatPrice(ps.agreedBuyPrice)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${ps.state ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {ps.state ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center align-middle">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(ps)}
                              className="rounded bg-brand-100 px-3 py-1.5 font-medium text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
                              disabled={isBusy(ps.id)}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeactivate(ps)}
                              className="rounded bg-accent-100 px-3 py-1.5 font-medium text-accent-700 transition hover:bg-accent-200 disabled:opacity-50"
                              disabled={isBusy(ps.id) || !ps.state}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </section>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-2xl">
            <h2 className="mb-6 text-xl font-bold text-brand-800">{editing ? 'Editar Relación' : 'Nueva Relación'}</h2>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="productId" className="mb-1 block text-sm font-medium text-lead-700">Producto *</label>
                  <select id="productId" value={productId} onChange={(e) => setProductId(Number(e.target.value) || '')} className="input w-full" required>
                    <option value="">Seleccione</option>
                    {products.filter(p => p.state).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="supplierId" className="mb-1 block text-sm font-medium text-lead-700">Proveedor *</label>
                  <select id="supplierId" value={supplierId} onChange={(e) => setSupplierId(Number(e.target.value) || '')} className="input w-full" required>
                    <option value="">Seleccione</option>
                    {suppliers.filter(s => s.state).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="agreedBuyPrice" className="mb-1 block text-sm font-medium text-lead-700">Precio Acordado (Bs.)</label>
                  <input type="number" id="agreedBuyPrice" value={agreedBuyPrice} onChange={(e) => setAgreedBuyPrice(e.target.value)} className="input w-full" step="0.01" min="0" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="btn-outline" disabled={saving}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={saving || productId === '' || supplierId === ''}>
                  {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm */}
      {confirmDelete && (
        <ConfirmDialog
          title="Desactivar relación"
          message={`¿Está seguro de desactivar la relación entre "${getProductName(confirmDelete.productId)}" y "${getSupplierName(confirmDelete.supplierId)}"?`}
          onConfirm={confirmDeactivate}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  );
};
