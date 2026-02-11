import { useState, useCallback, useMemo } from 'react';
import { Branch } from '../../domain/entities/Branch';
import { BranchMap, createBranchMap, getBranchName } from '../utils/branchHelpers';
import { CreateBranchDTO, UpdateBranchDTO } from '../../domain/ports/IBranchRepository';
import { container } from '../../infrastructure/config/container';
import { AppError, extractErrorMessage } from './shared';

export type BranchError = AppError;

export interface UseBranchesReturn {
  // Datos
  branches: Branch[];
  branchMap: BranchMap;
  
  // Estado
  isLoading: boolean;
  error: BranchError | null;
  
  // CRUD
  fetchBranches: () => Promise<void>;
  fetchBranchById: (id: number) => Promise<Branch | null>;
  createBranch: (data: CreateBranchDTO) => Promise<Branch | null>;
  updateBranch: (id: number, data: UpdateBranchDTO) => Promise<Branch | null>;
  updateBranchState: (id: number, state: boolean) => Promise<boolean>;
  
  // Utilidades
  getBranchNameById: (id: number | null | undefined) => string;
  clearError: () => void;
}

export const useBranches = (): UseBranchesReturn => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<BranchError | null>(null);
  
  // Mapa de sucursales para búsqueda rápida
  const branchMap = useMemo(() => createBranchMap(branches), [branches]);

  const getBranchNameById = useCallback(
    (id: number | null | undefined): string => getBranchName(branchMap, id),
    [branchMap]
  );

  const clearError = useCallback(() => setError(null), []);

  // ========== CRUD ==========

  const fetchBranches = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await container.branches.getAll();
      setBranches(data);
    } catch (err) {
      setError({ message: extractErrorMessage(err), code: 'FETCH_ERROR' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBranchById = useCallback(async (id: number): Promise<Branch | null> => {
    setError(null);
    try {
      return await container.branches.getById(id);
    } catch (err) {
      setError({ message: extractErrorMessage(err), code: 'FETCH_BY_ID_ERROR' });
      return null;
    }
  }, []);

  const createBranch = useCallback(async (data: CreateBranchDTO): Promise<Branch | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const newBranch = await container.branches.create(data);
      setBranches(prev => [...prev, newBranch]);
      return newBranch;
    } catch (err) {
      setError({ message: extractErrorMessage(err), code: 'CREATE_ERROR' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBranch = useCallback(async (id: number, data: UpdateBranchDTO): Promise<Branch | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await container.branches.update(id, data);
      setBranches(prev => prev.map(b => (b.id === id ? updated : b)));
      return updated;
    } catch (err) {
      setError({ message: extractErrorMessage(err), code: 'UPDATE_ERROR' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBranchState = useCallback(async (id: number, state: boolean): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await container.branches.updateState(id, state);
      if (state) {
        setBranches(prev => prev.map(b => (b.id === id ? updated : b)));
      } else {
        setBranches(prev => prev.filter(b => b.id !== id));
      }
      return true;
    } catch (err) {
      setError({ message: extractErrorMessage(err), code: 'UPDATE_STATE_ERROR' });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    branches,
    branchMap,
    isLoading,
    error,
    getBranchNameById,
    fetchBranches,
    fetchBranchById,
    createBranch,
    updateBranch,
    updateBranchState,
    clearError,
  };
};
