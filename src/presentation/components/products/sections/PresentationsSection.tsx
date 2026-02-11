import React, { useMemo, useEffect } from 'react';
import { usePresentations } from '../../../hooks/usePresentations';
import { useAuth } from '../../../providers/AuthProvider';
import { Presentation } from '../../../../domain/entities/Presentation';
import PresentationsTable from '../../presentations/PresentationsTable';
import PresentationFormModal, { PresentationFormValues } from '../../presentations/PresentationFormModal';
import ConfirmDialog from '../../shared/ConfirmDialog';
import Loader from '../../shared/Loader';
import Pagination from '../../shared/Pagination';
import { useEntityModal, useConfirmDialog, useListPagination } from '../../../hooks/shared';

interface PresentationsSectionProps {
  searchTerm: string;
  onToast: (type: 'success' | 'error', message: string) => void;
}

export const PresentationsSection: React.FC<PresentationsSectionProps> = ({ searchTerm, onToast }) => {
  const {
    presentations,
    isLoading,
    error,
    fetchPresentations,
    createPresentation,
    updatePresentation,
    updatePresentationState,
    clearError,
  } = usePresentations();

  const auth = useAuth();
  const modal = useEntityModal<Presentation>();
  const confirm = useConfirmDialog<Presentation>();

  // Filtrar y ordenar presentaciones
  const filteredPresentations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let list = [...presentations];
    if (term) {
      list = list.filter(p => (p.name || '').toLowerCase().includes(term));
    }
    return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [presentations, searchTerm]);

  // Paginación
  const pagination = useListPagination(filteredPresentations, { pageSize: 10 });

  // Reset página cuando cambia búsqueda
  useEffect(() => {
    pagination.resetToFirstPage();
  }, [searchTerm]);

  // Cargar datos
  useEffect(() => {
    fetchPresentations();
  }, [fetchPresentations]);

  // Mostrar errores
  useEffect(() => {
    if (error) {
      onToast('error', `Error cargando presentaciones: ${error}`);
      clearError();
    }
  }, [error, onToast, clearError]);

  const handleSubmit = async (values: PresentationFormValues) => {
    if (!auth.user) return;
    modal.setSubmitting(true);
    try {
      if (modal.modalState.mode === 'create') {
        const result = await createPresentation({ 
          name: values.name, 
          userId: auth.user.id
        });
        if (result) {
          onToast('success', 'Presentación creada correctamente');
          modal.close();
        }
      } else if (modal.modalState.entity) {
        const result = await updatePresentation(modal.modalState.entity.id, { 
          name: values.name, 
          user_id: auth.user.id
        });
        if (result) {
          onToast('success', 'Presentación actualizada correctamente');
          modal.close();
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar la presentación';
      onToast('error', message);
    } finally {
      modal.setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirm.dialogState.entity || !auth.user) return;
    const presentation = confirm.dialogState.entity;
    
    await confirm.executeWithLoading(async () => {
      const success = await updatePresentationState(presentation.id, auth.user!.id);
      if (success) {
        onToast('success', `Presentación "${presentation.name}" eliminada correctamente`);
      }
    }, presentation.id);
  };

  return (
    <div className="card shadow-xl ring-1 ring-black/5">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-lead-100 pb-4">
        <div>
          <h3 className="text-xl font-bold text-brand-900">Listado de presentaciones</h3>
          <p className="text-sm text-lead-500">{filteredPresentations.length} presentación(es) encontradas.</p>
        </div>
        <button 
          type="button" 
          className="btn-primary bg-accent-500 hover:bg-accent-600 border-transparent text-white shadow-md flex items-center gap-2" 
          onClick={modal.openCreate}
        >
          Crear presentación
        </button>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <>
          <PresentationsTable
            presentations={pagination.paginatedItems}
            onEdit={modal.openEdit}
            onDeactivate={confirm.openConfirm}
            busyId={confirm.busyId}
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

      <PresentationFormModal
        open={modal.modalState.isOpen}
        mode={modal.modalState.mode}
        initialData={modal.modalState.entity}
        submitting={modal.modalState.isSubmitting}
        onClose={modal.close}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={confirm.dialogState.isOpen}
        title="Eliminar presentación"
        confirmLabel="Eliminar"
        onConfirm={handleConfirmDelete}
        onCancel={confirm.closeConfirm}
        disabled={confirm.dialogState.isLoading}
      />
    </div>
  );
};

export default PresentationsSection;
