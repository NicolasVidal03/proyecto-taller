import { useState, useCallback } from 'react';
import { Product } from '../../domain/entities/Product';
import { CreateProductDTO, UpdateProductDTO, ProductFilters } from '../../domain/ports/IProductRepository';
import { container } from '../../infrastructure/config/container';

export interface UseProductsReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  loadMoreProducts: (filters?: ProductFilters) => Promise<void>;
  resetProducts: () => void;
  fetchProductById: (id: number) => Promise<Product | null>;
  createProduct: (data: CreateProductDTO) => Promise<Product | null>;
  updateProduct: (id: number, data: UpdateProductDTO) => Promise<Product | null>;
  updateProductState: (id: number, userId: number) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;
  clearError: () => void;
}

export const useProducts = (): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchProducts = useCallback(async (filters?: ProductFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const paginatedResult = await container.products.getAll({ ...filters, page: 1, limit: 10 });
      setProducts(paginatedResult.data);
      setPage(1);
      setHasMore(paginatedResult.page < paginatedResult.totalPages);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar productos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMoreProducts = useCallback(async (filters?: ProductFilters) => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);
    const nextPage = page + 1;
    try {
      const paginatedResult = await container.products.getAll({ ...filters, page: nextPage, limit: 10 });
      setProducts(prev => [...prev, ...paginatedResult.data]);
      setPage(nextPage);
      setHasMore(nextPage < paginatedResult.totalPages);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar más productos');
    } finally {
      setIsLoading(false);
    }
  }, [page, hasMore, isLoading]);

  const resetProducts = useCallback(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
  }, []);

  const fetchProductById = useCallback(async (id: number): Promise<Product | null> => {
    setError(null);
    try {
      return await container.products.getById(id);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar producto');
      return null;
    }
  }, []);

  const createProduct = useCallback(async (data: CreateProductDTO): Promise<Product | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const newProduct = await container.products.create(data);
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (err: any) {
      setError(err?.message || 'Error al crear producto');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProduct = useCallback(async (id: number, data: UpdateProductDTO): Promise<Product | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await container.products.update(id, data);
      setProducts(prev => prev.map(p => (p.id === id ? updated : p)));
      return updated;
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar producto');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProductState = useCallback(async (id: number, userId: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await container.products.updateState(id, userId);
      setProducts(prev => {
        const found = prev.find(p => p.id === id);
        if (!found) return prev;
        // If currently active -> user is deactivating -> remove from list
        if (found.state) {
          return prev.filter(p => p.id !== id);
        }
        // If currently inactive -> activation -> set state true
        return prev.map(p => (p.id === id ? { ...p, state: true } : p));
      });
      return true;
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar estado');
      return false;
    }
  }, []);

  const deleteProduct = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await container.products.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar producto');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    products,
    isLoading,
    error,
    page,
    hasMore,
    fetchProducts,
    loadMoreProducts,
    resetProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    updateProductState,
    deleteProduct,
    clearError,
  };
};
