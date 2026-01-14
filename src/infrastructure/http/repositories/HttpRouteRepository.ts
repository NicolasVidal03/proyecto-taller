/**
 * HTTP Route Repository - Infrastructure Layer (Frontend)
 */
import { Route } from '../../../domain/entities/Route';
import { IRouteRepository, CreateRouteDTO } from '../../../domain/ports/IRouteRepository';
import { http } from '../httpClient';

export class HttpRouteRepository implements IRouteRepository {
  private readonly basePath = '/routes';

  async create(data: CreateRouteDTO): Promise<Route> {
    const response = await http.post<Route>(this.basePath, data);
    return response.data;
  }
}
