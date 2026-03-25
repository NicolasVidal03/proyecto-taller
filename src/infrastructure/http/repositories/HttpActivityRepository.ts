import { http } from '../httpClient';
import { Activity } from '../../../domain/entities/Activity';
import { IActivityRepository } from '../../../domain/ports/IActivityRepository';

export class HttpActivityRepository implements IActivityRepository {
  async getActivityByUserAndDate(userId: number, date: string, role: string): Promise<Activity> {
    if( !userId ) throw Error("El userId es obligatorio");
    if( !date ) throw Error("La fecha es obligatoria");
    if( !role ) throw Error("El rol del usuario es obligatorio");
    let userRole = '';
    if( role == 'transportista' ) {
      userRole = 'distributor';
    } else if( role == 'prevendedor' ) {
      userRole = 'preseller';
    }
    const res = await http.get(`/activity/${userRole}?userId=${userId}&date=${date}`);
    return res.data;
  }
}
