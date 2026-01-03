import { Presentation } from '../entities/Presentation';

export interface CreatePresentationDTO {
  name: string;
  userId?: number;
}

export interface UpdatePresentationDTO {
  name?: string;
  user_id?: number;
}

export interface IPresentationRepository {
  getAll(): Promise<Presentation[]>;
  getById(id: number): Promise<Presentation>;
  create(data: CreatePresentationDTO): Promise<Presentation>;
  update(id: number, data: UpdatePresentationDTO): Promise<Presentation>;
  updateState(id: number, userId: number): Promise<void>;
  delete(id: number): Promise<void>;
}
