import { http } from '../httpClient';
import { IBusinessRepository, CreateBusinessDTO, UpdateBusinessDTO } from '../../../domain/ports/IBusinessRepository';
import { Business } from '../../../domain/entities/Business';

export class HttpBusinessRepository implements IBusinessRepository {
  async getAll(): Promise<Business[]> {
    const res = await http.get('/business');
    const data = res.data || [];
    return data.map(this.mapBusinessResponse);
  }

  async getByClientId(clientId: number): Promise<Business[]> {
    const all = await this.getAll();
    return all.filter((b) => Number(b.clientId) === Number(clientId));
  }

  async create(data: CreateBusinessDTO, userId?: number | null): Promise<Business> {
    if (data.imageFile) {
      const fd = this.createFormData(data, userId);
      const res = await http.post('/business', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return this.mapBusinessResponse(res.data);
    }

    const payload = this.createPayload(data, userId);
    const res = await http.post('/business', payload);
    return this.mapBusinessResponse(res.data);
  }

  async update(id: number, data: UpdateBusinessDTO, userId?: number | null): Promise<Business | null> {
    if (data.imageFile) {
      const fd = this.createFormData(data, userId);
      const res = await http.patch(`/business/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return this.mapBusinessResponse(res.data);
    }

    const payload = this.createPayload(data, userId);
    const res = await http.patch(`/business/${id}`, payload);
    return this.mapBusinessResponse(res.data);
  }

  async softDelete(id: number, userId?: number | null): Promise<boolean> {
    await http.delete(`/business/${id}`, { data: { user_id: userId } });
    return true;
  }

  
  private createFormData(data: CreateBusinessDTO | UpdateBusinessDTO, userId?: number | null): FormData {
    const fd = new FormData();

    if (data.name !== undefined) fd.append('name', data.name);
    if (data.nit !== undefined && data.nit !== null) fd.append('nit', data.nit);
    if (data.address !== undefined && data.address !== null) fd.append('address', data.address);
    if ((data as any).clientId !== undefined) fd.append('clientId', String((data as any).clientId));
    if ((data as any).priceTypeId !== undefined) fd.append('priceTypeId', String((data as any).priceTypeId));
    if ((data as any).businessTypeId !== undefined) fd.append('businessTypeId', String((data as any).businessTypeId));
    const areaVal = (data as any).areaId !== undefined ? (data as any).areaId : (data as any).area_id;
    if (areaVal !== undefined) {
      fd.append('areaId', areaVal === null ? '' : String(areaVal));
    }
    if (data.position !== undefined && data.position !== null) {
      fd.append('position', JSON.stringify(data.position));
    }

    if ((data as any).isActive !== undefined) fd.append('isActive', String((data as any).isActive));
    if (userId !== undefined && userId !== null) fd.append('userId', String(userId));
    if (data.imageFile) fd.append('image', data.imageFile); 

    return fd;
  }

 
  private createPayload(data: CreateBusinessDTO | UpdateBusinessDTO, userId?: number | null): Record<string, any> {
    const payload: Record<string, any> = {};

    if (data.name !== undefined) payload.name = data.name;
    if (data.nit !== undefined) payload.nit = data.nit;
    if (data.address !== undefined) payload.address = data.address;
    if ((data as any).clientId !== undefined) payload.clientId = (data as any).clientId;
    if ((data as any).priceTypeId !== undefined) payload.priceTypeId = (data as any).priceTypeId;
    if ((data as any).businessTypeId !== undefined) payload.businessTypeId = (data as any).businessTypeId;
    const areaVal = (data as any).areaId !== undefined ? (data as any).areaId : (data as any).area_id;
    if (areaVal !== undefined) payload.areaId = areaVal;
    
    if (data.position !== undefined) payload.position = data.position;
    if ((data as any).isActive !== undefined) payload.isActive = (data as any).isActive;
    if (userId !== undefined && userId !== null) payload.userId = userId;

    return payload;
  }

  private mapBusinessResponse = (raw: any): Business => {
    if (!raw) throw new Error('Invalid business response');

    return {
      id: raw.id,
      name: raw.name,
      nit: raw.nit || null,
      position: raw.position || null,
      pathImage: raw.pathImage || null,
      address: raw.address || null,
      businessTypeId: raw.businessTypeId,
      clientId: raw.clientId,
      priceTypeId: raw.priceTypeId ?? null,
      areaId: raw.areaId ?? null,
      isActive: raw.isActive ?? true,
    };
  };
}