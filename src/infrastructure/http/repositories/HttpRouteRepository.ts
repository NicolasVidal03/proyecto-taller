import { Route } from '../../../domain/entities/Route';
import { IRouteRepository, CreateRouteDTO, UpdateRouteDTO } from '../../../domain/ports/IRouteRepository';
import { http } from '../httpClient';

export class HttpRouteRepository implements IRouteRepository {
  private readonly basePath = '/routes';

  async create(data: CreateRouteDTO): Promise<Route> {
    const response = await http.post(this.basePath, data);
    const payload = response.data;
    const route: Route = payload?.created ?? payload;
    return {
      id: route?.id ?? payload?.id,
      assignedDate: route?.assignedDate ?? data.assignedDate,
      assignedIdUser: route?.assignedIdUser ?? data.assignedIdUser,
      assignedIdArea: route?.assignedIdArea ?? data.assignedIdArea,
    };
  }

  async getRoutes(): Promise<Route[]> {
    const resp = await http.get(this.basePath);
    return resp.data;
  }

  async update(id: number, data: UpdateRouteDTO): Promise<Route> {
    const resp = await http.put<{ updated: Route }>(`${this.basePath}/${id}`, data);
    return resp.data.updated;
  }
}