import { http } from '../httpClient';
import { User } from '../../../domain/entities/User';
import { IUserRepository, CreateUserDTO, UpdateUserDTO } from '../../../domain/ports/IUserRepository';


export class HttpUserRepository implements IUserRepository {
  private readonly basePath = '/users';

  async getAll(): Promise<User[]> {
    const response = await http.get<User[]>(this.basePath);
    return response.data;
  }

  async getById(id: number): Promise<User> {
    const response = await http.get<User>(`${this.basePath}/${id}`);
    return response.data;
  }

  async create(data: CreateUserDTO): Promise<User> {
    const response = await http.post<User>(this.basePath, data);
    return response.data;
  }

  async update(id: number, data: UpdateUserDTO): Promise<User> {
    const payload: any = { ...data };
    if ((payload as any).username !== undefined) {
      payload.userName = (payload as any).username;
      delete payload.username;
    }
    const response = await http.patch<User>(`${this.basePath}/${id}`, payload);
    return response.data;
  }

  async updateState(id: number, state: boolean, currentUserId: number): Promise<void> {
    await http.patch(
      `${this.basePath}/${id}/state`,
      { state, user_id: currentUserId }
    );
  }

  async resetPassword(id: number): Promise<void> {
    await http.post(`${this.basePath}/${id}/reset-password`);
  }

  async updatePassword(id: number, newPassword: string): Promise<void> {
    await http.patch(`${this.basePath}/${id}/password`, { password: newPassword });
  }
}
