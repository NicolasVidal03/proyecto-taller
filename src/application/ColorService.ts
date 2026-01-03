import { Color } from '../domain/entities/Color';
import { IColorRepository, CreateColorDTO, UpdateColorDTO } from '../domain/ports/IColorRepository';

export class ColorService {
  constructor(private colorRepo: IColorRepository) {}

  async getAll(): Promise<Color[]> {
    return this.colorRepo.getAll();
  }

  async getById(id: number): Promise<Color> {
    return this.colorRepo.getById(id);
  }

  async create(data: CreateColorDTO): Promise<Color> {
    return this.colorRepo.create(data);
  }

  async update(id: number, data: UpdateColorDTO): Promise<Color> {
    return this.colorRepo.update(id, data);
  }

  async updateState(id: number, userId: number): Promise<void> {
    return this.colorRepo.updateState(id, userId);
  }

  async delete(id: number): Promise<void> {
    return this.colorRepo.delete(id);
  }
}
