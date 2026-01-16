import { useState, useCallback, useRef } from 'react';
import { Supplier } from '../../domain/entities/Supplier';
import { CreateSupplierDTO, UpdateSupplierDTO } from '../../domain/ports/ISupplierRepository';

export type SupplierFilters = Partial<{
  name: string;
  nit: string;
  countryId: number;
  state: boolean;
  q: string;
}>;
import { container } from '../../infrastructure/config/container';

export interface UseSuppliersReturn {
  suppliers: Supplier[];
  isLoading: boolean;
  error: string | null;
  page: number;
  total: number;
  totalPages: number;
  goToPage: (page: number) => Promise<void>;
  applyFilters: (filters?: SupplierFilters) => Promise<void>;
  refreshCurrentPage: () => Promise<void>;
  fetchSupplierById: (id: number) => Promise<Supplier | null>;
  createSupplier: (data: CreateSupplierDTO, userId?: number) => Promise<Supplier | null>;
  updateSupplier: (id: number, data: UpdateSupplierDTO, userId?: number) => Promise<Supplier | null>;
  updateSupplierState: (id: number, state: boolean, userId?: number) => Promise<boolean>;
  deleteSupplier: (id: number) => Promise<boolean>;
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
      const raw: any = await (container.suppliers as any).getAll(filters, pageNum, LIMIT);
      let data: Supplier[] = [];
      let totalRes = 0;
      let totalPagesRes = 0;

      if (Array.isArray(raw)) {
        data = raw as Supplier[];
        totalRes = data.length;
        totalPagesRes = Math.max(1, Math.ceil(totalRes / LIMIT));
      } else if (raw && Array.isArray(raw.data)) {
        data = raw.data as Supplier[];
        totalRes = typeof raw.total === 'number' ? raw.total : data.length;
        totalPagesRes = typeof raw.totalPages === 'number' ? raw.totalPages : Math.max(1, Math.ceil(totalRes / LIMIT));
      } else {
        data = raw ? (Array.isArray(raw) ? raw : []) : [];
        totalRes = data.length;
        totalPagesRes = Math.max(1, Math.ceil(totalRes / LIMIT));
      }

      cacheRef.current.set(cacheKey, {
        data,
        total: totalRes,
        totalPages: totalPagesRes,
      });

      setSuppliers(data);
      setPage(pageNum);
      setTotal(totalRes);
      setTotalPages(totalPagesRes);
    } catch (err: any) {
      console.error('useSuppliers.fetchPage error', err);
      setError(err?.message || 'Error al cargar proveedores');
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

  const fetchSupplierById = useCallback(async (id: number): Promise<Supplier | null> => {
    setError(null);
    try {
      return await container.suppliers.getById(id);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar proveedor');
      return null;
    }
  }, []);

  const createSupplier = useCallback(async (data: CreateSupplierDTO, userId?: number): Promise<Supplier | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const newSupplier = await container.suppliers.create({ ...data, userId });
      const pageKey = getCacheKey(currentFiltersRef.current, 1);
      const cached = cacheRef.current.get(pageKey);
      if (cached) {
        cached.data = [newSupplier, ...cached.data];
        cached.total = (cached.total || 0) + 1;
        cached.totalPages = Math.max(1, Math.ceil(cached.total / LIMIT));
        cacheRef.current.set(pageKey, cached);
      } else {
        cacheRef.current.set(pageKey, { data: [newSupplier], total: 1, totalPages: 1 });
      }
      setSuppliers(prev => [newSupplier, ...prev]);
      setPage(1);
      const newTotal = (total || 0) + 1;
      setTotal(newTotal);
      setTotalPages(Math.max(1, Math.ceil(newTotal / LIMIT)));
      fetchPage(1, currentFiltersRef.current, true).catch(e => console.error('refresh after createSupplier failed', e));
      return newSupplier;
    } catch (err: any) {
      setError(err?.message || 'Error al crear proveedor');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchPage]);

  const updateSupplier = useCallback(async (id: number, data: UpdateSupplierDTO, userId?: number): Promise<Supplier | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await container.suppliers.update(id, { ...data, userId });
      setSuppliers(prev => prev.map(s => (s.id === id ? updated : s)));
      const cacheKey = getCacheKey(currentFiltersRef.current, page);
      const cached = cacheRef.current.get(cacheKey);
      if (cached) {
        cached.data = cached.data.map(s => (s.id === id ? updated : s));
      }
      return updated;
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar proveedor');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  const updateSupplierState = useCallback(async (id: number, state: boolean, userId?: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await container.suppliers.updateState(id, state);
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

  const deleteSupplier = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await container.suppliers.delete(id);
      cacheRef.current.clear();
      await fetchPage(page, currentFiltersRef.current, true);
      return true;
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar proveedor');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchPage, page]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    suppliers,
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
    clearError,
    clearCache,
  };
};

