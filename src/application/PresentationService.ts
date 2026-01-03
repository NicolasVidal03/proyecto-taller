import { Presentation } from '../domain/entities/Presentation';
import { IPresentationRepository, CreatePresentationDTO, UpdatePresentationDTO } from '../domain/ports/IPresentationRepository';

export class PresentationService {
  constructor(private presentationRepo: IPresentationRepository) {}

  async getAll(): Promise<Presentation[]> {
    return this.presentationRepo.getAll();
  }

  async getById(id: number): Promise<Presentation> {
    return this.presentationRepo.getById(id);
  }

  async create(data: CreatePresentationDTO): Promise<Presentation> {
    return this.presentationRepo.create(data);
  }

  async update(id: number, data: UpdatePresentationDTO): Promise<Presentation> {
    return this.presentationRepo.update(id, data);
  }

  async updateState(id: number, userId: number): Promise<void> {
    return this.presentationRepo.updateState(id, userId);
  }

  async delete(id: number): Promise<void> {
    return this.presentationRepo.delete(id);
  }
}
