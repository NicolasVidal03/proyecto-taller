import { ActivityWork } from '../entities/ActivityWork';

export interface IActivityRepository {
  getBusinessActivities(userId: number, date: string): Promise<ActivityWork[]>;
}
