import { Route } from '../entities/Route';

export interface CreateRouteDTO {
  assignedIdUser: number;
  assignedIdArea: number;
  assignedDate: string;
}

export interface UpdateRouteDTO {
  assignedIdUser?: number;
  assignedIdArea?: number;
  assignedDate?: string;
}

export interface IRouteRepository {
  create(data: CreateRouteDTO): Promise<Route>;
  getRoutes(): Promise<Route[]>;
  update(id: number, data: UpdateRouteDTO): Promise<Route>;
}