import React, { useMemo, useEffect } from 'react';
import { useBrands } from '../../../hooks/useBrands';
import { useAuth } from '../../../providers/AuthProvider';
import { Brand } from '../../../../domain/entities/Brand';
import BrandsTable from '../../brands/BrandsTable';
import BrandFormModal, { BrandFormValues } from '../../brands/BrandFormModal';
import ConfirmDialog from '../../shared/ConfirmDialog';
import Loader from '../../shared/Loader';
import Pagination from '../../shared/Pagination';
import { useEntityModal, useConfirmDialog, useListPagination } from '../../../hooks/shared';

interface BrandsSectionProps {
  searchTerm: string;
  onToast: (type: 'success' | 'error', message: string) => void;
}

export const BrandsSection: React.FC<BrandsSectionProps> = ({ searchTerm, onToast }) => {
  const {
    brands,
    isLoading,
    error,
    fetchBrands,
    createBrand,
    updateBrand,
    updateBrandState,
    clearError,
  } = useBrands();

  const auth = useAuth();
  const modal = useEntityModal<Brand>();
  const confirm = useConfirmDialog<Brand>();


  const filteredBrands = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let list = [...brands];
    if (term) {
      list = list.filter(b => (b.name || '').toLowerCase().includes(term));
    }
    return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [brands, searchTerm]);


  const pagination = useListPagination(filteredBrands, { pageSize: 10 });

  
  useEffect(() => {
    pagination.resetToFirstPage();
  }, [searchTerm]);

  // Cargar datos
  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  // Mostrar errores
  useEffect(() => {
    if (error) {
      onToast('error', `Error cargando marcas: ${error}`);
      clearError();
    }
  }, [error, onToast, clearError]);

  const handleSubmit = async (values: BrandFormValues) => {
    if (!auth.user) return;
    modal.setSubmitting(true);
    try {
      if (modal.modalState.mode === 'create') {
        const result = await createBrand({ name: values.name, userId: auth.user.id });
        if (result) {
          onToast('success', 'Marca creada correctamente');
          modal.close();
        }
      } else if (modal.modalState.entity) {
        const result = await updateBrand(modal.modalState.entity.id, { name: values.name });
        if (result) {
          onToast('success', 'Marca actualizada correctamente');
          modal.close();
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar la marca';
      onToast('error', message);
    } finally {
      modal.setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirm.dialogState.entity || !auth.user) return;
    const brand = confirm.dialogState.entity;
    
    await confirm.executeWithLoading(async () => {
      const success = await updateBrandState(brand.id, auth.user!.id);
      if (success) {
        onToast('success', `Marca "${brand.name}" eliminada correctamente`);
      }
    }, brand.id);
  };

  return (
    <div className="card shadow-xl ring-1 ring-black/5">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-lead-100 pb-4">
        <div>
          <h3 className="text-xl font-bold text-brand-900">Listado de marcas</h3>
          <p className="text-sm text-lead-500">{filteredBrands.length} marca(s) encontradas.</p>
        </div>
        <button 
          type="button" 
          className="btn-primary bg-accent-500 hover:bg-accent-600 border-transparent text-white shadow-md flex items-center gap-2" 
          onClick={modal.openCreate}
        >
          Crear marca
        </button>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <>
          <BrandsTable
            brands={pagination.paginatedItems}
            onEdit={modal.openEdit}
            onDelete={confirm.openConfirm}
            busyBrandId={confirm.busyId}
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

      <BrandFormModal
        open={modal.modalState.isOpen}
        mode={modal.modalState.mode}
        initialData={modal.modalState.entity}
        submitting={modal.modalState.isSubmitting}
        onClose={modal.close}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={confirm.dialogState.isOpen}
        title="Eliminar marca"
        confirmLabel="Eliminar"
        onConfirm={handleConfirmDelete}
        onCancel={confirm.closeConfirm}
        disabled={confirm.dialogState.isLoading}
      />
    </div>
  );
};

export default BrandsSection;
