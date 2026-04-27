import { Business, Position } from '../entities/Business';

export interface CreateBusinessDTO {
  name: string;
  businessTypeId: number;
  clientId: number;
  priceTypeId?: number | null;
  areaId?: number | null;
  nit?: string | null;
  position?: Position | null;
  address?: string | null;
  isActive?: boolean;
  imageFile?: File;
}

export interface UpdateBusinessDTO {
  id: number;
  name?: string;
  businessTypeId?: number;
  clientId?: number;
  priceTypeId?: number | null;
  areaId?: number | null;
  nit?: string | null;
  position?: Position | null;
  address?: string | null;
  isActive?: boolean;
  imageFile?: File;
}

export interface BusinessFilters {
  search?: string;
  areaId?: number;
  state?: boolean;
}

export interface PaginatedBusinessesResult {
  data: Business[];
  total: number;
  totalPages: number;
  page: number;
}

export interface IBusinessRepository {
  getAll(filters: BusinessFilters & { page?: number; limit?: number }): Promise<PaginatedBusinessesResult>;
  getByClientId(clientId: number): Promise<Business[]>;
  create(data: CreateBusinessDTO, userId?: number | null): Promise<Business>;
  update(id: number, data: UpdateBusinessDTO, userId?: number | null): Promise<Business | null>;
  softDelete(id: number, userId?: number | null): Promise<boolean>;
}