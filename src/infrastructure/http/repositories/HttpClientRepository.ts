import { http } from '../httpClient';
import { IClientRepository, CreateClientDTO, UpdateClientDTO, UpdateClientAreaDTO } from '../../../domain/ports/IClientRepository';
import { Client } from '../../../domain/entities/Client';

export class HttpClientRepository implements IClientRepository {
  async getAll(): Promise<Client[]> {
    const res = await http.get('/clients');
    return res.data;
  }

  async getById(id: number): Promise<Client> {
    const res = await http.get(`/clients/${id}`);
    return res.data;
  }

  async create(data: CreateClientDTO): Promise<Client> {
    // Si hay imagen, enviar como multipart/form-data
    if (data.imageFile) {
      const formData = this.createFormData(data);
      const res = await http.post('/clients', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    }

    // Sin imagen, enviar JSON
    const payload = this.createJsonPayload(data);
    const res = await http.post('/clients', payload);
    return res.data;
  }

  async update(id: number, data: UpdateClientDTO): Promise<Client> {
    if (data.imageFile) {
      const formData = this.createFormData(data);
      const res = await http.patch(`/clients/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    }

    const payload = this.createJsonPayload(data);
    const res = await http.patch(`/clients/${id}`, payload);
    return res.data;
  }

  async updateArea(id: number, data: UpdateClientAreaDTO): Promise<Client> {
    const res = await http.patch(`/clients/${id}`, { areaId: data.areaId });
    return res.data;
  }

  async softDelete(id: number): Promise<void> {
    await http.delete(`/clients/${id}`);
  }

  private createFormData(data: CreateClientDTO | UpdateClientDTO): FormData {
    const formData = new FormData();
    if (data.fullName) formData.append('fullName', data.fullName);
    if (data.nitCi) formData.append('nitCi', data.nitCi);
    if (data.businessName) formData.append('businessName', data.businessName);
    if (data.phone) formData.append('phone', data.phone);
    if (data.businessType) formData.append('businessType', data.businessType);
    if (data.clientType) formData.append('clientType', data.clientType);
    if (data.position) formData.append('position', JSON.stringify(data.position));
    if (data.areaId !== undefined) formData.append('areaId', data.areaId === null ? '' : String(data.areaId));
    if (data.address) formData.append('address', data.address);
    if (data.imageFile) formData.append('image', data.imageFile);
    return formData;
  }

  private createJsonPayload(data: CreateClientDTO | UpdateClientDTO): any {
    return {
      fullName: data.fullName,
      nitCi: data.nitCi,
      businessName: data.businessName,
      phone: data.phone,
      businessType: data.businessType,
      clientType: data.clientType,
      position: data.position,
      areaId: data.areaId,
      address: data.address,
    };
  }
}
