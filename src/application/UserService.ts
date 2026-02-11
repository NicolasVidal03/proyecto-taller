import { User } from '../domain/entities/User';
import { IUserRepository, CreateUserDTO, UpdateUserDTO } from '../domain/ports/IUserRepository';

export class UserService {
  constructor(private readonly userRepo: IUserRepository) {}
  async getAll(): Promise<User[]> {
    return this.userRepo.getAll();
  }

  async getById(id: number): Promise<User> {
    return this.userRepo.getById(id);
  }

  async create(data: CreateUserDTO): Promise<User> {
    return this.userRepo.create(data);
  }

  async update(id: number, data: UpdateUserDTO): Promise<User> {
    return this.userRepo.update(id, data);
  }

  async updateState(id: number, state: boolean, currentUserId: number): Promise<void> {
    return this.userRepo.updateState(id, state, currentUserId);
  }

  async resetPassword(id: number): Promise<void> {
    return this.userRepo.resetPassword(id);
  }

  async updatePassword(id: number, newPassword: string): Promise<void> {
    return this.userRepo.updatePassword(id, newPassword);
  }

  async changeFirstLoginPassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return this.userRepo.changeFirstLoginPassword(currentPassword, newPassword);
  }
}
