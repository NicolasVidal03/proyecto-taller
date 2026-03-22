import { http } from '../httpClient';
import { Activity } from '../../../domain/entities/Activity';
import { IActivityRepository } from '../../../domain/ports/IActivityRepository';

export class HttpActivityRepository implements IActivityRepository {
  async getActivityByUserAndDate(userId: number, date: string): Promise<Activity> {
    if( !userId ) throw Error("El userId es obligatorio");
    if( !date ) throw Error("La fecha es obligatoria");
    const res = await http.get(`/activity/preseller?userId=${userId}&date=${date}`);
    return res.data;
  }
}
