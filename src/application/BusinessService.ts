import { IBusinessRepository, CreateBusinessDTO } from '../domain/ports/IBusinessRepository';
import { Business } from '../domain/entities/Business';

export class BusinessService {
  constructor(private repository: IBusinessRepository) {}

  async listAll(): Promise<Business[]> {
    return this.repository.getAll();
  }

  async getByClient(clientId: number): Promise<Business[]> {
    return this.repository.getByClientId(clientId);
  }

  async create(data: CreateBusinessDTO, userId?: number | null): Promise<Business> {
    return this.repository.create(data, userId);
  }

  async update(id: number, data: any, userId?: number | null): Promise<Business | null> {
    return this.repository.update(id, data, userId);
  }

  async softDelete(id: number, userId?: number | null): Promise<boolean> {
    return this.repository.softDelete(id, userId);
  }
}
