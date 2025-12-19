import { http } from '../httpClient';
import { Category } from '../../../domain/entities/Category';
import { ICategoryRepository, CreateCategoryDTO, UpdateCategoryDTO } from '../../../domain/ports/ICategoryRepository';

export class HttpCategoryRepository implements ICategoryRepository {
  async getAll(): Promise<Category[]> {
    const res = await http.get('/categories');
    return res.data;
  }

  async getById(id: number): Promise<Category> {
    const res = await http.get(`/categories/${id}`);
    return res.data;
  }

  async create(data: CreateCategoryDTO): Promise<Category> {
    const res = await http.post('/categories', data);
    return res.data.category;
  }

  async update(id: number, data: UpdateCategoryDTO): Promise<Category> {
    const res = await http.put(`/categories/${id}`, data);
    return res.data.category;
  }

  async delete(id: number): Promise<void> {
    await http.delete(`/categories/${id}`);
  }
}
