
export interface Position {
  lat: number;
  lng: number;
}


export interface Business {
  id: number;
  name: string;
  nit: string | null;
  position: Position | null;
  pathImage: string | null;
  address: string | null;
  businessTypeId: number;
  clientId: number;
  priceTypeId: number | null;
  areaId: number | null;
  isActive: boolean;

  
  clientName?: string;
  businessTypeName?: string;
  areaName?: string;
}