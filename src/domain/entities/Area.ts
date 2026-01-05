/**
 * Area Entity - Domain Layer (Frontend)
 * Solo tipos e interfaces, sin lógica de negocio
 */

/** Punto con coordenadas lat/lng */
export interface AreaPoint {
  lat: number;
  lng: number;
}

/** Área como la devuelve/recibe la API */
export interface Area {
  id?: number;
  name: string;
  area?: AreaPoint[];
  state?: boolean;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}

/** Coordenada Leaflet: [lat, lng] */
export type LeafletLatLng = [number, number];

/** Array de coordenadas Leaflet para un polígono */
export type LeafletPolygonCoords = LeafletLatLng[];
