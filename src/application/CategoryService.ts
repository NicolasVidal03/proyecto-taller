import { Category } from '../domain/entities/Category';
import { ICategoryRepository, CreateCategoryDTO, UpdateCategoryDTO } from '../domain/ports/ICategoryRepository';

export class CategoryService {
  constructor(private categoryRepo: ICategoryRepository) {}

  async getAll(): Promise<Category[]> {
    return this.categoryRepo.getAll();
  }

  async getById(id: number): Promise<Category> {
    return this.categoryRepo.getById(id);
  }

  async create(data: CreateCategoryDTO): Promise<Category> {
    return this.categoryRepo.create(data);
  }

  async update(id: number, data: UpdateCategoryDTO): Promise<Category> {
    return this.categoryRepo.update(id, data);
  }

  async updateState(id: number, state: boolean): Promise<Category> {
    return this.categoryRepo.update(id, { state } as any);
  }

  async delete(id: number): Promise<void> {
    return this.categoryRepo.delete(id);
  }
}
