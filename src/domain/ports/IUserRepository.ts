import { User } from '../entities/User';

/**
 * DTO para crear un nuevo usuario
 */
export interface CreateUserDTO {
  username: string;
  ci: string;
  password: string;
  names: string;
  lastName: string;
  secondLastName: string | null;
  role: string;
  branchId: number;
}

/**
 * DTO para actualizar un usuario existente
 */
export interface UpdateUserDTO {
  username?: string;
  ci?: string;
  password?: string;
  names?: string;
  lastName?: string;
  secondLastName?: string | null;
  role?: string;
  branchId?: number;
}

/**
 * Puerto del repositorio de usuarios
 * Define el contrato que debe implementar cualquier adaptador de infraestructura
 */
export interface IUserRepository {
  getAll(): Promise<User[]>;
  getById(id: number): Promise<User>;
  create(data: CreateUserDTO): Promise<User>;
  update(id: number, data: UpdateUserDTO): Promise<User>;
  updateState(id: number, state: boolean, currentUserId: number): Promise<void>;
  resetPassword(id: number): Promise<void>;
  updatePassword(id: number, newPassword: string): Promise<void>;
}
