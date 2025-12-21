import { User } from '../domain/entities/User';
import { IUserRepository, CreateUserDTO, UpdateUserDTO } from '../domain/ports/IUserRepository';

export class UserService {
  constructor(private userRepo: IUserRepository) {}

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

  async updateState(id: number, state: boolean): Promise<User> {
    return this.userRepo.update(id, { state } as any);
  }

}
