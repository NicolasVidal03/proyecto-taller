import { http } from '../httpClient';
import { Brand } from '../../../domain/entities/Brand';
import { IBrandRepository, CreateBrandDTO, UpdateBrandDTO } from '../../../domain/ports/IBrandRepository';

export class HttpBrandRepository implements IBrandRepository {
  async getAll(): Promise<Brand[]> {
    const res = await http.get('/brands');
    return res.data;
  }

  async getById(id: number): Promise<Brand> {
    const res = await http.get(`/brands/${id}`);
    return res.data;
  }

  async create(data: CreateBrandDTO): Promise<Brand> {
    const res = await http.post('/brands', data);
    return res.data;
  }

  async update(id: number, data: UpdateBrandDTO): Promise<Brand> {
    const res = await http.patch(`/brands/${id}`, data);
    return res.data;
  }

  async updateState(id: number, userId: number): Promise<void> {
    await http.patch(`/brands/${id}/state`, { user_id: userId });
  }
}
