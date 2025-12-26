import { Client } from '../entities/Client';

export interface CreateClientDTO {
  fullName: string;
  nitCi: string;
  businessName: string;
  phone: string;
  businessType: string;
  clientType: string;
  position: { lat: number; lng: number };
  areaId?: number | null;
  address?: string;
  imageFile?: File;
}

export interface UpdateClientAreaDTO {
  areaId: number;
}

export interface UpdateClientDTO extends Partial<CreateClientDTO> {
  id: number;
}

export interface IClientRepository {
  getAll(): Promise<Client[]>;
  getById(id: number): Promise<Client>;
  create(data: CreateClientDTO): Promise<Client>;
  update(id: number, data: UpdateClientDTO): Promise<Client>;
  updateArea(id: number, data: UpdateClientAreaDTO): Promise<Client>;
  softDelete(id: number): Promise<void>;
}
