import React, { useMemo, useEffect } from 'react';
import { useCategories } from '../../../hooks/useCategories';
import { useAuth } from '../../../providers/AuthProvider';
import { Category } from '../../../../domain/entities/Category';
import CategoriesTable from '../../categories/CategoriesTable';
import CategoryFormModal, { CategoryFormValues } from '../../categories/CategoryFormModal';
import ConfirmDialog from '../../shared/ConfirmDialog';
import Loader from '../../shared/Loader';
import Pagination from '../../shared/Pagination';
import { useEntityModal, useConfirmDialog, useListPagination } from '../../../hooks/shared';

interface CategoriesSectionProps {
  searchTerm: string;
  onToast: (type: 'success' | 'error', message: string) => void;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({ searchTerm, onToast }) => {
  const {
    categories,
    isLoading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    updateCategoryState,
    clearError,
  } = useCategories();

  const auth = useAuth();
  const modal = useEntityModal<Category>();
  const confirm = useConfirmDialog<Category>();

  // Filtrar y ordenar categorías
  const filteredCategories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let list = [...categories];
    if (term) {
      list = list.filter(c => 
        (c.name || '').toLowerCase().includes(term) || 
        (c.description || '').toLowerCase().includes(term)
      );
    }
    return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [categories, searchTerm]);

  // Paginación
  const pagination = useListPagination(filteredCategories, { pageSize: 10 });

  // Reset página cuando cambia búsqueda
  useEffect(() => {
    pagination.resetToFirstPage();
  }, [searchTerm]);

  // Cargar datos
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Mostrar errores
  useEffect(() => {
    if (error) {
      onToast('error', `Error cargando categorías: ${error}`);
      clearError();
    }
  }, [error, onToast, clearError]);

  const handleSubmit = async (values: CategoryFormValues) => {
    if (!auth.user) return;
    modal.setSubmitting(true);
    try {
      if (modal.modalState.mode === 'create') {
        const result = await createCategory({ 
          name: values.name, 
          description: values.description,
          userId: auth.user.id
        });
        if (result) {
          onToast('success', 'Categoría creada correctamente');
          modal.close();
        }
      } else if (modal.modalState.entity) {
        const result = await updateCategory(modal.modalState.entity.id, { 
          name: values.name, 
          description: values.description,
          user_id: auth.user.id
        });
        if (result) {
          onToast('success', 'Categoría actualizada correctamente');
          modal.close();
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar la categoría';
      onToast('error', message);
    } finally {
      modal.setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirm.dialogState.entity || !auth.user) return;
    const category = confirm.dialogState.entity;
    
    await confirm.executeWithLoading(async () => {
      const success = await updateCategoryState(category.id, auth.user!.id);
      if (success) {
        onToast('success', `Categoría "${category.name}" eliminada correctamente`);
      }
    }, category.id);
  };

  return (
    <div className="card shadow-xl ring-1 ring-black/5">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-lead-100 pb-4">
        <div>
          <h3 className="text-xl font-bold text-brand-900">Listado de categorías</h3>
          <p className="text-sm text-lead-500">{filteredCategories.length} categoría(s) encontradas.</p>
        </div>
        <button 
          type="button" 
          className="btn-primary bg-accent-500 hover:bg-accent-600 border-transparent text-white shadow-md flex items-center gap-2" 
          onClick={modal.openCreate}
        >
          Crear categoría
        </button>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <>
          <CategoriesTable
            categories={pagination.paginatedItems}
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

      <CategoryFormModal
        open={modal.modalState.isOpen}
        mode={modal.modalState.mode}
        initialData={modal.modalState.entity}
        submitting={modal.modalState.isSubmitting}
        onClose={modal.close}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={confirm.dialogState.isOpen}
        title="Eliminar categoría"
        confirmLabel="Eliminar"
        onConfirm={handleConfirmDelete}
        onCancel={confirm.closeConfirm}
        disabled={confirm.dialogState.isLoading}
      />
    </div>
  );
};

export default CategoriesSection;
