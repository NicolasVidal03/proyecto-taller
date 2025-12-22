import { http } from '../httpClient';
import { User } from '../../../domain/entities/User';
import { IUserRepository, CreateUserDTO, UpdateUserDTO } from '../../../domain/ports/IUserRepository';

/**
 * Implementación HTTP del repositorio de usuarios
 * Adaptador de infraestructura que conecta con el backend via REST
 */
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
    const response = await http.post<{ user: User }>(this.basePath, data);
    return response.data.user;
  }

  async update(id: number, data: UpdateUserDTO): Promise<User> {
    const response = await http.put<{ user: User }>(`${this.basePath}/${id}`, data);
    return response.data.user;
  }

  async updateState(id: number, state: boolean, currentUserId: number): Promise<void> {
    // El backend espera user_id en el body para auditoría
    await http.patch(
      `${this.basePath}/${id}/state`,
      { state, user_id: currentUserId }
    );
  }
}
