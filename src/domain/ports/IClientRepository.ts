import { Client } from '../entities/Client';

export interface CreateClientDTO {
  name: string;
  lastName: string;
  secondLastName: string;
  phone: string;
  ci?: string | null;
  ciExt?: string | null;
}


export interface UpdateClientDTO {
  id: number;
  name?: string;
  lastName?: string;
  secondLastName?: string;
  phone?: string;
  ci?: string | null;
  ciExt?: string | null;
}

export interface ClientSearchParams {
  search?: string;
  limit?: number;
}

export interface IClientRepository {
  getAll(): Promise<Client[]>;
  getById(id: number): Promise<Client>;
  create(data: CreateClientDTO): Promise<Client>;
  update(id: number, data: UpdateClientDTO): Promise<Client>;
  softDelete(id: number): Promise<void>;
  search(params: ClientSearchParams): Promise<Client[]>;
}
