import { User } from '../entities/User';

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

export interface IUserRepository {
  getAll(): Promise<User[]>;
  getById(id: number): Promise<User>;
  create(data: CreateUserDTO): Promise<User>;
  update(id: number, data: UpdateUserDTO): Promise<User>;
}
