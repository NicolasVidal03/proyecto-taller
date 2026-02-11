import { IActivityRepository } from '../domain/ports/IActivityRepository';
import { ActivityWork } from '../domain/entities/ActivityWork';

export class ActivityService {
  constructor(private repository: IActivityRepository) {}

  async getBusinessActivities(userId: number, date: string): Promise<ActivityWork[]> {
    return this.repository.getBusinessActivities(userId, date);
  }
}
