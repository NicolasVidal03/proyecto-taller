import { Area, AreaPoint } from '../entities/Area';

export interface PaginatedAreas {
  data: Area[];
  total: number;
  page: number;
  size: number;
}

export interface IAreaRepository {
  getAll(page: number, size: number): Promise<PaginatedAreas>;
  getById(id: number): Promise<Area>;
  create(name: string, area: AreaPoint[]): Promise<Area>;
  update(id: number, patch: { name?: string; area?: AreaPoint[] }): Promise<Area>;
  delete(id: number): Promise<void>;
}
