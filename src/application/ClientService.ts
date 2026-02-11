import { IClientRepository, CreateClientDTO, UpdateClientDTO, ClientSearchParams } from '../domain/ports/IClientRepository';
import { Client } from '../domain/entities/Client';

export class ClientService {
  constructor(private repository: IClientRepository) {}

  async listPaginated(): Promise<Client[]> {
    return this.repository.getAll();
  }

  async getById(id: number): Promise<Client> {
    return this.repository.getById(id);
  }

  async create(data: CreateClientDTO): Promise<Client> {
    return this.repository.create(data);
  }

  async update(id: number, data: UpdateClientDTO): Promise<Client> {
    return this.repository.update(id, data);
  }

  async softDelete(id: number): Promise<void> {
    return this.repository.softDelete(id);
  }

  async search(params: ClientSearchParams): Promise<Client[]> {
    return this.repository.search(params);
  }
}
