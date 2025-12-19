import { http } from '../httpClient';
import { User } from '../../../domain/entities/User';
import { IUserRepository, CreateUserDTO, UpdateUserDTO } from '../../../domain/ports/IUserRepository';

export class HttpUserRepository implements IUserRepository {
  async getAll(): Promise<User[]> {
    const res = await http.get('/users');
    return res.data;
  }

  async getById(id: number): Promise<User> {
    const res = await http.get(`/users/${id}`);
    return res.data;
  }

  async create(data: CreateUserDTO): Promise<User> {
    const res = await http.post('/users', data);
    return res.data.user;
  }

  async update(id: number, data: UpdateUserDTO): Promise<User> {
    const res = await http.put(`/users/${id}`, data);
    return res.data.user;
  }

  async delete(id: number): Promise<void> {
    await http.delete(`/users/${id}`);
  }
}
