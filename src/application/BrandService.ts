import { Brand } from '../domain/entities/Brand';
import { IBrandRepository, CreateBrandDTO, UpdateBrandDTO } from '../domain/ports/IBrandRepository';

export class BrandService {
  constructor(private brandRepo: IBrandRepository) {}

  async getAll(): Promise<Brand[]> {
    return this.brandRepo.getAll();
  }

  async getById(id: number): Promise<Brand> {
    return this.brandRepo.getById(id);
  }

  async create(data: CreateBrandDTO): Promise<Brand> {
    return this.brandRepo.create(data);
  }

  async update(id: number, data: UpdateBrandDTO): Promise<Brand> {
    return this.brandRepo.update(id, data);
  }

  async updateState(id: number, userId: number): Promise<void> {
    return this.brandRepo.updateState(id, userId);
  }
}
