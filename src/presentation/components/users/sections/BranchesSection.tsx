import React, { useMemo, useEffect } from 'react';
import { useBranches } from '../../../hooks/useBranches';
import { Branch } from '../../../../domain/entities/Branch';
import BranchesTable from '../../branches/BranchesTable';
import BranchFormModal, { BranchFormValues } from '../../branches/BranchFormModal';
import ConfirmDialog from '../../shared/ConfirmDialog';
import Loader from '../../shared/Loader';
import Pagination from '../../shared/Pagination';
import { useEntityModal, useConfirmDialog, useListPagination } from '../../../hooks/shared';

interface BranchesSectionProps {
  searchTerm: string;
  onToast: (type: 'success' | 'error', message: string) => void;
}

export const BranchesSection: React.FC<BranchesSectionProps> = ({ searchTerm, onToast }) => {
  const {
    branches,
    isLoading,
    error,
    fetchBranches,
    createBranch,
    updateBranch,
    updateBranchState,
  } = useBranches();

  const modal = useEntityModal<Branch>();
  const confirm = useConfirmDialog<Branch>();

  const filteredBranches = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let list = [...branches];
    if (term) {
      list = list.filter(b => (b.name || '').toLowerCase().includes(term));
    }
    return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [branches, searchTerm]);

  const pagination = useListPagination(filteredBranches, { pageSize: 10 });

  useEffect(() => {
    pagination.resetToFirstPage();
  }, [searchTerm]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    if (error) {
      onToast('error', `Error cargando sucursales: ${error.message}`);
    }
  }, [error, onToast]);

  const handleSubmit = async (values: BranchFormValues) => {
    modal.setSubmitting(true);
    try {
      if (modal.modalState.mode === 'create') {
        const result = await createBranch({ name: values.name });
        if (result) {
          onToast('success', 'Sucursal creada correctamente');
          modal.close();
        }
      } else if (modal.modalState.entity) {
        const result = await updateBranch(modal.modalState.entity.id, { name: values.name });
        if (result) {
          onToast('success', 'Sucursal actualizada correctamente');
          modal.close();
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar la sucursal';
      onToast('error', message);
    } finally {
      modal.setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirm.dialogState.entity) return;
    const branch = confirm.dialogState.entity;

    await confirm.executeWithLoading(async () => {
      const success = await updateBranchState(branch.id, false);
      if (success) {
        onToast('success', `Sucursal "${branch.name}" eliminada correctamente`);
      }
    }, branch.id);
  };

  return (
    <div className="card shadow-xl ring-1 ring-black/5">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-lead-100 pb-4">
        <div>
          <h3 className="text-xl font-bold text-brand-900">Listado de sucursales</h3>
          <p className="text-sm text-lead-500">{filteredBranches.length} sucursal(es) encontradas.</p>
        </div>
        <button
          type="button"
          className="btn-primary bg-accent-500 hover:bg-accent-600 border-transparent text-white shadow-md flex items-center gap-2"
          onClick={modal.openCreate}
        >
          Crear sucursal
        </button>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <>
          <BranchesTable
            branches={pagination.paginatedItems}
            onEdit={modal.openEdit}
            onDelete={confirm.openConfirm}
          />
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={10}
              onPageChange={pagination.setPage}
              isLoading={isLoading}
            />
          )}
        </>
      )}

      <BranchFormModal
        open={modal.modalState.isOpen}
        mode={modal.modalState.mode}
        initialData={modal.modalState.entity}
        submitting={modal.modalState.isSubmitting}
        onClose={modal.close}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={confirm.dialogState.isOpen}
        title="Eliminar sucursal"
        confirmLabel="Eliminar"
        onConfirm={handleConfirmDelete}
        onCancel={confirm.closeConfirm}
        disabled={confirm.dialogState.isLoading}
      />
    </div>
  );
};

export default BranchesSection;
