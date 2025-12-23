import { User } from '../domain/entities/User';
import { IUserRepository, CreateUserDTO, UpdateUserDTO } from '../domain/ports/IUserRepository';

/**
 * UserService - Application Layer
 * Caso de uso para gestión de usuarios
 */
export class UserService {
  constructor(private readonly userRepo: IUserRepository) {}

  /**
   * Obtiene todos los usuarios
   */
  async getAll(): Promise<User[]> {
    return this.userRepo.getAll();
  }

  /**
   * Obtiene un usuario por ID
   */
  async getById(id: number): Promise<User> {
    return this.userRepo.getById(id);
  }

  /**
   * Crea un nuevo usuario
   */
  async create(data: CreateUserDTO): Promise<User> {
    return this.userRepo.create(data);
  }

  /**
   * Actualiza un usuario existente
   */
  async update(id: number, data: UpdateUserDTO): Promise<User> {
    return this.userRepo.update(id, data);
  }

  /**
   * Actualiza el estado de un usuario (borrado lógico)
   */
  async updateState(id: number, state: boolean, currentUserId: number): Promise<void> {
    return this.userRepo.updateState(id, state, currentUserId);
  }

  /**
   * Reset user password (server will generate new password)
   */
  async resetPassword(id: number): Promise<void> {
    return this.userRepo.resetPassword(id);
  }
}
