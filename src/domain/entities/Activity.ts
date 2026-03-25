import { Position } from './Business';

export interface ActivityBussines {
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

export interface ActivityDetails {
  id: number | null;
  action: string;
  rejectionId: number | null;
  bussinesId: number | null;
  createdAt: string;
}

export interface ActivityBusinesses {
  business: ActivityBussines;
  activityDetail: ActivityDetails | null;
}

export interface Activity {
  id: number;
  responsibleUserId: number,
  assignedDate: string,
  businesses: ActivityBusinesses[] | null; 
}

// export type ActivityAction = 'visited' | 'sold' | 'rejected' | null;
