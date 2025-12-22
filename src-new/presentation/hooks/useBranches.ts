import { useState, useCallback, useMemo } from 'react';
import { Branch, BranchMap, createBranchMap, getBranchName } from '../../domain/entities/Branch';
import { CreateBranchDTO, UpdateBranchDTO } from '../../domain/ports/IBranchRepository';
import { container } from '../../infrastructure/config/container';

/**
 * Estado de error estructurado para mejor UX
 */
export interface BranchError {
  message: string;
  code?: string;
}

/**
 * Interfaz de retorno del hook useBranches
 */
export interface UseBranchesReturn {
  // Estado
  branches: Branch[];
  branchMap: BranchMap;
  isLoading: boolean;
  error: BranchError | null;
  
  // Helpers
  getBranchNameById: (id: number | null | undefined) => string;
  
  // Acciones
  fetchBranches: () => Promise<void>;
  fetchBranchById: (id: number) => Promise<Branch | null>;
  createBranch: (data: CreateBranchDTO) => Promise<Branch | null>;
  updateBranch: (id: number, data: UpdateBranchDTO) => Promise<Branch | null>;
  updateBranchState: (id: number, state: boolean) => Promise<boolean>;
  clearError: () => void;
}

/**
 * Helper para extraer mensaje de error
 */
function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    // Axios errors tienen response.data.message
    const axiosError = err as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    return err.message;
  }
  if (typeof err === 'string') return err;
  return 'Error desconocido';
}

/**
 * Hook personalizado para gestionar sucursales
 * Implementa el patrón diccionario para mapeo ID -> Nombre
 */
export const useBranches = (): UseBranchesReturn => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<BranchError | null>(null);

  // Patrón Diccionario: Mapa de ID -> Nombre para acceso O(1)
  const branchMap = useMemo(() => createBranchMap(branches), [branches]);

  // Helper para obtener nombre por ID
  const getBranchNameById = useCallback(
    (id: number | null | undefined): string => getBranchName(branchMap, id),
    [branchMap]
  );

  const clearError = useCallback(() => setError(null), []);

  /**
   * Obtiene todas las sucursales activas
   */
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

  /**
   * Obtiene una sucursal específica por ID
   */
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

  /**
   * Crea una nueva sucursal
   */
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

  /**
   * Actualiza una sucursal existente
   */
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

  /**
   * Actualiza el estado de una sucursal (borrado lógico)
   */
  const updateBranchState = useCallback(async (id: number, state: boolean): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await container.branches.updateState(id, state);
      if (state) {
        // Reactivar: actualizar en lista
        setBranches(prev => prev.map(b => (b.id === id ? updated : b)));
      } else {
        // Desactivar: remover de lista de activos
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
