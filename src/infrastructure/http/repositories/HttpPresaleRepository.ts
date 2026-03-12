import { Presale } from '@domain/entities';
import { http } from '../httpClient';
import { CreatePresaleDTO, IPresaleRepository, PaginatedPresales, PresaleFilters, UpdatePresaleDTO } from "@domain/ports/IPresaleRepository";

export class HttpPresaleRepository implements IPresaleRepository {
    async getAll(filters?: PresaleFilters): Promise<PaginatedPresales> {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', String(filters.status));
        if (filters?.branchId) params.append('branchId', String(filters.branchId));
        if (filters?.state !== undefined) params.append('state', String(filters.state));
        if (filters?.search) params.append('search', filters.search);
        if (filters?.page) params.append('page', String(filters.page));
        if (filters?.limit) params.append('limit', String(filters.limit));

        const queryString = params.toString();
        const url = queryString ? `/presales?${queryString}` : '/presales';
        const res = await http.get(url);
        return res.data;
    }

    async getById(id: number, details?: boolean): Promise<Presale> {
        const withDetails = details ? '?withDetails=true' : ''
        const res = await http.get(`/presales/${id + withDetails}`)
        return res.data;
    }

    async assign(presaleId: number, distributorId: number): Promise<Presale | null> {
        const url = `/presales/${presaleId}/assign`
        const res = await http.patch(url, { distributorId: distributorId })
        return res.data;
    }

    async create(data: CreatePresaleDTO): Promise<Presale> {
        const res = await http.post('/presales', data)
        return res.data;
    }

    async update(id: number, data: UpdatePresaleDTO): Promise<Presale> {
    console.log('PUT /presales/', id, JSON.stringify(data, null, 2));
    try {
        const res = await http.put(`/presales/${id}`, data);
        console.log('response:', res.data);
        return res.data;
    } catch (err: any) {
        console.log('error response:', err.response?.data); // ← agrega esto
        throw err;
    }
}
} 