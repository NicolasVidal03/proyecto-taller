import { Activity } from '../entities/Activity';

export interface IActivityRepository {
  getActivityByUserAndDate(userId: number, date: string, role: string): Promise<Activity>;
}
