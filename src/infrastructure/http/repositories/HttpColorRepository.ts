import { http } from '../httpClient';
import { Color } from '../../../domain/entities/Color';
import { IColorRepository, CreateColorDTO, UpdateColorDTO } from '../../../domain/ports/IColorRepository';

export class HttpColorRepository implements IColorRepository {
  async getAll(): Promise<Color[]> {
    const res = await http.get('/colors');
    return res.data;
  }

  async getById(id: number): Promise<Color> {
    const res = await http.get(`/colors/${id}`);
    return res.data;
  }

  async create(data: CreateColorDTO): Promise<Color> {
    const res = await http.post('/colors', data);
    return res.data;
  }

  async update(id: number, data: UpdateColorDTO): Promise<Color> {
    const res = await http.patch(`/colors/${id}`, data);
    return res.data;
  }

  async updateState(id: number, userId: number): Promise<void> {
    await http.patch(`/colors/${id}/state`, { user_id: userId });
  }

  async delete(id: number): Promise<void> {
    await http.delete(`/colors/${id}`);
  }
}
