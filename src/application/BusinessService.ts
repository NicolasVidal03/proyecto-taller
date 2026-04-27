import {
  IBusinessRepository,
  CreateBusinessDTO,
  BusinessFilters,
  PaginatedBusinessesResult,
} from '../domain/ports/IBusinessRepository';
import { Business } from '../domain/entities/Business';

export class BusinessService {
  constructor(private repository: IBusinessRepository) {}

  async listPaginated(
    filters: BusinessFilters & { page?: number; limit?: number },
  ): Promise<PaginatedBusinessesResult> {
    return this.repository.getAll(filters);
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