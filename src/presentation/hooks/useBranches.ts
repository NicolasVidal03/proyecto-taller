import { useState, useCallback, useMemo } from 'react';
import { Branch } from '../../domain/entities/Branch';
import { BranchMap, createBranchMap, getBranchName } from '../utils/branchHelpers';
import { CreateBranchDTO, UpdateBranchDTO } from '../../domain/ports/IBranchRepository';
import { container } from '../../infrastructure/config/container';


export interface BranchError {
  message: string;
  code?: string;
}

export interface UseBranchesReturn {
  branches: Branch[];
  branchMap: BranchMap;
  isLoading: boolean;
  error: BranchError | null;
  getBranchNameById: (id: number | null | undefined) => string;
  fetchBranches: () => Promise<void>;
  fetchBranchById: (id: number) => Promise<Branch | null>;
  createBranch: (data: CreateBranchDTO) => Promise<Branch | null>;
  updateBranch: (id: number, data: UpdateBranchDTO) => Promise<Branch | null>;
  updateBranchState: (id: number, state: boolean) => Promise<boolean>;
  clearError: () => void;
}


function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const axiosError = err as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    return err.message;
  }
  if (typeof err === 'string') return err;
  return 'Error desconocido';
}


export const useBranches = (): UseBranchesReturn => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<BranchError | null>(null);
  const branchMap = useMemo(() => createBranchMap(branches), [branches]);

  
  const getBranchNameById = useCallback(
    (id: number | null | undefined): string => getBranchName(branchMap, id),
    [branchMap]
  );

  const clearError = useCallback(() => setError(null), []);
  const fetchBranches = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await container.branches.getAll();
      setBranches(data);
    } catch (err) {
      const message = extractErrorMessage(err);
      setError({ message, code: 'FETCH_ERROR' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBranchById = useCallback(async (id: number): Promise<Branch | null> => {
    setError(null);
    try {
      return await container.branches.getById(id);
    } catch (err) {
      const message = extractErrorMessage(err);
      setError({ message, code: 'FETCH_BY_ID_ERROR' });
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
      const message = extractErrorMessage(err);
      setError({ message, code: 'CREATE_ERROR' });
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
      const message = extractErrorMessage(err);
      setError({ message, code: 'UPDATE_ERROR' });
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
      const message = extractErrorMessage(err);
      setError({ message, code: 'UPDATE_STATE_ERROR' });
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
