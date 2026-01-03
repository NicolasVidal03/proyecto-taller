import { Color } from '../entities/Color';

export interface CreateColorDTO {
  name: string;
  userId?: number;
}

export interface UpdateColorDTO {
  name?: string;
  user_id?: number;
}

export interface IColorRepository {
  getAll(): Promise<Color[]>;
  getById(id: number): Promise<Color>;
  create(data: CreateColorDTO): Promise<Color>;
  update(id: number, data: UpdateColorDTO): Promise<Color>;
  updateState(id: number, userId: number): Promise<void>;
  delete(id: number): Promise<void>;
}
