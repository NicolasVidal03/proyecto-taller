import { http } from '../httpClient';
import { Presentation } from '../../../domain/entities/Presentation';
import { IPresentationRepository, CreatePresentationDTO, UpdatePresentationDTO } from '../../../domain/ports/IPresentationRepository';

export class HttpPresentationRepository implements IPresentationRepository {
  async getAll(): Promise<Presentation[]> {
    const res = await http.get('/presentations');
    return res.data;
  }

  async getById(id: number): Promise<Presentation> {
    const res = await http.get(`/presentations/${id}`);
    return res.data;
  }

  async create(data: CreatePresentationDTO): Promise<Presentation> {
    const res = await http.post('/presentations', data);
    return res.data;
  }

  async update(id: number, data: UpdatePresentationDTO): Promise<Presentation> {
    const res = await http.patch(`/presentations/${id}`, data);
    return res.data;
  }

  async updateState(id: number, userId: number): Promise<void> {
    await http.patch(`/presentations/${id}/state`, { user_id: userId });
  }

  async delete(id: number): Promise<void> {
    await http.delete(`/presentations/${id}`);
  }
}
