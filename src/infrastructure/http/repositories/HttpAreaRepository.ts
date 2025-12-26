import { http } from '../httpClient';
import { IAreaRepository, PaginatedAreas } from '../../../domain/ports/IAreaRepository';
import { Area } from '../../../domain/entities/Area';

export class HttpAreaRepository implements IAreaRepository {
  private readonly basePath = '/areas';

  async getAll(page: number, size: number): Promise<PaginatedAreas> {
    const response = await http.get<PaginatedAreas>(`${this.basePath}?page=${page}&size=${size}`);
    return response.data;
  }

  async getById(id: number): Promise<Area> {
    const response = await http.get<Area>(`${this.basePath}/${id}`);
    return response.data;
  }
}
