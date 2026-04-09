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
  branchId: number,
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

export type PresaleStatus = 'pendiente' | 'asignado' | 'entregado' | 'parcial' | 'cancelado' | 'no entregado';

export interface PresaleFilters {
  status?: PresaleStatus;
  presellerId?: number;
  distributorId?: number;
  clientId?: number;
  branchId?: number;
  deliveryDate?: string;
  deliveryDateFrom?: string;
  deliveryDateTo?: string;
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


export interface PresaleReportFilters {
  userId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface PresaleReportDetailItem {
  id: number;
  presaleId: number;
  productId: number;
  quantityRequested: number;
  quantityDelivered: number | null;
  priceTypeId: number;
  priceTypeName: string;
  unitPrice: number;
  finalUnitPrice: number | null;
  subtotalRequested: number;
  subtotalDelivered: number | null;
  userId: number;
  state: number;
  createdAt: string;
  updatedAt: string;
  productName: string;
  productBarcode?: string;
}

export interface PresaleReportItem {
  id: number;
  clientId: number;
  businessId: number;
  presellerId: number;
  distributorId: number;
  branchId: number;
  deliveryDate: string;
  deliveredAt: string | null;
  status: PresaleStatus;
  subtotal: number;
  total: number;
  notes: string | null;
  deliveryNotes: string | null;
  userId: number;
  state: number;
  createdAt: string;
  updatedAt: string;
  clientName: string;
  clientLastName: string;
  clientPhone: string;
  businessName: string;
  presellerName: string;
  distributorName: string;
  branchName: string;
  details: PresaleReportDetailItem[];
}

export interface PaginatedPresaleReport {
  data: PresaleReportItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


export interface IPresaleRepository {
  getAll(filters?: PresaleFilters): Promise<PaginatedPresales>;
  getById(id: number, details?: boolean): Promise<Presale>
  assign(presaleId: number, distributorId: number): Promise<Presale | null>;
  create(data: CreatePresaleDTO): Promise<Presale>;
  update(id: number, data: UpdatePresaleDTO): Promise<Presale>;
  cancelPresale(id: number, reason?: string): Promise<Presale>;
  downloadVoucher(id: number): Promise<Blob>;
  getReport(filters?: PresaleReportFilters, page?: number, limit?: number): Promise<PaginatedPresaleReport>;
  downloadReportPdf(filters?: PresaleReportFilters): Promise<Blob>;
  downloadReportExcel(filters?: PresaleReportFilters): Promise<Blob>;
}