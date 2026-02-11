import { useState, useCallback } from 'react';
import { ActivityWork } from '../../domain/entities/ActivityWork';
import { container } from '../../infrastructure/config/container';
import { AppError, extractErrorMessage } from './shared';

export type ActivityError = AppError;

export interface UseActivitiesReturn {
  activities: ActivityWork[];
  isLoading: boolean;
  error: ActivityError | null;
  
  fetchActivities: (userId: number, date: string) => Promise<void>;
  clearActivities: () => void;
  clearError: () => void;
}

export const useActivities = (): UseActivitiesReturn => {
  const [activities, setActivities] = useState<ActivityWork[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ActivityError | null>(null);

  const clearError = useCallback(() => setError(null), []);
  const clearActivities = useCallback(() => setActivities([]), []);

  const fetchActivities = useCallback(async (userId: number, date: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await container.activities.getBusinessActivities(userId, date);
      setActivities(data);
    } catch (err) {
      setError({ message: extractErrorMessage(err), code: 'FETCH_ERROR' });
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    activities,
    isLoading,
    error,
    fetchActivities,
    clearActivities,
    clearError,
  };
};
