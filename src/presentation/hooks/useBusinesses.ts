import { useState, useCallback } from 'react';
import { Business } from '../../domain/entities/Business';
import { CreateBusinessDTO, UpdateBusinessDTO, BusinessFilters } from '../../domain/ports/IBusinessRepository';
import { container } from '../../infrastructure/config/container';
import { useAuth } from '../providers/AuthProvider';
import { extractErrorMessage, usePagination } from './shared';

const LIMIT = 10;

export interface UseBusinessesReturn {
  // Datos paginados
  businesses: Business[];

  // Paginación
  page: number;
  total: number;
  totalPages: number;
  goToPage: (page: number) => Promise<void>;
  applyFilters: (filters?: BusinessFilters) => Promise<void>;
  refreshCurrentPage: () => Promise<void>;

  // Estado
  isLoading: boolean;
  error: string | null;

  // CRUD
  createBusiness: (data: CreateBusinessDTO) => Promise<Business | null>;
  updateBusiness: (id: number, data: UpdateBusinessDTO) => Promise<Business | null>;
  softDeleteBusiness: (id: number) => Promise<boolean>;

  // Utilidades
  clearError: () => void;
  clearCache: () => void;
}

const useBusinesses = (): UseBusinessesReturn => {
  const [crudLoading, setCrudLoading] = useState(false);
  const [crudError, setCrudError] = useState<string | null>(null);

  const auth = useAuth();

  const fetchBusinesses = useCallback(
    async (filters: BusinessFilters, page: number, limit: number) => {
      const result = await container.businesses.listPaginated({ ...filters, page, limit });
      return {
        data: result.data,
        total: result.total,
        totalPages: result.totalPages,
      };
    },
    [],
  );

  const {
    items: businesses,
    pagination,
    isLoading: paginationLoading,
    error: paginationError,
    goToPage,
    applyFilters,
    refreshCurrentPage,
    clearError: clearPaginationError,
    clearCache,
  } = usePagination<Business, BusinessFilters>({
    fetchFn: fetchBusinesses,
    limit: LIMIT,
  });

  // ========== CRUD ==========

  const createBusiness = useCallback(
    async (data: CreateBusinessDTO): Promise<Business | null> => {
      setCrudLoading(true);
      setCrudError(null);
      try {
        const created = await container.businesses.create(data, auth.user?.id ?? null);
        clearCache();
        await refreshCurrentPage();
        return created;
      } catch (err) {
        setCrudError(extractErrorMessage(err));
        return null;
      } finally {
        setCrudLoading(false);
      }
    },
    [auth.user?.id, clearCache, refreshCurrentPage],
  );

  const updateBusiness = useCallback(
    async (id: number, data: UpdateBusinessDTO): Promise<Business | null> => {
      setCrudLoading(true);
      setCrudError(null);
      try {
        const updated = await container.businesses.update(id, data, auth.user?.id ?? null);
        clearCache();
        await refreshCurrentPage();
        return updated;
      } catch (err) {
        setCrudError(extractErrorMessage(err));
        return null;
      } finally {
        setCrudLoading(false);
      }
    },
    [auth.user?.id, clearCache, refreshCurrentPage],
  );

  const softDeleteBusiness = useCallback(
    async (id: number): Promise<boolean> => {
      setCrudLoading(true);
      setCrudError(null);
      try {
        const ok = await container.businesses.softDelete(id, auth.user?.id ?? null);
        if (ok) {
          clearCache();
          await refreshCurrentPage();
        }
        return ok;
      } catch (err) {
        setCrudError(extractErrorMessage(err));
        return false;
      } finally {
        setCrudLoading(false);
      }
    },
    [auth.user?.id, clearCache, refreshCurrentPage],
  );

  const clearError = useCallback(() => {
    clearPaginationError();
    setCrudError(null);
  }, [clearPaginationError]);

  const isLoading = paginationLoading || crudLoading;
  const error = paginationError || crudError;

  return {
    businesses,
    page: pagination.page,
    total: pagination.total,
    totalPages: pagination.totalPages,
    goToPage,
    applyFilters,
    refreshCurrentPage,
    isLoading,
    error,
    createBusiness,
    updateBusiness,
    softDeleteBusiness,
    clearError,
    clearCache,
  };
};

export default useBusinesses;