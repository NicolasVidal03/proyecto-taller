import { useState, useCallback } from 'react';
import { Route } from '../../domain/entities/Route';
import { CreateRouteDTO } from '../../domain/ports/IRouteRepository';
import { container } from '../../infrastructure/config/container';

export interface RouteError {
  message: string;
  code?: string;
}

export interface UseRoutesReturn {
  isLoading: boolean;
  error: RouteError | null;
  createRoute: (data: CreateRouteDTO) => Promise<Route | null>;
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

export const useRoutes = (): UseRoutesReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<RouteError | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const createRoute = useCallback(async (data: CreateRouteDTO): Promise<Route | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const newRoute = await container.routes.create(data);
      return newRoute;
    } catch (err) {
      const message = extractErrorMessage(err);
      setError({ message, code: 'CREATE_ERROR' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    createRoute,
    clearError,
  };
};
