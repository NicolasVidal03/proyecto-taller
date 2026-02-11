import { http } from '../httpClient';
import { ActivityWork } from '../../../domain/entities/ActivityWork';
import { IActivityRepository } from '../../../domain/ports/IActivityRepository';

export class HttpActivityRepository implements IActivityRepository {
  async getBusinessActivities(userId: number, date: string): Promise<ActivityWork[]> {
    const res = await http.get<ActivityWork[]>('/business-activity', {
      params: { userId, date }
    });
    return res.data || [];
  }
}
