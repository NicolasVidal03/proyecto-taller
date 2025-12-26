import { Area } from '../entities/Area';

export interface PaginatedAreas {
  data: Area[];
  total: number;
  page: number;
  size: number;
}

export interface IAreaRepository {
  getAll(page: number, size: number): Promise<PaginatedAreas>;
  getById(id: number): Promise<Area>;
}
