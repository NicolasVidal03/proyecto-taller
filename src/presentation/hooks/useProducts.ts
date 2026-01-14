import { useState, useCallback, useRef } from 'react';
import { Product } from '../../domain/entities/Product';
import { CreateProductDTO, UpdateProductDTO, ProductFilters } from '../../domain/ports/IProductRepository';
import { container } from '../../infrastructure/config/container';

export interface UseProductsReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  page: number;
  total: number;
  totalPages: number;
  goToPage: (page: number) => Promise<void>;
  applyFilters: (filters?: ProductFilters) => Promise<void>;
  refreshCurrentPage: () => Promise<void>;
  fetchProductById: (id: number) => Promise<Product | null>;
  createProduct: (data: CreateProductDTO) => Promise<Product | null>;
  updateProduct: (id: number, data: UpdateProductDTO) => Promise<Product | null>;
  updateProductState: (id: number, userId: number) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;
  clearError: () => void;
  clearCache: () => void;
}

const LIMIT = 10;

const getCacheKey = (filters: ProductFilters, page: number): string => {
  return JSON.stringify({ ...filters, page, limit: LIMIT });
};

export const useProducts = (): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const cacheRef = useRef<Map<string, { data: Product[]; total: number; totalPages: number }>>(new Map());
  const currentFiltersRef = useRef<ProductFilters>({});

  const fetchPage = useCallback(async (pageNum: number, filters: ProductFilters, forceRefresh = false) => {
    const cacheKey = getCacheKey(filters, pageNum);
    if (!forceRefresh && cacheRef.current.has(cacheKey)) {
      console.log(`🟢 ¡BINGO! Usando caché para: ${cacheKey}`);
      const cached = cacheRef.current.get(cacheKey)!;
      setProducts(cached.data);
      setPage(pageNum);
      setTotal(cached.total);
      setTotalPages(cached.totalPages);
      return;
    }
    console.log(`🔴 NO hay caché (o forzaste refresh). Llamando API para: ${cacheKey}`);

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await container.products.getAll({ ...filters, page: pageNum, limit: LIMIT });
      cacheRef.current.set(cacheKey, {
        data: result.data,
        total: result.total,
        totalPages: result.totalPages,
      });
      
      setProducts(result.data);
      setPage(pageNum);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar productos');
    } finally {
      setIsLoading(false);
    }
  }, []);

 
  const applyFilters = useCallback(async (filters?: ProductFilters) => {
    cacheRef.current.clear();
    currentFiltersRef.current = filters || {};
    await fetchPage(1, currentFiltersRef.current);
  }, [fetchPage]);


  const goToPage = useCallback(async (pageNum: number) => {
    if (pageNum < 1 || (totalPages > 0 && pageNum > totalPages)) return;
    await fetchPage(pageNum, currentFiltersRef.current);
  }, [fetchPage, totalPages]);


  const refreshCurrentPage = useCallback(async () => {
    await fetchPage(page, currentFiltersRef.current, true);
  }, [fetchPage, page]);

  
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
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
      cacheRef.current.clear();
      await fetchPage(1, currentFiltersRef.current, true);
      return newProduct;
    } catch (err: any) {
      setError(err?.message || 'Error al crear producto');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchPage]);

  const updateProduct = useCallback(async (id: number, data: UpdateProductDTO): Promise<Product | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await container.products.update(id, data);
      setProducts(prev => prev.map(p => (p.id === id ? updated : p)));
      const cacheKey = getCacheKey(currentFiltersRef.current, page);
      const cached = cacheRef.current.get(cacheKey);
      if (cached) {
        cached.data = cached.data.map(p => (p.id === id ? updated : p));
      }
      
      return updated;
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar producto');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  const updateProductState = useCallback(async (id: number, userId: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await container.products.updateState(id, userId);
      cacheRef.current.clear();
      await fetchPage(page, currentFiltersRef.current, true);
      return true;
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar estado');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchPage, page]);

  const deleteProduct = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await container.products.delete(id);
      cacheRef.current.clear();
      await fetchPage(page, currentFiltersRef.current, true);
      return true;
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar producto');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchPage, page]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    products,
    isLoading,
    error,
    page,
    total,
    totalPages,
    goToPage,
    applyFilters,
    refreshCurrentPage,
    fetchProductById,
    createProduct,
    updateProduct,
    updateProductState,
    deleteProduct,
    clearError,
    clearCache,
  };
};
