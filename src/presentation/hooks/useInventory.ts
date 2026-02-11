import { useState, useCallback, useRef } from 'react';
import { ProductWithBranchInfo, BranchProductsFilters } from '../../domain/entities/ProductBranch';
import { UpdateStockDTO, UpdateStockResponse } from '../../domain/ports/IProductBranchRepository';
import { container } from '../../infrastructure/config/container';
import { extractErrorMessage } from './shared';

export interface UseInventoryReturn {
  // Datos
  inventory: ProductWithBranchInfo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Estado
  isLoading: boolean;
  error: string | null;
  
  // Paginación y filtros
  goToPage: (page: number) => Promise<void>;
  applyFilters: (branchId: number, filters?: BranchProductsFilters) => Promise<void>;
  refreshCurrentPage: () => Promise<void>;
  
  // Operaciones
  setStock: (productId: number, branchId: number, data: UpdateStockDTO) => Promise<UpdateStockResponse | null>;
  
  // Utilidades
  clearError: () => void;
  clearCache: () => void;
}

const LIMIT = 10;

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
  
  // Estado actual
  const currentBranchIdRef = useRef<number>(0);
  const currentFiltersRef = useRef<BranchProductsFilters>({});

  // ========== Paginación ==========

  const fetchPage = useCallback(async (
    branchId: number, 
    filters: BranchProductsFilters, 
    pageNum: number, 
    forceRefresh = false
  ) => {
    const cacheKey = getCacheKey(branchId, filters, pageNum);
    
    if (!forceRefresh && cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey)!;
      // Solo actualizamos si los datos son diferentes para evitar re-renders?
      // Por simplicidad, asumimos que siempre actualizamos el estado si hay hit en cache
      setInventory(cached.data);
      setPagination(prev => ({
        ...prev,
        page: pageNum,
        total: cached.total,
        totalPages: cached.totalPages,
      }));
      return;
    }

    // Prevenir llamadas redundantes si ya estamos cargando ESTE conjunto específico?
    // Puede ser complejo. Por ahora confiamos en el effect.
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await container.productBranches.getByBranchPaginated(branchId, {
        ...filters,
        page: pageNum,
        limit: LIMIT,
      });
      
      // Validación defensiva por si result es undefined
      const data = result?.data || [];
      const total = result?.total || 0;
      const totalPages = result?.totalPages || 0;
      const currentPage = result?.page || pageNum;

      cacheRef.current.set(cacheKey, {
        data,
        total,
        totalPages,
      });
      
      setInventory(data);
      setPagination({
        page: currentPage,
        limit: LIMIT,
        total,
        totalPages,
      });
    } catch (err) {
      // Si falla, limpiar inventario para no mostrar datos viejos confusos
      // O mantenerlo? Mejor mostrar error y mantener datos si es posible, 
      // pero si es la primera carga (inventory vacio), no pasa nada.
      console.error("Error fetching inventory:", err);
      // setInventory([]); // Opcional: limpiar tabla en error
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applyFilters = useCallback(async (branchId: number, filters?: BranchProductsFilters) => {
    const nextFilters = filters || {};
    const sameBranch = currentBranchIdRef.current === branchId;
    const sameFilters = JSON.stringify(currentFiltersRef.current) === JSON.stringify(nextFilters);

    if (sameBranch && sameFilters) {
      return;
    }

    cacheRef.current.clear();
    currentBranchIdRef.current = branchId;
    currentFiltersRef.current = nextFilters;
    await fetchPage(branchId, currentFiltersRef.current, 1);
  }, [fetchPage]);

  const goToPage = useCallback(async (pageNum: number) => {
    if (pageNum < 1 || (pagination.totalPages > 0 && pageNum > pagination.totalPages)) return;
    if (currentBranchIdRef.current === 0) return;
    await fetchPage(currentBranchIdRef.current, currentFiltersRef.current, pageNum);
  }, [fetchPage, pagination.totalPages]);

  const refreshCurrentPage = useCallback(async () => {
    if (currentBranchIdRef.current === 0) return;
    await fetchPage(currentBranchIdRef.current, currentFiltersRef.current, pagination.page, true);
  }, [fetchPage, pagination.page]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // ========== Operaciones ==========

  const setStock = useCallback(async (
    productId: number,
    branchId: number,
    data: UpdateStockDTO
  ): Promise<UpdateStockResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await container.productBranches.setStock(productId, branchId, data);
      clearCache();
      return result;
    } catch (err) {
      setError(extractErrorMessage(err));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [clearCache]);

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
