import { http } from '../httpClient';
import { IPresaleRepository, PaginatedPresales, PresaleFilters } from "@domain/ports/IPresaleRepository";

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
        const url = queryString ? `/presales/presale?${queryString}` : '/presales/presale';
        const res = await http.get(url);
        return res.data;
    }
} 