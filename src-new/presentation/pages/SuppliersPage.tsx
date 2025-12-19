import React, { useEffect, useState, useMemo } from 'react';
import { useSuppliers } from '../hooks/useSuppliers';
import { Supplier } from '../../domain/entities/Supplier';
import SuppliersTable from '../components/suppliers/SuppliersTable';
import SupplierFormModal from '../components/suppliers/SupplierFormModal';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import Loader from '../components/shared/Loader';
import ErrorMessage from '../components/shared/ErrorMessage';

export const SuppliersPage: React.FC = () => {
  const {
    suppliers,
    isLoading,
    error,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    updateSupplierState,
  } = useSuppliers();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Supplier | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  /* ───────── Filtros ───────── */
  const filtered = useMemo(() => {
    let list = suppliers;
    if (statusFilter === 'active') list = list.filter(s => s.state);
    if (statusFilter === 'inactive') list = list.filter(s => !s.state);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.contactName ?? '').toLowerCase().includes(q) ||
        (s.phone ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [suppliers, statusFilter, search]);

  /* ───────── Stats ───────── */
  const totalActive = suppliers.filter(s => s.state).length;
  const totalInactive = suppliers.filter(s => !s.state).length;

  /* ───────── Handlers ───────── */
  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (sup: Supplier) => { setEditing(sup); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSave = async (data: Partial<Supplier>) => {
    setSaving(true);
    try {
      if (data.id) {
        await updateSupplier(data.id, data);
      } else {
        await createSupplier(data as Omit<Supplier, 'id'>);
      }
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = (sup: Supplier) => setConfirmDelete(sup);

  const confirmDeactivate = async () => {
    if (!confirmDelete) return;
    setBusyId(confirmDelete.id);
    try {
      await updateSupplierState(confirmDelete.id, false);
    } finally {
      setBusyId(null);
      setConfirmDelete(null);
    }
  };

  const clearFilters = () => {
    setSearch(
      ''
    );
    setStatusFilter('active');
  };

  /* ───────── Render ───────── */
  return (
    <>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(17,93,216,0.12),transparent_60%),radial-gradient(circle_at_80%_0%,rgba(255,100,27,0.08),transparent_55%)]" />
        <div className="relative space-y-10 px-6 py-8 lg:px-10 lg:py-12">
          {/* Hero Section */}
          <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-brand-900 via-brand-700 to-brand-500 text-white shadow-2xl">
            <div
              className="absolute inset-0 opacity-30"
              style={{ backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 45%)' }}
            />
            <div className="grid gap-10 px-8 py-10 md:px-12 lg:grid-cols-[2fr,1.2fr]">
              <div className="space-y-6">
                <p className="text-xs uppercase tracking-[0.45em] text-white/70">Panel de Proveedores</p>
                <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                  Gestión de proveedores y suministros
                </h2>
                <p className="max-w-xl text-sm text-white/80 md:text-base">
                  Administra la información de tus proveedores, contactos y estados para asegurar el abastecimiento continuo de tu inventario.
                </p>
                <div className="space-y-3 rounded-2xl bg-white/10 p-4 backdrop-blur border border-white/10">
                  <div className="flex flex-col gap-3 md:flex-row">
                    <input
                      className="input flex-1 bg-lead-50 text-lead-800 placeholder:text-lead-400 border-transparent focus:bg-white transition-colors shadow-sm"
                      placeholder="Buscar por nombre, contacto o teléfono"
                      value={search}
                      onChange={event => setSearch(event.target.value)}
                    />
                    <button 
                      type="button" 
                      className="rounded-xl border border-white/30 bg-white/10 px-6 py-2 text-xs font-bold uppercase tracking-wide text-white backdrop-blur-sm transition hover:bg-white/20 hover:border-white/50" 
                      onClick={clearFilters}
                    >
                      Limpiar filtros
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-white/70">
                    <button
                      type="button"
                      onClick={() => setStatusFilter('all')}
                      className={`rounded-full px-3 py-1 font-semibold tracking-wide transition ${
                        statusFilter === 'all' ? 'bg-lead-50/90 text-brand-700' : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('active')}
                      className={`rounded-full px-3 py-1 font-semibold tracking-wide transition ${
                        statusFilter === 'active' ? 'bg-lead-50/90 text-brand-700' : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      Activos
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('inactive')}
                      className={`rounded-full px-3 py-1 font-semibold tracking-wide transition ${
                        statusFilter === 'inactive' ? 'bg-lead-50/90 text-brand-700' : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      Inactivos
                    </button>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 rounded-[2rem] bg-white/10 blur-xl" />
                <div className="relative space-y-5 rounded-[2rem] border border-white/20 bg-white/10 px-7 py-8 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium uppercase tracking-[0.4em] text-white/70">Resumen</p>
                    <button type="button" onClick={openCreate} className="btn-primary text-sm shadow-lg">
                      Nuevo proveedor
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-gradient-to-br from-brand-900 to-brand-600 px-4 py-5 shadow-lg">
                      <p className="text-xs uppercase tracking-wide text-white/80">Total</p>
                      <p className="mt-2 text-3xl font-semibold text-white">{suppliers.length}</p>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-accent-500 to-accent-300 px-4 py-5 shadow-lg">
                      <p className="text-xs uppercase tracking-wide text-white/80">Activos</p>
                      <p className="mt-2 text-3xl font-semibold text-white">{totalActive}</p>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-slate-700 to-slate-500 px-4 py-5 shadow-lg col-span-2">
                      <p className="text-xs uppercase tracking-wide text-white/80">Inactivos</p>
                      <p className="mt-2 text-3xl font-semibold text-white">{totalInactive}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Main Content */}
          <section className="grid gap-8 xl:grid-cols-[1fr]">
            <div className="card shadow-xl ring-1 ring-black/5">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-lead-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-brand-900">Listado de proveedores</h3>
                  <p className="text-sm text-lead-500">{filtered.length} proveedor(es) coinciden con el filtro.</p>
                </div>
                <button type="button" className="btn-primary bg-accent-500 hover:bg-accent-600 border-transparent text-white shadow-md" onClick={openCreate}>
                  Crear proveedor
                </button>
              </div>
              
              {isLoading && <Loader />}
              {error && <ErrorMessage message={error} />}
              {!isLoading && !error && (
                <SuppliersTable suppliers={filtered} onEdit={openEdit} onDeactivate={handleDeactivate} busyId={busyId} />
              )}
              {!isLoading && !filtered.length && !error ? (
                <p className="mt-4 rounded-lg border border-dashed border-lead-300 bg-lead-50 px-4 py-8 text-center text-sm text-lead-600">
                  No se encontraron proveedores con los filtros actuales.
                </p>
              ) : null}
            </div>
          </section>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && <SupplierFormModal supplier={editing} onClose={closeModal} onSave={handleSave} saving={saving} />}

      {/* Confirm */}
      {confirmDelete && (
        <ConfirmDialog
          open={!!confirmDelete}
          title="Desactivar proveedor"
          description={`¿Está seguro de desactivar al proveedor "${confirmDelete.name}"?`}
          confirmLabel="Desactivar"
          onConfirm={confirmDeactivate}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  );
};
