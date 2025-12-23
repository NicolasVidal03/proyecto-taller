import React, { useCallback, useEffect, useState } from 'react';
import { useBranches } from '../hooks/useBranches';
import Loader from '../components/shared/Loader';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import { ToastContainer, useToast } from '../components/shared/Toast';
import BranchesTable from '../components/branches/BranchesTable';
import BranchFormModal, { BranchFormValues } from '../components/branches/BranchFormModal';
import { Branch } from '../../domain/entities/Branch';

export const BranchesPage: React.FC = () => {
  const {
    branches,
    isLoading,
    error,
    fetchBranches,
    createBranch,
    updateBranch,
    updateBranchState,
    clearError,
  } = useBranches();

  const toast = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [targetBranch, setTargetBranch] = useState<Branch | null>(null);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    if (error) {
      toast.error(error.message);
      clearError();
    }
  }, [error, toast, clearError]);

  const openCreateModal = () => {
    setFormMode('create');
    setEditingBranch(null);
    setFormOpen(true);
  };

  const openEditModal = (branch: Branch) => {
    setFormMode('edit');
    setEditingBranch(branch);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (formSubmitting) return;
    setFormOpen(false);
    setEditingBranch(null);
  };

  const handleSubmit = async (values: BranchFormValues) => {
    setFormSubmitting(true);
    try {
      if (formMode === 'create') {
        const result = await createBranch({
          name: values.name,
        });
        if (result) {
          toast.success('Sucursal creada correctamente');
          setFormOpen(false);
        }
      } else if (editingBranch) {
        const result = await updateBranch(editingBranch.id, {
          name: values.name,
        });
        if (result) {
          toast.success('Sucursal actualizada correctamente');
          setFormOpen(false);
          setEditingBranch(null);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar la sucursal';
      toast.error(message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const openConfirm = (branch: Branch) => {
    setTargetBranch(branch);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (confirmLoading) return;
    setConfirmOpen(false);
    setTargetBranch(null);
  };

  const executeConfirm = async () => {
    if (!targetBranch) return;
    setConfirmLoading(true);
    try {
      const success = await updateBranchState(targetBranch.id, false);
      if (success) {
        toast.success(`Sucursal "${targetBranch.name}" eliminada correctamente`);
      }
      setConfirmOpen(false);
      setTargetBranch(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Acción no completada';
      toast.error(message);
    } finally {
      setConfirmLoading(false);
    }
  };

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
                <p className="text-xs uppercase tracking-[0.45em] text-white/70">Panel de Sucursales</p>
                <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                  Gestiona las sucursales de la empresa
                </h2>
              </div>
            </div>
          </section>

          {/* Main Content */}
          <section className="grid gap-8 xl:grid-cols-[1fr]">
            <div className="card shadow-xl ring-1 ring-black/5">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-lead-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-brand-900">Listado de sucursales</h3>
                  <p className="text-sm text-lead-500">{branches.length} sucursal(es) registradas.</p>
                </div>
                <button 
                  type="button" 
                  className="btn-primary bg-accent-500 hover:bg-accent-600 border-transparent text-white shadow-md flex items-center gap-2" 
                  onClick={openCreateModal}
                >
                  Crear sucursal
                </button>
              </div>
              {isLoading ? (
                <Loader />
              ) : (
                <BranchesTable
                  branches={branches}
                  onEdit={openEditModal}
                  onDelete={openConfirm}
                />
              )}
            </div>
          </section>
        </div>
      </div>

      <BranchFormModal
        open={formOpen}
        mode={formMode}
        initialData={editingBranch}
        submitting={formSubmitting}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar sucursal"
        confirmLabel="Eliminar"
        onConfirm={executeConfirm}
        onCancel={closeConfirm}
        disabled={confirmLoading}
      />

      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
    </>
  );
};
