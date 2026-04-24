import { Route } from '../domain/entities/Route';
import { CreateRouteDTO, UpdateRouteDTO, IRouteRepository } from '../domain/ports/IRouteRepository';

export class RouteService {
  constructor(private readonly repository: IRouteRepository) {}

  async create(data: CreateRouteDTO): Promise<Route> {
    return this.repository.create(data);
  }

  async getRoutes(): Promise<Route[]> {
    return this.repository.getRoutes();
  }

  async update(id: number, data: UpdateRouteDTO): Promise<Route> {
    return this.repository.update(id, data);
  }
}