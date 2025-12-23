import { Category } from '../entities/Category';

export interface CreateCategoryDTO {
  name: string;
  description?: string | null;
}

export interface UpdateCategoryDTO {
  name?: string;
  description?: string | null;
}

export interface ICategoryRepository {
  getAll(): Promise<Category[]>;
  getById(id: number): Promise<Category>;
  create(data: CreateCategoryDTO): Promise<Category>;
  update(id: number, data: UpdateCategoryDTO): Promise<Category>;
  delete(id: number): Promise<void>;
}
