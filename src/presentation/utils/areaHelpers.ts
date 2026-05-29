import type { Area, AreaPoint, LeafletPolygonCoords, LeafletLatLng } from '../../domain/entities/Area';


export function leafletToApi(leafletCoords: LeafletPolygonCoords): AreaPoint[] {
  return leafletCoords.map(([lat, lng]) => ({ lat, lng }));
}

export function apiToLeaflet(apiPoints: AreaPoint[]): LeafletPolygonCoords {
  return apiPoints.map((p) => [p.lat, p.lng]);
}

export function isValidPolygon(coords: LeafletPolygonCoords): boolean {
  return coords.length >= 3;
}

export function isValidAreaPoints(points: AreaPoint[]): boolean {
  return points.length >= 3;
}

export function isValidCoordinate(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function getPolygonCenter(coords: LeafletPolygonCoords): LeafletLatLng {
  if (coords.length === 0) return [0, 0];

  const sumLat = coords.reduce((sum, [lat]) => sum + lat, 0);
  const sumLng = coords.reduce((sum, [, lng]) => sum + lng, 0);

  return [sumLat / coords.length, sumLng / coords.length];
}

export function getAreaColor(areaId: number): string {
  const colors = [
    '#4285F4', // Google Blue
    '#34A853', // Google Green
    '#FBBC04', // Google Yellow
    '#EA4335', // Google Red
    '#9C27B0', // Purple
    '#FF6D00', // Deep Orange
    '#00BCD4', // Cyan
    '#E91E63', // Pink
    '#795548', // Brown
    '#607D8B', // Blue Grey
    '#8BC34A', // Light Green
    '#FF5722', // Orange
    '#673AB7', // Deep Purple
    '#009688', // Teal
    '#FFC107', // Amber
    '#3F51B5', // Indigo
    '#CDDC39', // Lime
    '#00796B', // Dark Teal
    '#C2185B', // Dark Pink
    '#1976D2', // Dark Blue
  ];
  return colors[areaId % colors.length];
}

export type AreaMap = Record<number, string>;

export function createAreaMap(areas: Area[]): AreaMap {
  return areas.reduce((acc, area) => {
    if (area.id) acc[area.id] = area.name;
    return acc;
  }, {} as AreaMap);
}

export function getAreaName(areaMap: AreaMap, areaId: number | null | undefined): string {
  if (areaId == null) return 'Sin área';
  return areaMap[areaId] || `Área #${areaId}`;
}
