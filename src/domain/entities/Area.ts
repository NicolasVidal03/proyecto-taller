export interface AreaPoint {
  lat: number;
  lng: number;
}


export interface Area {
  id?: number;
  name: string;
  area?: AreaPoint[];
  state?: boolean;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}


export type LeafletLatLng = [number, number];


export type LeafletPolygonCoords = LeafletLatLng[];
