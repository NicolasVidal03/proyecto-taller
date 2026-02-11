export interface Position {
  lat: number;
  lng: number;
}

export interface BusinessType {
  id: number;
  name: string;
}

export interface Client {
  id: number;
  name: string;
  lastName: string;
  secondLastName: string;
  phone: string;
  ci: string | null;
  ciExt?: string | null;
  status?: boolean;
  businessName?: string;
  address?: string;
  apartado?: string;
  areaId?: number | null;
  position?: Position | null;
  pathImage?: string | null;
}
