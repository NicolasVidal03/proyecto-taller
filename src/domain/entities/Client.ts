export interface Position {
  lat: number;
  lng: number;
}

export type ClientType = 'Mayorista' | 'Minorista' | 'Regular' | 'Otro';
export type BusinessType = 'Ferreteria' | 'Tienda' | 'Institucion' | 'Otro';

export interface Client {
  id: number;
  fullName: string;
  position: Position;
  nitCi: string;
  businessName: string;
  phone: string;
  businessType: BusinessType;
  clientType: ClientType;
  areaId: number | null;
  address?: string;
  status: boolean;
  pathImage?: string;
}

export const CLIENT_TYPES: Array<{ value: ClientType; label: string }> = [
  { value: 'Mayorista', label: 'Mayorista' },
  { value: 'Minorista', label: 'Minorista' },
  { value: 'Regular', label: 'Regular' },
  { value: 'Otro', label: 'Otro' },
];

export const BUSINESS_TYPES: Array<{ value: BusinessType; label: string }> = [
  { value: 'Ferreteria', label: 'Ferretería' },
  { value: 'Tienda', label: 'Tienda' },
  { value: 'Institucion', label: 'Institución' },
  { value: 'Otro', label: 'Otro' },
];
