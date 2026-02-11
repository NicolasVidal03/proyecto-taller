import { useState, useCallback } from 'react';
import { Route } from '../../domain/entities/Route';
import { CreateRouteDTO } from '../../domain/ports/IRouteRepository';
import { container } from '../../infrastructure/config/container';
import { AppError, extractErrorMessage } from './shared';

export type RouteError = AppError;

export interface UseRoutesReturn {
  isLoading: boolean;
  error: RouteError | null;
  createRoute: (data: CreateRouteDTO) => Promise<Route | null>;
  clearError: () => void;
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
      setError({ message: extractErrorMessage(err), code: 'CREATE_ERROR' });
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
