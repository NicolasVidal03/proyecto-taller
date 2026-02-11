import { useState, useCallback } from 'react';
import { AppError, createAppError } from './errorUtils';

export interface AsyncState<E = AppError> {
  isLoading: boolean;
  error: E | null;
}

export interface UseAsyncStateReturn<E = AppError> extends AsyncState<E> {
  setLoading: (loading: boolean) => void;
  setError: (error: E | null) => void;
  clearError: () => void;
 
  execute: <T>(
    asyncFn: () => Promise<T>,
    errorCode?: string
  ) => Promise<{ data: T | null; error: E | null }>;
}


export function useAsyncState<E = AppError>(): UseAsyncStateReturn<E> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<E | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const execute = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    errorCode?: string
  ): Promise<{ data: T | null; error: E | null }> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await asyncFn();
      return { data, error: null };
    } catch (err) {
      const appError = createAppError(err, errorCode) as E;
      setError(appError);
      return { data: null, error: appError };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    setLoading,
    setError,
    clearError,
    execute,
  };
}
