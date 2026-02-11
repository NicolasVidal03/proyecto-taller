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

export interface IBusinessRepository {
  getAll(): Promise<Business[]>;
  getByClientId(clientId: number): Promise<Business[]>;
  create(data: CreateBusinessDTO, userId?: number | null): Promise<Business>;
  update(id: number, data: UpdateBusinessDTO, userId?: number | null): Promise<Business | null>;
  softDelete(id: number, userId?: number | null): Promise<boolean>;
}