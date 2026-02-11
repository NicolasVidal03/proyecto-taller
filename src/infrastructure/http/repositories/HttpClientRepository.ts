import { http } from '../httpClient';
import { IClientRepository, CreateClientDTO, UpdateClientDTO, ClientSearchParams } from '../../../domain/ports/IClientRepository';
import { Client } from '../../../domain/entities/Client';

export class HttpClientRepository implements IClientRepository {
  async getAll(): Promise<Client[]> {
    const res = await http.get('/clients');
    const data = res.data;
    if (Array.isArray(data)) return data.map(this.mapClientResponse);
    return [];
  }

  async getById(id: number): Promise<Client> {
    const res = await http.get(`/clients/${id}`);
    return this.mapClientResponse(res.data);
  }

  async create(data: CreateClientDTO): Promise<Client> {
    const payload = this.createPayload(data);
    const res = await http.post('/clients', payload);
    return this.mapClientResponse(res.data);
  }

  async update(id: number, data: UpdateClientDTO): Promise<Client> {
    const payload = this.createPayload(data);
    const res = await http.patch(`/clients/${id}`, payload);
    return this.mapClientResponse(res.data);
  }

  async softDelete(id: number): Promise<void> {
    await http.delete(`/clients/${id}`);
  }

  async search(params: ClientSearchParams): Promise<Client[]> {
    const { search = '', limit = 10 } = params;
    
    try {
      const res = await http.get('/clients/search', {
        params: { q: search, limit }
      });
      
      if (Array.isArray(res.data)) {
        return res.data.map(this.mapClientResponse);
      }
      return [];
    } catch (error) {
      console.error('Error searching clients:', error);
      return [];
    }
  }

  private createPayload(data: CreateClientDTO | UpdateClientDTO): Record<string, any> {
    const payload: Record<string, any> = {};

    if (data.name !== undefined) payload.name = data.name;
    if (data.lastName !== undefined) payload.lastName = data.lastName;
    if (data.secondLastName !== undefined) payload.secondLastName = data.secondLastName;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.ci !== undefined) payload.ci = data.ci;
    
    
    return payload;
  }

  
  private mapClientResponse = (raw: any): Client => {
    if (!raw) throw new Error('Invalid client response');

    return {
      id: raw.id,
      name: raw.name,
      lastName: raw.lastName,
      secondLastName: raw.secondLastName,
      phone: raw.phone,
      ci: raw.ci || null,
      ciExt: raw.ciExt ?? raw.ci_ext ?? null,
    };
  };
}
