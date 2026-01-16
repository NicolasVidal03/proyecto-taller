import React, { useEffect, useState, useMemo } from 'react';
import { useSuppliers } from '../hooks/useSuppliers';
import { useCountries } from '../hooks/useCountries';
import { useAuth } from '../providers/AuthProvider';
import { Supplier } from '../../domain/entities/Supplier';
import { CreateSupplierDTO, UpdateSupplierDTO } from '../../domain/ports/ISupplierRepository';
import SuppliersTable from '../components/suppliers/SuppliersTable';
import SupplierFormModal from '../components/suppliers/SupplierFormModal';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import Loader from '../components/shared/Loader';
import { ToastContainer, useToast } from '../components/shared/Toast';

export const SuppliersPage: React.FC = () => {
  const {
    suppliers,
    isLoading,
    error,
    applyFilters,
    createSupplier,
    updateSupplier,
    updateSupplierState,
  } = useSuppliers();

  const {
    countries,
    countryMap,
    fetchCountries,
  } = useCountries();
  const auth = useAuth();
  const toast = useToast();
  const currentUserId = auth.user?.id;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Supplier | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    applyFilters();
    fetchCountries();
    }, [applyFilters, fetchCountries]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error, toast]);

  /* ───────── Filtros ───────── */
  const filtered = useMemo(() => {
    let list = Array.isArray(suppliers) ? suppliers.filter(Boolean) : [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        (s.name ?? '').toLowerCase().includes(q) ||
        (s.contactName ?? '').toLowerCase().includes(q) ||
        (s.phone ?? '').toLowerCase().includes(q) ||
        (s.nit ?? '').toLowerCase().includes(q)
      );
    }
    // Ordenar alfabéticamente por nombre (usar copia para no mutar referencia)
    return [...list].sort((a, b) => (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase()));
  }, [suppliers, search]);

  /* ───────── Handlers ───────── */
  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (sup: Supplier) => { setEditing(sup); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSave = async (data: Partial<Supplier>) => {
    setSaving(true);
    try {
      if (data.id) {
        const { userId, ...updateData } = data;
        await updateSupplier(data.id, updateData as UpdateSupplierDTO, currentUserId);
        toast.success('Proveedor actualizado correctamente');
      } else {
        await createSupplier(data as CreateSupplierDTO, currentUserId);
        toast.success('Proveedor creado correctamente');
      }
      closeModal();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar proveedor';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = (supplier: Supplier) => {
    setConfirmDelete(supplier);
  };

  const confirmDeactivate = async () => {
    if (!confirmDelete) return;
    setBusyId(confirmDelete.id);
    try {
      await updateSupplierState(confirmDelete.id, false, currentUserId);
      toast.success(`Proveedor "${confirmDelete.name}" desactivado correctamente`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al desactivar proveedor';
      toast.error(message);
    } finally {
      setBusyId(null);
      setConfirmDelete(null);
    }
  };

  const clearFilters = () => {
    setSearch('');
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
                <h2 className="text-3xl font-semibold leading-tight md:text-4xl">Gestión de proveedores y suministros</h2>
                <div className="space-y-3 rounded-2xl bg-white/10 p-4 backdrop-blur border border-white/10">
                  <div className="flex flex-col gap-3 md:flex-row">
                    <input
                      className="input-plain flex-1"
                      placeholder="Buscar por nombre, contacto, teléfono o NIT"
                      value={search}
                      onChange={event => setSearch(event.target.value)}
                    />
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
                <button onClick={openCreate} className="btn-primary">
                  + Nuevo proveedor
                </button>
              </div>
              
              {isLoading && <Loader />}
              {!isLoading && (
                <SuppliersTable 
                  suppliers={filtered} 
                  countryMap={countryMap}
                  onEdit={openEdit} 
                  onDeactivate={handleDeactivate} 
                  busyId={busyId} 
                />
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <SupplierFormModal 
          supplier={editing} 
          countries={countries}
          onClose={closeModal} 
          onSave={handleSave} 
          saving={saving} 
        />
      )}

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

      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
    </>
  );
};

