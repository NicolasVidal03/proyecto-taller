import { useState, useCallback, useRef, useMemo } from 'react';
import { Supplier } from '../../domain/entities/Supplier';
import { CreateSupplierDTO, UpdateSupplierDTO } from '../../domain/ports/ISupplierRepository';
import { container } from '../../infrastructure/config/container';
import { extractErrorMessage } from './shared';

export type SupplierFilters = Partial<{
  name: string;
  nit: string;
  countryId: number;
  state: boolean;
  q: string;
}>;

export interface UseSuppliersReturn {
  suppliers: Supplier[];
  supplierMap: Map<number, Supplier>;
  isLoading: boolean;
  error: string | null;
  page: number;
  total: number;
  totalPages: number;
  
  // Paginación y filtros
  goToPage: (page: number) => Promise<void>;
  applyFilters: (filters?: SupplierFilters) => Promise<void>;
  refreshCurrentPage: () => Promise<void>;
  
  // CRUD
  fetchSupplierById: (id: number) => Promise<Supplier | null>;
  createSupplier: (data: CreateSupplierDTO, userId?: number) => Promise<Supplier | null>;
  updateSupplier: (id: number, data: UpdateSupplierDTO, userId?: number) => Promise<Supplier | null>;
  updateSupplierState: (id: number, state: boolean, userId?: number) => Promise<boolean>;
  deleteSupplier: (id: number, userId?: number) => Promise<boolean>;
  
  // Utilidades
  getSupplierName: (id: number | null | undefined) => string;
  clearError: () => void;
  clearCache: () => void;
}

const LIMIT = 10;

const getCacheKey = (filters: SupplierFilters, page: number): string => {
  return JSON.stringify({ ...filters, page, limit: LIMIT });
};

export const useSuppliers = (): UseSuppliersReturn => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const cacheRef = useRef<Map<string, { data: Supplier[]; total: number; totalPages: number }>>(new Map());
  const currentFiltersRef = useRef<SupplierFilters>({});

  // Mapa de proveedores para búsqueda rápida
  const supplierMap = useMemo(() => {
    return new Map(suppliers.map(s => [s.id, s]));
  }, [suppliers]);

  const getSupplierName = useCallback((id: number | null | undefined): string => {
    if (id == null) return 'Sin proveedor';
    return supplierMap.get(id)?.name ?? 'Desconocido';
  }, [supplierMap]);

  // ========== Paginación ==========

  const fetchPage = useCallback(async (pageNum: number, filters: SupplierFilters, forceRefresh = false) => {
    const cacheKey = getCacheKey(filters, pageNum);
    
    if (!forceRefresh && cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey)!;
      setSuppliers(cached.data);
      setPage(pageNum);
      setTotal(cached.total);
      setTotalPages(cached.totalPages);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const raw: unknown = await (container.suppliers as { getAll: (filters: SupplierFilters, page: number, limit: number) => Promise<unknown> }).getAll(filters, pageNum, LIMIT);
      
      let data: Supplier[] = [];
      let totalRes = 0;
      let totalPagesRes = 0;

      if (Array.isArray(raw)) {
        data = raw as Supplier[];
        totalRes = data.length;
        totalPagesRes = Math.max(1, Math.ceil(totalRes / LIMIT));
      } else if (raw && typeof raw === 'object' && 'data' in raw) {
        const result = raw as { data: Supplier[]; total?: number; totalPages?: number };
        data = result.data;
        totalRes = result.total ?? data.length;
        totalPagesRes = result.totalPages ?? Math.max(1, Math.ceil(totalRes / LIMIT));
      }

      cacheRef.current.set(cacheKey, { data, total: totalRes, totalPages: totalPagesRes });
      setSuppliers(data);
      setPage(pageNum);
      setTotal(totalRes);
      setTotalPages(totalPagesRes);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applyFilters = useCallback(async (filters?: SupplierFilters) => {
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

  // ========== CRUD ==========

  const fetchSupplierById = useCallback(async (id: number): Promise<Supplier | null> => {
    setError(null);
    try {
      return await container.suppliers.getById(id);
    } catch (err) {
      setError(extractErrorMessage(err));
      return null;
    }
  }, []);

  const createSupplier = useCallback(async (data: CreateSupplierDTO, userId?: number): Promise<Supplier | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const newSupplier = await container.suppliers.create({ ...data, userId });
      clearCache();
      await fetchPage(1, currentFiltersRef.current, true);
      return newSupplier;
    } catch (err) {
      setError(extractErrorMessage(err));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchPage, clearCache]);

  const updateSupplier = useCallback(async (id: number, data: UpdateSupplierDTO, userId?: number): Promise<Supplier | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await container.suppliers.update(id, { ...data, userId });
      setSuppliers(prev => prev.map(s => (s.id === id ? updated : s)));
      
      // Actualizar caché
      const cacheKey = getCacheKey(currentFiltersRef.current, page);
      const cached = cacheRef.current.get(cacheKey);
      if (cached) {
        cached.data = cached.data.map(s => (s.id === id ? updated : s));
      }
      
      return updated;
    } catch (err) {
      setError(extractErrorMessage(err));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  const updateSupplierState = useCallback(async (id: number, state: boolean, userId?: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await container.suppliers.updateState(id, state, userId);
      clearCache();
      await fetchPage(page, currentFiltersRef.current, true);
      return true;
    } catch (err) {
      setError(extractErrorMessage(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchPage, page, clearCache]);

  const deleteSupplier = useCallback(async (id: number, userId?: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await container.suppliers.delete(id, userId);
      clearCache();
      await fetchPage(page, currentFiltersRef.current, true);
      return true;
    } catch (err) {
      setError(extractErrorMessage(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchPage, page, clearCache]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    suppliers,
    supplierMap,
    isLoading,
    error,
    page,
    total,
    totalPages,
    goToPage,
    applyFilters,
    refreshCurrentPage,
    fetchSupplierById,
    createSupplier,
    updateSupplier,
    updateSupplierState,
    deleteSupplier,
    getSupplierName,
    clearError,
    clearCache,
  };
};

