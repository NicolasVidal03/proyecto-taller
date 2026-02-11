import React, { useMemo, useEffect } from 'react';
import { useColors } from '../../../hooks/useColors';
import { useAuth } from '../../../providers/AuthProvider';
import { Color } from '../../../../domain/entities/Color';
import ColorsTable from '../../colors/ColorsTable';
import ColorFormModal, { ColorFormValues } from '../../colors/ColorFormModal';
import ConfirmDialog from '../../shared/ConfirmDialog';
import Loader from '../../shared/Loader';
import Pagination from '../../shared/Pagination';
import { useEntityModal, useConfirmDialog, useListPagination } from '../../../hooks/shared';

interface ColorsSectionProps {
  searchTerm: string;
  onToast: (type: 'success' | 'error', message: string) => void;
}

export const ColorsSection: React.FC<ColorsSectionProps> = ({ searchTerm, onToast }) => {
  const {
    colors,
    isLoading,
    error,
    fetchColors,
    createColor,
    updateColor,
    updateColorState,
    clearError,
  } = useColors();

  const auth = useAuth();
  const modal = useEntityModal<Color>();
  const confirm = useConfirmDialog<Color>();

  // Filtrar y ordenar colores
  const filteredColors = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let list = [...colors];
    if (term) {
      list = list.filter(c => (c.name || '').toLowerCase().includes(term));
    }
    return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [colors, searchTerm]);

  // Paginación
  const pagination = useListPagination(filteredColors, { pageSize: 10 });

  // Reset página cuando cambia búsqueda
  useEffect(() => {
    pagination.resetToFirstPage();
  }, [searchTerm]);

  // Cargar datos
  useEffect(() => {
    fetchColors();
  }, [fetchColors]);

  // Mostrar errores
  useEffect(() => {
    if (error) {
      onToast('error', `Error cargando colores: ${error}`);
      clearError();
    }
  }, [error, onToast, clearError]);

  const handleSubmit = async (values: ColorFormValues) => {
    if (!auth.user) return;
    modal.setSubmitting(true);
    try {
      if (modal.modalState.mode === 'create') {
        const result = await createColor({ 
          name: values.name, 
          userId: auth.user.id
        });
        if (result) {
          onToast('success', 'Color creado correctamente');
          modal.close();
        }
      } else if (modal.modalState.entity) {
        const result = await updateColor(modal.modalState.entity.id, { 
          name: values.name, 
          user_id: auth.user.id
        });
        if (result) {
          onToast('success', 'Color actualizado correctamente');
          modal.close();
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar el color';
      onToast('error', message);
    } finally {
      modal.setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirm.dialogState.entity || !auth.user) return;
    const color = confirm.dialogState.entity;
    
    await confirm.executeWithLoading(async () => {
      const success = await updateColorState(color.id, auth.user!.id);
      if (success) {
        onToast('success', `Color "${color.name}" eliminado correctamente`);
      }
    }, color.id);
  };

  return (
    <div className="card shadow-xl ring-1 ring-black/5">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-lead-100 pb-4">
        <div>
          <h3 className="text-xl font-bold text-brand-900">Listado de colores</h3>
          <p className="text-sm text-lead-500">{filteredColors.length} color(es) encontrados.</p>
        </div>
        <button 
          type="button" 
          className="btn-primary bg-accent-500 hover:bg-accent-600 border-transparent text-white shadow-md flex items-center gap-2" 
          onClick={modal.openCreate}
        >
          Crear color
        </button>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <>
          <ColorsTable
            colors={pagination.paginatedItems}
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

      <ColorFormModal
        open={modal.modalState.isOpen}
        mode={modal.modalState.mode}
        initialData={modal.modalState.entity}
        submitting={modal.modalState.isSubmitting}
        onClose={modal.close}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={confirm.dialogState.isOpen}
        title="Eliminar color"
        confirmLabel="Eliminar"
        onConfirm={handleConfirmDelete}
        onCancel={confirm.closeConfirm}
        disabled={confirm.dialogState.isLoading}
      />
    </div>
  );
};

export default ColorsSection;
