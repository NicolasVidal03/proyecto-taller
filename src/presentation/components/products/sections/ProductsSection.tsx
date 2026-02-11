import React, { useMemo, useEffect } from 'react';
import { useProducts } from '../../../hooks/useProducts';
import { useCategories } from '../../../hooks/useCategories';
import { useBrands } from '../../../hooks/useBrands';
import { usePresentations } from '../../../hooks/usePresentations';
import { useColors } from '../../../hooks/useColors';
import { useAuth } from '../../../providers/AuthProvider';
import { useDebounce } from '../../../hooks/useDebounce';
import { Product } from '../../../../domain/entities/Product';
import ProductsTable from '../ProductsTable';
import ProductFormModal, { ProductFormValues } from '../ProductFormModal';
import ProductDetailsModal from '../ProductDetailsModal';
import ConfirmDialog from '../../shared/ConfirmDialog';
import Loader from '../../shared/Loader';
import Pagination from '../../shared/Pagination';
import { useEntityModal, useConfirmDialog } from '../../../hooks/shared';

interface ProductsSectionProps {
  searchTerm: string;
  categoryFilter: number | 'all';
  brandFilter: number | 'all';
  onToast: (type: 'success' | 'error', message: string) => void;
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({ 
  searchTerm, 
  categoryFilter, 
  brandFilter,
  onToast 
}) => {
  const {
    products,
    isLoading,
    error,
    page,
    total,
    totalPages,
    goToPage,
    applyFilters,
    createProduct,
    updateProduct,
    updateProductState,
    clearError,
  } = useProducts();

  const { categories, categoryMap, fetchCategories } = useCategories();
  const { brands, brandMap, fetchBrands } = useBrands();
  const { presentations, presentationMap, fetchPresentations } = usePresentations();
  const { colors, colorMap, fetchColors } = useColors();

  const auth = useAuth();
  const modal = useEntityModal<Product>();
  const confirm = useConfirmDialog<Product>();
  
  const [viewProduct, setViewProduct] = React.useState<Product | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Ordenar productos
  const sortedProducts = useMemo(() => {
    const safeProducts = Array.isArray(products) ? products.filter(Boolean) : [];
    return [...safeProducts].sort((a, b) => 
      (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase())
    );
  }, [products]);

  // Cargar datos auxiliares
  useEffect(() => {
    Promise.all([fetchCategories(), fetchBrands(), fetchPresentations(), fetchColors()]);
  }, [fetchCategories, fetchBrands, fetchPresentations, fetchColors]);

  // Aplicar filtros
  useEffect(() => {
    const filters: { search?: string; categoryId?: number; brandId?: number } = {};
    if (debouncedSearch.trim()) {
      filters.search = debouncedSearch.trim();
    }
    if (categoryFilter !== 'all') {
      filters.categoryId = categoryFilter;
    }
    if (brandFilter !== 'all') {
      filters.brandId = brandFilter;
    }
    applyFilters(filters);
  }, [debouncedSearch, categoryFilter, brandFilter, applyFilters]);

  // Mostrar errores
  useEffect(() => {
    if (error) {
      onToast('error', error);
      clearError();
    }
  }, [error, onToast, clearError]);

  const handleSubmit = async (values: ProductFormValues) => {
    if (!auth.user) return;
    modal.setSubmitting(true);
    try {
      if (modal.modalState.mode === 'create') {
        const result = await createProduct({
          name: values.name,
          barcode: values.barcode,
          internalCode: values.internalCode,
          presentationId: values.presentationId,
          colorId: values.colorId,
          prices: values.prices,
          imageFile: (values as any).imageFile,
          categoryId: values.categoryId,
          brandId: values.brandId,
          userId: auth.user.id,
        });
        if (result) {
          onToast('success', 'Producto creado correctamente');
          modal.close();
        }
      } else if (modal.modalState.entity) {
        const result = await updateProduct(modal.modalState.entity.id, {
          name: values.name,
          barcode: values.barcode,
          internalCode: values.internalCode,
          presentationId: values.presentationId,
          colorId: values.colorId,
          prices: values.prices,
          imageFile: (values as any).imageFile,
          categoryId: values.categoryId,
          brandId: values.brandId,
        });
        if (result) {
          onToast('success', 'Producto actualizado correctamente');
          modal.close();
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar el producto';
      onToast('error', message);
    } finally {
      modal.setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirm.dialogState.entity || !auth.user) return;
    const product = confirm.dialogState.entity;
    
    await confirm.executeWithLoading(async () => {
      const success = await updateProductState(product.id, auth.user!.id);
      if (success) {
        onToast('success', `Producto "${product.name}" eliminado correctamente`);
      }
    }, product.id);
  };

  return (
    <div className="card shadow-xl ring-1 ring-black/5">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-lead-100 pb-4">
        <div>
          <h3 className="text-xl font-bold text-brand-900">Listado de productos</h3>
          <p className="text-sm text-lead-500">
            {totalPages > 0 && `Página ${page} de ${totalPages} • `}
            {total.toLocaleString()} producto(s) total
            {(debouncedSearch || categoryFilter !== 'all' || brandFilter !== 'all') && ' (filtrados)'}
          </p>
        </div>
        <button 
          type="button" 
          className="btn-primary bg-accent-500 hover:bg-accent-600 border-transparent text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" 
          onClick={modal.openCreate}
        >
          Crear producto
        </button>
      </div>

      {isLoading && products.length === 0 ? (
        <Loader />
      ) : (
        <>
          <ProductsTable
            products={sortedProducts}
            categoryMap={categoryMap}
            brandMap={brandMap}
            presentationMap={presentationMap}
            colorMap={colorMap}
            onEdit={modal.openEdit}
            onDeactivate={confirm.openConfirm}
            onView={(product) => setViewProduct(product)}
            busyId={confirm.busyId}
          />
          {totalPages > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={total}
                itemsPerPage={10}
                onPageChange={goToPage}
                isLoading={isLoading}
              />
            </div>
          )}
        </>
      )}

      <ProductFormModal
        open={modal.modalState.isOpen}
        mode={modal.modalState.mode}
        initialData={modal.modalState.entity}
        categories={categories}
        brands={brands}
        presentations={presentations}
        colors={colors}
        submitting={modal.modalState.isSubmitting}
        onClose={modal.close}
        onSubmit={handleSubmit}
      />

      {viewProduct && (
        <ProductDetailsModal 
          product={viewProduct} 
          presentationMap={presentationMap}
          colorMap={colorMap}
          onClose={() => setViewProduct(null)} 
        />
      )}

      <ConfirmDialog
        open={confirm.dialogState.isOpen}
        title="Eliminar producto"
        confirmLabel="Eliminar"
        onConfirm={handleConfirmDelete}
        onCancel={confirm.closeConfirm}
        disabled={confirm.dialogState.isLoading}
      />
    </div>
  );
};

export default ProductsSection;
