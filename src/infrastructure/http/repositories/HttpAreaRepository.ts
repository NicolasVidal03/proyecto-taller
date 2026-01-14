import { http } from '../httpClient';
import { Area, AreaPoint } from '../../../domain/entities/Area';
import { IAreaRepository, PaginatedAreas } from '../../../domain/ports/IAreaRepository';


export class HttpAreaRepository implements IAreaRepository {
  async getAll(page: number = 1, size: number = 10): Promise<PaginatedAreas> {
    const response = await http.get('/areas', { params: { page, size } });
    if (Array.isArray(response.data)) {
      return {
        data: response.data,
        total: response.data.length,
        page: 1,
        size: response.data.length,
      };
    }
    return response.data;
  }

  async getById(id: number): Promise<Area> {
    const response = await http.get(`/areas/${id}`);
    return response.data;
  }

  async create(name: string, area: AreaPoint[]): Promise<Area> {
    const response = await http.post('/areas', { name, area });
    return response.data;
  }

  async update(
    id: number,
    patch: { name?: string; area?: AreaPoint[] }
  ): Promise<Area> {
    const response = await http.patch(`/areas/${id}`, patch);
    return response.data;
  }

 
  async delete(id: number): Promise<void> {
    await http.delete(`/areas/${id}`);
  }
}

export const areaRepository = new HttpAreaRepository();
