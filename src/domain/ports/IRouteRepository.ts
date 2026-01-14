import { Route } from '../entities/Route';

export interface CreateRouteDTO {
  assignedIdUser: number;
  assignedIdArea: number;
  assignedDate: string;
}

export interface IRouteRepository {
  create(data: CreateRouteDTO): Promise<Route>;
}
