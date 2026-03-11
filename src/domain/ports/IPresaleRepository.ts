import { Presale } from "@domain/entities/Presale";

export interface PresaleFilters {
  status?: string;
  branchId?: number;
  state?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedPresales {
  data: Presale[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IPresaleRepository {
    getAll(filters?: PresaleFilters):  Promise<PaginatedPresales>;
}