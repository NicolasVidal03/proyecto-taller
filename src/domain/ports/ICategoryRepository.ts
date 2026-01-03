import { Category } from '../entities/Category';

export interface CreateCategoryDTO {
  name: string;
  description?: string | null;
  userId?: number;
}

export interface UpdateCategoryDTO {
  name?: string;
  description?: string | null;
  user_id?: number;
}

export interface ICategoryRepository {
  getAll(): Promise<Category[]>;
  getById(id: number): Promise<Category>;
  create(data: CreateCategoryDTO): Promise<Category>;
  update(id: number, data: UpdateCategoryDTO): Promise<Category>;
  updateState(id: number, userId: number): Promise<void>;
  delete(id: number): Promise<void>;
}
