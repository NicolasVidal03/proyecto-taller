import { useCallback, useState } from 'react';
import { Product } from '../../domain/entities/Product';
import { CreateProductDTO, UpdateProductDTO, ProductFilters } from '../../domain/ports/IProductRepository';
import { container } from '../../infrastructure/config/container';
import { usePagination, extractErrorMessage } from './shared';

export interface UseProductsReturn {
  // Datos
  products: Product[];
  
  // Paginación
  page: number;
  total: number;
  totalPages: number;
  goToPage: (page: number) => Promise<void>;
  applyFilters: (filters?: ProductFilters) => Promise<void>;
  refreshCurrentPage: () => Promise<void>;
  
  // Estado
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  clearCache: () => void;
  
  // CRUD
  fetchProductById: (id: number) => Promise<Product | null>;
  createProduct: (data: CreateProductDTO) => Promise<Product | null>;
  updateProduct: (id: number, data: UpdateProductDTO) => Promise<Product | null>;
  updateProductState: (id: number, userId: number) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;
}

const LIMIT = 10;

export const useProducts = (): UseProductsReturn => {
  const [crudLoading, setCrudLoading] = useState(false);
  const [crudError, setCrudError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (filters: ProductFilters, page: number, limit: number) => {
    const result = await container.products.getAll({ ...filters, page, limit });
    return {
      data: result.data,
      total: result.total,
      totalPages: result.totalPages,
    };
  }, []);

  // Usar hook genérico de paginación
  const {
    items: products,
    pagination,
    isLoading: paginationLoading,
    error: paginationError,
    goToPage,
    applyFilters,
    refreshCurrentPage,
    clearError: clearPaginationError,
    clearCache,
  } = usePagination<Product, ProductFilters>({
    fetchFn: fetchProducts,
    limit: LIMIT,
  });

  // ========== CRUD Operations ==========

  const fetchProductById = useCallback(async (id: number): Promise<Product | null> => {
    setCrudError(null);
    try {
      return await container.products.getById(id);
    } catch (err) {
      setCrudError(extractErrorMessage(err));
      return null;
    }
  }, []);

  const createProduct = useCallback(async (data: CreateProductDTO): Promise<Product | null> => {
    setCrudLoading(true);
    setCrudError(null);
    try {
      const newProduct = await container.products.create(data);
      clearCache();
      await applyFilters(); // Volver a página 1
      return newProduct;
    } catch (err) {
      setCrudError(extractErrorMessage(err));
      return null;
    } finally {
      setCrudLoading(false);
    }
  }, [clearCache, applyFilters]);

  const updateProduct = useCallback(async (id: number, data: UpdateProductDTO): Promise<Product | null> => {
    setCrudLoading(true);
    setCrudError(null);
    try {
      const updated = await container.products.update(id, data);
      clearCache();
      await refreshCurrentPage();
      return updated;
    } catch (err) {
      setCrudError(extractErrorMessage(err));
      return null;
    } finally {
      setCrudLoading(false);
    }
  }, [clearCache, refreshCurrentPage]);

  const updateProductState = useCallback(async (id: number, userId: number): Promise<boolean> => {
    setCrudLoading(true);
    setCrudError(null);
    try {
      await container.products.updateState(id, userId);
      clearCache();
      await refreshCurrentPage();
      return true;
    } catch (err) {
      setCrudError(extractErrorMessage(err));
      return false;
    } finally {
      setCrudLoading(false);
    }
  }, [clearCache, refreshCurrentPage]);

  const deleteProduct = useCallback(async (id: number): Promise<boolean> => {
    setCrudLoading(true);
    setCrudError(null);
    try {
      await container.products.delete(id);
      clearCache();
      await refreshCurrentPage();
      return true;
    } catch (err) {
      setCrudError(extractErrorMessage(err));
      return false;
    } finally {
      setCrudLoading(false);
    }
  }, [clearCache, refreshCurrentPage]);

  // ========== Combinación de estados ==========

  const clearError = useCallback(() => {
    clearPaginationError();
    setCrudError(null);
  }, [clearPaginationError]);

  return {
    products,
    page: pagination.page,
    total: pagination.total,
    totalPages: pagination.totalPages,
    goToPage,
    applyFilters,
    refreshCurrentPage,
    isLoading: paginationLoading || crudLoading,
    error: paginationError || crudError,
    clearError,
    clearCache,
    fetchProductById,
    createProduct,
    updateProduct,
    updateProductState,
    deleteProduct,
  };
};
