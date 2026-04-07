import { Presale } from '@domain/entities';
import { http } from '../httpClient';
import { CreatePresaleDTO, IPresaleRepository, PaginatedPresaleReport, PaginatedPresales, PresaleFilters, PresaleReportFilters, UpdatePresaleDTO } from "@domain/ports/IPresaleRepository";

export class HttpPresaleRepository implements IPresaleRepository {
    async getAll(filters?: PresaleFilters): Promise<PaginatedPresales> {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', String(filters.status));
        if (filters?.branchId) params.append('branchId', String(filters.branchId));
        if (filters?.presellerId) params.append('presellerId', String(filters.presellerId));
        if (filters?.distributorId) params.append('distributorId', String(filters.distributorId));
        if (filters?.deliveryDateFrom) params.append('deliveryDateFrom', String(filters.deliveryDateFrom));
        if (filters?.deliveryDateTo) params.append('deliveryDateTo', String(filters.deliveryDateTo));
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
        try {
            const res = await http.put(`/presales/${id}`, data);
            return res.data;
        } catch (err: any) {
            throw err;
        }
    }

    async cancelPresale(id: number, reason?: string): Promise<Presale> {
        const res = await http.patch(`/presales/${id}/cancel`, { reason: reason ?? null });
        return res.data;
    }
    private buildReportParams(filters?: PresaleReportFilters): URLSearchParams {
        const params = new URLSearchParams();
        if (filters?.userId) params.append('userId', String(filters.userId));
        if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters?.dateTo) params.append('dateTo', filters.dateTo);
        return params;
    }

    async getReport(filters?: PresaleReportFilters, page?: number, limit?: number,): Promise<PaginatedPresaleReport> {
        const params = this.buildReportParams(filters);
        if (page) params.append('page', String(page));
        if (limit) params.append('limit', String(limit));

        const qs = params.toString();
        const url = qs ? `/presales/report?${qs}` : '/presales/report';
        const res = await http.get(url);
        return res.data;
    }

    async downloadReportPdf(filters?: PresaleReportFilters): Promise<Blob> {
        const params = this.buildReportParams(filters);
        const qs = params.toString();
        const url = qs ? `/presales/report/pdf?${qs}` : '/presales/report/pdf';
        const res = await http.get(url, { responseType: 'blob' });
        return res.data;
    }

    async downloadReportExcel(filters?: PresaleReportFilters): Promise<Blob> {
        const params = this.buildReportParams(filters);
        const qs = params.toString();
        const url = qs ? `/presales/report/excel?${qs}` : '/presales/report/excel';
        const res = await http.get(url, { responseType: 'blob' });
        return res.data;
    }
}