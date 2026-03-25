import { useState, useCallback } from 'react';
import { Activity } from '../../domain/entities/Activity';
import { container } from '../../infrastructure/config/container';
import { AppError, extractErrorMessage } from './shared';

export type ActivityError = AppError;

export interface UseActivitiesReturn {
  activities: Activity | undefined;
  isLoading: boolean;
  error: ActivityError | null;
  
  // fetchActivities: (userId: number, date: string) => Promise<void>;
  getActivityByUserAndDate: (userId: number, date: string, role: string) => Promise<void>;
  clearActivities: () => void;
  clearError: () => void;
}

export const useActivities = (): UseActivitiesReturn => {
  const [activities, setActivities] = useState<Activity>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ActivityError | null>(null);

  const clearError = useCallback(() => setError(null), []);
  const clearActivities = useCallback(() => setActivities(undefined), []);

  // const fetchActivities = useCallback(async (userId: number, date: string) => {
  //   setIsLoading(true);
  //   setError(null);
  //   try {
  //     const data = await container.activities.getActivityByUserAndDate(userId, date);
  //     setActivity(data);
  //   } catch (err) {
  //     setError({ message: extractErrorMessage(err), code: 'FETCH_ERROR' });
  //     setActivity(undefined);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, []);

  const getActivityByUserAndDate = useCallback(async (userId: number, date: string, role: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(role)
      const data = await container.activities.getActivityByUserAndDate(userId, date, role);
      setActivities(data);
    } catch (e) {
      setError({ message: extractErrorMessage(e), code: 'FETCH_ERROR' });
    } finally {
      setIsLoading(false);
    }
  }, [activities])

  return {
    activities,
    isLoading,
    error,
    // fetchActivities,
    getActivityByUserAndDate,
    clearActivities,
    clearError,
  };
};
