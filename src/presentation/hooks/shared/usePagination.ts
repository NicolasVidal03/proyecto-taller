import { useState, useCallback, useRef } from 'react';

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedData<T> {
  data: T[];
  total: number;
  totalPages: number;
  page?: number;
}

export interface CacheEntry<T> {
  data: T[];
  total: number;
  totalPages: number;
}

export interface UsePaginationOptions {
  limit?: number;
}

export interface UsePaginationReturn<T, F> {
  // Estado
  items: T[];
  pagination: PaginationState;
  isLoading: boolean;
  error: string | null;
  
  // Acciones de paginación
  goToPage: (page: number) => Promise<void>;
  applyFilters: (filters?: F) => Promise<void>;
  refreshCurrentPage: () => Promise<void>;
  
  // Utilidades
  clearError: () => void;
  clearCache: () => void;
  getCurrentFilters: () => F;
}

interface UsePaginationConfig<T, F> {
  /**
   * Función que realiza el fetch de datos
   */
  fetchFn: (filters: F, page: number, limit: number) => Promise<PaginatedData<T>>;
  /**
   * Límite de items por página
   */
  limit?: number;
  /**
   * Filtros iniciales
   */
  initialFilters?: F;
}

/**
 * Hook genérico para manejo de paginación con caché
 */
export function usePagination<T, F = Record<string, unknown>>(
  config: UsePaginationConfig<T, F>
): UsePaginationReturn<T, F> {
  const { fetchFn, limit = 10, initialFilters = {} as F } = config;

  const [items, setItems] = useState<T[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Caché de páginas
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());
  const currentFiltersRef = useRef<F>(initialFilters);

  const getCacheKey = useCallback((filters: F, page: number): string => {
    return JSON.stringify({ ...filters, page, limit });
  }, [limit]);

  const fetchPage = useCallback(async (
    pageNum: number, 
    filters: F, 
    forceRefresh = false
  ) => {
    const cacheKey = getCacheKey(filters, pageNum);
    
    // Usar caché si existe y no es refresh forzado
    if (!forceRefresh && cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey)!;
      setItems(cached.data);
      setPagination(prev => ({
        ...prev,
        page: pageNum,
        total: cached.total,
        totalPages: cached.totalPages,
      }));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchFn(filters, pageNum, limit);
      
      // Defensa contra respuestas nulas o mal formadas
      const data = result?.data || [];
      const total = result?.total || 0;
      const totalPages = result?.totalPages || 0;

      // Guardar en caché
      cacheRef.current.set(cacheKey, {
        data,
        total,
        totalPages,
      });

      setItems(data);
      setPagination(prev => ({
        ...prev,
        page: pageNum,
        total,
        totalPages,
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, getCacheKey, limit]);

  const applyFilters = useCallback(async (filters?: F) => {
    cacheRef.current.clear();
    currentFiltersRef.current = filters || {} as F;
    await fetchPage(1, currentFiltersRef.current);
  }, [fetchPage]);

  const goToPage = useCallback(async (pageNum: number) => {
    if (pageNum < 1 || (pagination.totalPages > 0 && pageNum > pagination.totalPages)) {
      return;
    }
    await fetchPage(pageNum, currentFiltersRef.current);
  }, [fetchPage, pagination.totalPages]);

  const refreshCurrentPage = useCallback(async () => {
    await fetchPage(pagination.page, currentFiltersRef.current, true);
  }, [fetchPage, pagination.page]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getCurrentFilters = useCallback(() => {
    return currentFiltersRef.current;
  }, []);

  return {
    items,
    pagination,
    isLoading,
    error,
    goToPage,
    applyFilters,
    refreshCurrentPage,
    clearError,
    clearCache,
    getCurrentFilters,
  };
}
