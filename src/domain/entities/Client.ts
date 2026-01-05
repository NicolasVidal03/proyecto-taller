/**
 * Client Entity - Domain Layer (Frontend)
 * Solo tipos e interfaces, sin lógica de negocio
 */
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
