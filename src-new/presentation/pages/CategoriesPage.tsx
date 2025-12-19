import React, { useEffect, useState, useMemo } from 'react';
import { useCategories } from '../hooks/useCategories';
import { Category } from '../../domain/entities/Category';
import CategoriesTable from '../components/categories/CategoriesTable';
import CategoryFormModal from '../components/categories/CategoryFormModal';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import Loader from '../components/shared/Loader';
import ErrorMessage from '../components/shared/ErrorMessage';

export const CategoriesPage: React.FC = () => {
  const {
    categories,
    isLoading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    updateCategoryState,
  } = useCategories();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /* ───────── Filtros ───────── */
  const filtered = useMemo(() => {
    let list = categories;
    if (statusFilter === 'active') list = list.filter(c => c.state);
    if (statusFilter === 'inactive') list = list.filter(c => !c.state);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(s) || (c.description ?? '').toLowerCase().includes(s));
    }
    return list;
  }, [categories, statusFilter, search]);

  /* ───────── Stats ───────── */
  const totalActive = categories.filter(c => c.state).length;
  const totalInactive = categories.filter(c => !c.state).length;

  /* ───────── Handlers ───────── */
  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (cat: Category) => { setEditing(cat); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSave = async (data: Partial<Category>) => {
    setSaving(true);
    try {
      if (data.id) {
        await updateCategory(data.id, data);
      } else {
        await createCategory(data as Omit<Category, 'id'>);
      }
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = (cat: Category) => setConfirmDelete(cat);

  const confirmDeactivate = async () => {
    if (!confirmDelete) return;
    setBusyId(confirmDelete.id);
    try {
      await updateCategoryState(confirmDelete.id, false);
    } finally {
      setBusyId(null);
      setConfirmDelete(null);
    }
  };

  /* ───────── Render ───────── */
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-lead-100 via-white to-brand-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-brand-600 to-brand-800 py-10 text-white shadow-lg">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'30\' height=\'30\' ...")', backgroundSize: '30px 30px' }} />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Categorías</h1>
                <p className="mt-1 text-brand-200">Gestión de categorías del inventario</p>
              </div>
              <button onClick={openCreate} className="btn-primary flex items-center gap-2 self-start md:self-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Nueva Categoría
              </button>
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-brand-200">Total</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-brand-200">Activas</p>
                <p className="text-2xl font-bold">{totalActive}</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-brand-200">Inactivas</p>
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
              placeholder="Buscar categoría..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input flex-1 min-w-[200px]"
            />
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
            <CategoriesTable categories={filtered} onEdit={openEdit} onDeactivate={handleDeactivate} busyId={busyId} />
          )}
        </section>
      </div>

      {/* Modal */}
      {modalOpen && <CategoryFormModal category={editing} onClose={closeModal} onSave={handleSave} saving={saving} />}

      {/* Confirm */}
      {confirmDelete && (
        <ConfirmDialog
          title="Desactivar categoría"
          message={`¿Está seguro de desactivar la categoría "${confirmDelete.name}"?`}
          onConfirm={confirmDeactivate}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  );
};
