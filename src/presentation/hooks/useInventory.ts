import { useState, useCallback, useRef } from 'react';
import { ProductWithBranchInfo, BranchProductsFilters } from '../../domain/entities/ProductBranch';
import { UpdateStockDTO, UpdateStockResponse } from '../../domain/ports/IProductBranchRepository';
import { container } from '../../infrastructure/config/container';

export interface UseInventoryReturn {
  inventory: ProductWithBranchInfo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
  goToPage: (page: number) => Promise<void>;
  applyFilters: (branchId: number, filters?: BranchProductsFilters) => Promise<void>;
  refreshCurrentPage: () => Promise<void>;
  setStock: (productId: number, branchId: number, data: UpdateStockDTO) => Promise<UpdateStockResponse | null>;
  clearError: () => void;
  clearCache: () => void;
}

const LIMIT = 10;

// Clave para el caché basada en branchId, filtros y página
const getCacheKey = (branchId: number, filters: BranchProductsFilters, page: number): string => {
  return JSON.stringify({ branchId, ...filters, page, limit: LIMIT });
};

export const useInventory = (): UseInventoryReturn => {
  const [inventory, setInventory] = useState<ProductWithBranchInfo[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: LIMIT,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Caché de páginas
  const cacheRef = useRef<Map<string, { 
    data: ProductWithBranchInfo[]; 
    total: number; 
    totalPages: number 
  }>>(new Map());
  
  // Guardar estado actual
  const currentBranchIdRef = useRef<number>(0);
  const currentFiltersRef = useRef<BranchProductsFilters>({});

  // Función interna para fetch con caché
  const fetchPage = useCallback(async (
    branchId: number, 
    filters: BranchProductsFilters, 
    pageNum: number, 
    forceRefresh = false
  ) => {
    const cacheKey = getCacheKey(branchId, filters, pageNum);
    
    // Si está en caché y no es refresh forzado, usar caché
    if (!forceRefresh && cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey)!;
      setInventory(cached.data);
      setPagination({
        page: pageNum,
        limit: LIMIT,
        total: cached.total,
        totalPages: cached.totalPages,
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await container.productBranches.getByBranchPaginated(branchId, {
        ...filters,
        page: pageNum,
        limit: LIMIT,
      });
      
      // Guardar en caché
      cacheRef.current.set(cacheKey, {
        data: result.data,
        total: result.total,
        totalPages: result.totalPages,
      });
      
      setInventory(result.data);
      setPagination({
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (err: any) {
      setError(err?.message || 'Error al cargar inventario');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Aplicar nuevos filtros (limpia caché y va a página 1)
  const applyFilters = useCallback(async (branchId: number, filters?: BranchProductsFilters) => {
    // Limpiar caché cuando cambian los filtros o la sucursal
    cacheRef.current.clear();
    currentBranchIdRef.current = branchId;
    currentFiltersRef.current = filters || {};
    await fetchPage(branchId, currentFiltersRef.current, 1);
  }, [fetchPage]);

  // Ir a una página específica (usa caché si existe)
  const goToPage = useCallback(async (pageNum: number) => {
    if (pageNum < 1 || (pagination.totalPages > 0 && pageNum > pagination.totalPages)) return;
    if (currentBranchIdRef.current === 0) return;
    await fetchPage(currentBranchIdRef.current, currentFiltersRef.current, pageNum);
  }, [fetchPage, pagination.totalPages]);

  // Refrescar página actual (fuerza re-fetch)
  const refreshCurrentPage = useCallback(async () => {
    if (currentBranchIdRef.current === 0) return;
    await fetchPage(currentBranchIdRef.current, currentFiltersRef.current, pagination.page, true);
  }, [fetchPage, pagination.page]);

  // Limpiar caché manualmente
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const setStock = useCallback(async (
    productId: number,
    branchId: number,
    data: UpdateStockDTO
  ): Promise<UpdateStockResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await container.productBranches.setStock(productId, branchId, data);
      
      // Limpiar TODO el caché para forzar recarga limpia
      cacheRef.current.clear();
      
      return result;
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar stock');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    inventory,
    pagination,
    isLoading,
    error,
    goToPage,
    applyFilters,
    refreshCurrentPage,
    setStock,
    clearError,
    clearCache,
  };
};
