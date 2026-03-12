import { Presale } from "@domain/entities/Presale";

export interface CreatePresaleDetailsDTO {
  productId: number,
  quantityRequested: number,
  priceTypeId: number,
  unitPrice: number
}

export interface CreatePresaleDTO {
  clientId: number,
  businessId: number,
  branchId:number,
  deliveryDate: string,
  notes?: string | null,
  details: CreatePresaleDetailsDTO[],
}

export interface UpdatePresaleDetailDTO {
    detailId: number;
    quantityRequested: number;
    unitPrice: number;
}

export interface UpdatePresaleDetailsDTO {
    update: UpdatePresaleDetailDTO[];
    add: CreatePresaleDetailsDTO[];
    remove: number[];
}

export interface UpdatePresaleDTO {
    clientId?: number;
    businessId?: number;
    branchId?: number;
    deliveryDate?: string;
    notes?: string | null;
    details?: UpdatePresaleDetailsDTO;
}

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
    getById(id: number, details?: boolean): Promise<Presale>
    assign(presaleId: number, distributorId: number): Promise<Presale | null>;
    create(data:CreatePresaleDTO): Promise<Presale>;
    update(id: number, data: UpdatePresaleDTO): Promise<Presale>;
}