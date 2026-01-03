import { Brand } from '../entities/Brand';

export interface CreateBrandDTO {
  name: string;
  userId: number;
}

export interface UpdateBrandDTO {
  name?: string;
  user_id?: number;
}

export interface IBrandRepository {
  getAll(): Promise<Brand[]>;
  getById(id: number): Promise<Brand>;
  create(data: CreateBrandDTO): Promise<Brand>;
  update(id: number, data: UpdateBrandDTO): Promise<Brand>;
  updateState(id: number, userId: number): Promise<void>;
}
