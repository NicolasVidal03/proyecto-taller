import { useCallback } from 'react';
import { extractErrorMessage } from './errorUtils';

export interface CrudOperations<T, CreateDTO, UpdateDTO> {
  getById: (id: number) => Promise<T>;
  create: (data: CreateDTO) => Promise<T>;
  update: (id: number, data: UpdateDTO) => Promise<T>;
  updateState?: (id: number, ...args: unknown[]) => Promise<T | void>;
  delete?: (id: number, ...args: unknown[]) => Promise<void>;
}

export interface CrudCallbacks<T> {
  onSuccess?: (item: T, operation: 'create' | 'update' | 'delete' | 'updateState') => void;
  onError?: (error: string, operation: string) => void;
  onBeforeOperation?: () => void;
  onAfterOperation?: () => void;
}

export interface UseCrudOperationsConfig<T, CreateDTO, UpdateDTO> {
  service: CrudOperations<T, CreateDTO, UpdateDTO>;
  callbacks?: CrudCallbacks<T>;
  setLoading?: (loading: boolean) => void;
  setError?: (error: string | null) => void;
}

export interface UseCrudOperationsReturn<T, CreateDTO, UpdateDTO> {
  getById: (id: number) => Promise<T | null>;
  create: (data: CreateDTO) => Promise<T | null>;
  update: (id: number, data: UpdateDTO) => Promise<T | null>;
  updateState: (id: number, ...args: unknown[]) => Promise<boolean>;
  remove: (id: number, ...args: unknown[]) => Promise<boolean>;
}

/**
 * Hook genérico para operaciones CRUD
 */
export function useCrudOperations<T, CreateDTO, UpdateDTO>(
  config: UseCrudOperationsConfig<T, CreateDTO, UpdateDTO>
): UseCrudOperationsReturn<T, CreateDTO, UpdateDTO> {
  const { service, callbacks, setLoading, setError } = config;

  const executeOperation = useCallback(async <R>(
    operation: () => Promise<R>,
    operationName: string
  ): Promise<{ data: R | null; success: boolean }> => {
    callbacks?.onBeforeOperation?.();
    setLoading?.(true);
    setError?.(null);
    
    try {
      const result = await operation();
      return { data: result, success: true };
    } catch (err) {
      const message = extractErrorMessage(err);
      setError?.(message);
      callbacks?.onError?.(message, operationName);
      return { data: null, success: false };
    } finally {
      setLoading?.(false);
      callbacks?.onAfterOperation?.();
    }
  }, [callbacks, setLoading, setError]);

  const getById = useCallback(async (id: number): Promise<T | null> => {
    const { data } = await executeOperation(
      () => service.getById(id),
      'getById'
    );
    return data;
  }, [executeOperation, service]);

  const create = useCallback(async (createData: CreateDTO): Promise<T | null> => {
    const { data } = await executeOperation(
      () => service.create(createData),
      'create'
    );
    if (data) {
      callbacks?.onSuccess?.(data, 'create');
    }
    return data;
  }, [executeOperation, service, callbacks]);

  const update = useCallback(async (id: number, updateData: UpdateDTO): Promise<T | null> => {
    const { data } = await executeOperation(
      () => service.update(id, updateData),
      'update'
    );
    if (data) {
      callbacks?.onSuccess?.(data, 'update');
    }
    return data;
  }, [executeOperation, service, callbacks]);

  const updateState = useCallback(async (id: number, ...args: unknown[]): Promise<boolean> => {
    if (!service.updateState) {
      console.warn('updateState not implemented in service');
      return false;
    }
    const { success, data } = await executeOperation(
      () => service.updateState!(id, ...args),
      'updateState'
    );
    if (success && data) {
      callbacks?.onSuccess?.(data as T, 'updateState');
    }
    return success;
  }, [executeOperation, service, callbacks]);

  const remove = useCallback(async (id: number, ...args: unknown[]): Promise<boolean> => {
    if (!service.delete) {
      console.warn('delete not implemented in service');
      return false;
    }
    const { success } = await executeOperation(
      () => service.delete!(id, ...args),
      'delete'
    );
    return success;
  }, [executeOperation, service]);

  return {
    getById,
    create,
    update,
    updateState,
    remove,
  };
}
