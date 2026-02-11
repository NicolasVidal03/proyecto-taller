import { useState, useCallback } from 'react';
import { Business } from '../../domain/entities/Business';
import { CreateBusinessDTO, UpdateBusinessDTO } from '../../domain/ports/IBusinessRepository';
import { container } from '../../infrastructure/config/container';
import { useAuth } from '../providers/AuthProvider';
import { extractErrorMessage } from './shared';

export interface UseBusinessesReturn {
  // Datos
  businesses: Business[];
  
  // Estado
  isLoading: boolean;
  error: string | null;
  
  // CRUD
  fetchBusinesses: () => Promise<void>;
  createBusiness: (data: CreateBusinessDTO) => Promise<Business | null>;
  updateBusiness: (id: number, data: UpdateBusinessDTO) => Promise<Business | null>;
  softDeleteBusiness: (id: number) => Promise<boolean>;
  
  // Utilidades
  clearError: () => void;
}

export const useBusinesses = (): UseBusinessesReturn => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const auth = useAuth();

  const clearError = useCallback(() => setError(null), []);

  // ========== CRUD ==========

  const fetchBusinesses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await container.businesses.listAll();
      setBusinesses(list || []);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createBusiness = useCallback(async (data: CreateBusinessDTO): Promise<Business | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const created = await container.businesses.create(data, auth.user?.id ?? null);
      setBusinesses(prev => [created, ...prev]);
      return created;
    } catch (err) {
      setError(extractErrorMessage(err));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [auth.user?.id]);

  const updateBusiness = useCallback(async (id: number, data: UpdateBusinessDTO): Promise<Business | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await container.businesses.update(id, data, auth.user?.id ?? null);
      if (updated) {
        setBusinesses(prev => prev.map(b => b.id === id ? updated : b));
      }
      return updated;
    } catch (err) {
      setError(extractErrorMessage(err));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [auth.user?.id]);

  const softDeleteBusiness = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const ok = await container.businesses.softDelete(id, auth.user?.id ?? null);
      if (ok) {
        setBusinesses(prev => prev.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b));
      }
      return ok;
    } catch (err) {
      setError(extractErrorMessage(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [auth.user?.id]);

  return {
    businesses,
    isLoading,
    error,
    fetchBusinesses,
    createBusiness,
    updateBusiness,
    softDeleteBusiness,
    clearError,
  };
};

export default useBusinesses;
