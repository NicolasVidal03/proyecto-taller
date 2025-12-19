import React, { useEffect, useState, useMemo } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { Product } from '../../domain/entities/Product';
import ProductsTable from '../components/products/ProductsTable';
import ProductFormModal from '../components/products/ProductFormModal';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import Loader from '../components/shared/Loader';
import ErrorMessage from '../components/shared/ErrorMessage';

export const ProductsPage: React.FC = () => {
  const {
    products,
    isLoading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    updateProductState,
  } = useProducts();

  const { categories, fetchCategories } = useCategories();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  /* ───────── Filtros ───────── */
  const filtered = useMemo(() => {
    let list = products;
    if (statusFilter === 'active') list = list.filter(p => p.state);
    if (statusFilter === 'inactive') list = list.filter(p => !p.state);
    if (categoryFilter !== 'all') list = list.filter(p => p.categoryId === categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, statusFilter, categoryFilter, search]);

  /* ───────── Stats ───────── */
  const totalActive = products.filter(p => p.state).length;
  const totalInactive = products.filter(p => !p.state).length;
  const lowStock = products.filter(p => (p.stock ?? 0) <= 5 && p.state).length;

  /* ───────── Handlers ───────── */
  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (prod: Product) => { setEditing(prod); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSave = async (data: Partial<Product>) => {
    setSaving(true);
    try {
      if (data.id) {
        await updateProduct(data.id, data);
      } else {
        await createProduct(data as Omit<Product, 'id'>);
      }
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = (prod: Product) => setConfirmDelete(prod);

  const confirmDeactivate = async () => {
    if (!confirmDelete) return;
    setBusyId(confirmDelete.id);
    try {
      await updateProductState(confirmDelete.id, false);
    } finally {
      setBusyId(null);
      setConfirmDelete(null);
    }
  };

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
                <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Productos</h1>
                <p className="mt-1 text-brand-200">Gestión del catálogo de productos</p>
              </div>
              <button onClick={openCreate} className="btn-primary flex items-center gap-2 self-start md:self-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Nuevo Producto
              </button>
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-brand-200">Total</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-brand-200">Activos</p>
                <p className="text-2xl font-bold">{totalActive}</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-brand-200">Inactivos</p>
                <p className="text-2xl font-bold">{totalInactive}</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-brand-200">Stock Bajo</p>
                <p className="text-2xl font-bold text-accent-300">{lowStock}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Filtros */}
        <section className="mx-auto -mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4 rounded-xl bg-white p-4 shadow-lg">
            <input
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input flex-1 min-w-[200px]"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="input w-auto"
            >
              <option value="all">Todas las categorías</option>
              {categories.filter(c => c.state).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="input w-auto"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </section>

        {/* Tabla */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {isLoading && <Loader />}
          {error && <ErrorMessage message={error} />}
          {!isLoading && !error && (
            <ProductsTable products={filtered} onEdit={openEdit} onDeactivate={handleDeactivate} busyId={busyId} />
          )}
        </section>
      </div>

      {/* Modal */}
      {modalOpen && <ProductFormModal product={editing} categories={categories} onClose={closeModal} onSave={handleSave} saving={saving} />}

      {/* Confirm */}
      {confirmDelete && (
        <ConfirmDialog
          title="Desactivar producto"
          message={`¿Está seguro de desactivar el producto "${confirmDelete.name}"?`}
          onConfirm={confirmDeactivate}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  );
};
