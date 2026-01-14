import { Route } from '../domain/entities/Route';
import { CreateRouteDTO, IRouteRepository } from '../domain/ports/IRouteRepository';

export class RouteService {
  constructor(private readonly repository: IRouteRepository) {}

  async create(data: CreateRouteDTO): Promise<Route> {
    return this.repository.create(data);
  }
}
