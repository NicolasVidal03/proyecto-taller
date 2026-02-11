import { User } from '../entities/User';

export interface CreateUserDTO {
  ci: string;
  names: string;
  lastName: string;
  secondLastName: string | null;
  role: string;
  branchId: number;
  email: string;
}

export interface UpdateUserDTO {
  ci?: string;
  names?: string;
  lastName?: string;
  secondLastName?: string | null;
  role?: string;
  branchId?: number;
  email?: string;
}

export interface IUserRepository {
  getAll(): Promise<User[]>;
  getById(id: number): Promise<User>;
  create(data: CreateUserDTO): Promise<User>;
  update(id: number, data: UpdateUserDTO): Promise<User>;
  updateState(id: number, state: boolean, currentUserId: number): Promise<void>;
  resetPassword(id: number): Promise<void>;
  updatePassword(id: number, newPassword: string): Promise<void>;
  changeFirstLoginPassword(currentPassword: string, newPassword: string): Promise<{ message: string }>;
}
