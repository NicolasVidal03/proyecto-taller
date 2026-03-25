import { IActivityRepository } from '../domain/ports/IActivityRepository';
import { Activity } from '../domain/entities/Activity';

export class ActivityService {
  constructor(private repository: IActivityRepository) {}

  async getActivityByUserAndDate(userId: number, date: string, role: string): Promise<Activity> {
    return this.repository.getActivityByUserAndDate(userId, date, role);
  }
}
