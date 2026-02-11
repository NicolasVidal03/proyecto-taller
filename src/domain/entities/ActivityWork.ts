import { Position } from './Business';

export interface ActivityInfo {
  id: number | null;
  createdAt: string | null;
  action: string | null;
  rejectionId: number | null;
}

export interface BusinessInfo {
  id: number;
  name: string;
  businessTypeId: number;
  clientId: number;
  priceTypeId: number | null;
  areaId: number | null;
  nit: string | null;
  position: Position | null;
  pathImage: string | null;
  address: string | null;
}

export interface ActivityWork {
  idRoute: number;
  business: BusinessInfo;
  activity: ActivityInfo;
}

export type ActivityAction = 'visited' | 'sold' | 'rejected' | null;
