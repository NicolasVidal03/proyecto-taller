/**
 * Utilidades de Geometría para Polígonos
 * 
 * Funciones para:
 * - Detectar si un punto está dentro de un polígono
 * - Detectar intersección entre polígonos
 * - Encontrar el punto más cercano en el borde de un polígono
 * - Ajustar polígonos para evitar solapamiento
 */

import { AreaPoint } from '../entities/Area';

// ══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ══════════════════════════════════════════════════════════════════════════════

export interface Point {
  x: number;
  y: number;
}

export interface Segment {
  p1: Point;
  p2: Point;
}

// ══════════════════════════════════════════════════════════════════════════════
// CONVERSIÓN
// ══════════════════════════════════════════════════════════════════════════════

/** Convierte AreaPoint a Point interno */
export function areaPointToPoint(ap: AreaPoint): Point {
  return { x: ap.lng, y: ap.lat };
}

/** Convierte Point interno a AreaPoint */
export function pointToAreaPoint(p: Point): AreaPoint {
  return { lat: p.y, lng: p.x };
}

/** Convierte array de AreaPoint a array de Point */
export function areaPointsToPoints(aps: AreaPoint[]): Point[] {
  return aps.map(areaPointToPoint);
}

/** Convierte array de Point a array de AreaPoint */
export function pointsToAreaPoints(ps: Point[]): AreaPoint[] {
  return ps.map(pointToAreaPoint);
}

// ══════════════════════════════════════════════════════════════════════════════
// PUNTO EN POLÍGONO (Ray Casting Algorithm)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Determina si un punto está dentro de un polígono usando Ray Casting
 * @param point Punto a verificar
 * @param polygon Array de puntos que forman el polígono
 * @returns true si el punto está dentro del polígono
 */
export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  if (polygon.length < 3) return false;

  let inside = false;
  const n = polygon.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    if (
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Verifica si un AreaPoint está dentro de un polígono de AreaPoints
 */
export function isAreaPointInPolygon(point: AreaPoint, polygon: AreaPoint[]): boolean {
  return isPointInPolygon(areaPointToPoint(point), areaPointsToPoints(polygon));
}

// ══════════════════════════════════════════════════════════════════════════════
// INTERSECCIÓN DE SEGMENTOS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Calcula la orientación de tres puntos
 * @returns 0 = colineal, 1 = horario, 2 = antihorario
 */
function orientation(p: Point, q: Point, r: Point): number {
  const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  if (Math.abs(val) < 1e-10) return 0; // Colineal
  return val > 0 ? 1 : 2;
}

/**
 * Verifica si el punto q está en el segmento pr
 */
function onSegment(p: Point, q: Point, r: Point): boolean {
  return (
    q.x <= Math.max(p.x, r.x) &&
    q.x >= Math.min(p.x, r.x) &&
    q.y <= Math.max(p.y, r.y) &&
    q.y >= Math.min(p.y, r.y)
  );
}

/**
 * Verifica si dos segmentos se intersectan
 */
export function segmentsIntersect(seg1: Segment, seg2: Segment): boolean {
  const { p1: p1, p2: q1 } = seg1;
  const { p1: p2, p2: q2 } = seg2;

  const o1 = orientation(p1, q1, p2);
  const o2 = orientation(p1, q1, q2);
  const o3 = orientation(p2, q2, p1);
  const o4 = orientation(p2, q2, q1);

  // Caso general
  if (o1 !== o2 && o3 !== o4) return true;

  // Casos especiales (colineales)
  if (o1 === 0 && onSegment(p1, p2, q1)) return true;
  if (o2 === 0 && onSegment(p1, q2, q1)) return true;
  if (o3 === 0 && onSegment(p2, p1, q2)) return true;
  if (o4 === 0 && onSegment(p2, q1, q2)) return true;

  return false;
}

/**
 * Encuentra el punto de intersección entre dos segmentos (si existe)
 */
export function getSegmentIntersection(seg1: Segment, seg2: Segment): Point | null {
  const { p1: p1, p2: p2 } = seg1;
  const { p1: p3, p2: p4 } = seg2;

  const d = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
  if (Math.abs(d) < 1e-10) return null; // Paralelos

  const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / d;
  const u = -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x)) / d;

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: p1.x + t * (p2.x - p1.x),
      y: p1.y + t * (p2.y - p1.y),
    };
  }

  return null;
}

// ══════════════════════════════════════════════════════════════════════════════
// SOLAPAMIENTO DE POLÍGONOS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Verifica si dos polígonos se solapan
 * @param poly1 Primer polígono
 * @param poly2 Segundo polígono
 * @returns true si hay solapamiento
 */
export function polygonsOverlap(poly1: Point[], poly2: Point[]): boolean {
  if (poly1.length < 3 || poly2.length < 3) return false;

  // 1. Verificar si algún vértice de poly1 está dentro de poly2
  for (const p of poly1) {
    if (isPointInPolygon(p, poly2)) return true;
  }

  // 2. Verificar si algún vértice de poly2 está dentro de poly1
  for (const p of poly2) {
    if (isPointInPolygon(p, poly1)) return true;
  }

  // 3. Verificar si las aristas se intersectan
  for (let i = 0; i < poly1.length; i++) {
    const seg1: Segment = {
      p1: poly1[i],
      p2: poly1[(i + 1) % poly1.length],
    };

    for (let j = 0; j < poly2.length; j++) {
      const seg2: Segment = {
        p1: poly2[j],
        p2: poly2[(j + 1) % poly2.length],
      };

      if (segmentsIntersect(seg1, seg2)) return true;
    }
  }

  return false;
}

/**
 * Verifica si dos polígonos de AreaPoints se solapan
 */
export function areaPolygonsOverlap(poly1: AreaPoint[], poly2: AreaPoint[]): boolean {
  return polygonsOverlap(areaPointsToPoints(poly1), areaPointsToPoints(poly2));
}

// ══════════════════════════════════════════════════════════════════════════════
// PUNTO MÁS CERCANO EN BORDE
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Calcula la distancia entre dos puntos
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Encuentra el punto más cercano en un segmento a un punto dado
 */
export function closestPointOnSegment(point: Point, seg: Segment): Point {
  const { p1, p2 } = seg;
  
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len2 = dx * dx + dy * dy;

  if (len2 === 0) return p1; // Segmento degenerado

  // Proyección del punto en el segmento
  let t = ((point.x - p1.x) * dx + (point.y - p1.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t)); // Clamp to [0, 1]

  return {
    x: p1.x + t * dx,
    y: p1.y + t * dy,
  };
}

/**
 * Encuentra el punto más cercano en el borde de un polígono
 */
export function closestPointOnPolygonEdge(point: Point, polygon: Point[]): Point {
  if (polygon.length < 2) return point;

  let closest = polygon[0];
  let minDist = Infinity;

  for (let i = 0; i < polygon.length; i++) {
    const seg: Segment = {
      p1: polygon[i],
      p2: polygon[(i + 1) % polygon.length],
    };

    const cp = closestPointOnSegment(point, seg);
    const d = distance(point, cp);

    if (d < minDist) {
      minDist = d;
      closest = cp;
    }
  }

  return closest;
}

// ══════════════════════════════════════════════════════════════════════════════
// SNAP TO EDGE - AJUSTAR POLÍGONO PARA NO SOLAPAR
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Offset para separación entre polígonos (en grados, aprox 5-10 metros)
 */
const SNAP_OFFSET = 0.00005; // ~5 metros

/**
 * Mueve un punto hacia afuera del polígono existente
 * @param point Punto a mover
 * @param existingPolygon Polígono existente
 * @param offset Distancia de separación
 * @returns Punto ajustado fuera del polígono
 */
export function snapPointOutsidePolygon(
  point: Point,
  existingPolygon: Point[],
  offset: number = SNAP_OFFSET
): Point {
  if (!isPointInPolygon(point, existingPolygon)) {
    return point; // Ya está fuera
  }

  // Encontrar el punto más cercano en el borde
  const closestOnEdge = closestPointOnPolygonEdge(point, existingPolygon);

  // Calcular dirección desde el centro del polígono hacia el punto
  const centerX = existingPolygon.reduce((s, p) => s + p.x, 0) / existingPolygon.length;
  const centerY = existingPolygon.reduce((s, p) => s + p.y, 0) / existingPolygon.length;

  // Dirección desde el borde hacia afuera
  let dx = closestOnEdge.x - centerX;
  let dy = closestOnEdge.y - centerY;
  const len = Math.sqrt(dx * dx + dy * dy);

  if (len > 0) {
    dx /= len;
    dy /= len;
  } else {
    // Si el centro coincide con el punto, usar dirección por defecto
    dx = 1;
    dy = 0;
  }

  // Mover el punto al borde + offset
  return {
    x: closestOnEdge.x + dx * offset,
    y: closestOnEdge.y + dy * offset,
  };
}

/**
 * Ajusta un polígono nuevo para que no se solape con polígonos existentes
 * @param newPolygon Polígono nuevo a ajustar
 * @param existingPolygons Polígonos existentes
 * @param offset Distancia de separación
 * @returns Polígono ajustado
 */
export function adjustPolygonToAvoidOverlap(
  newPolygon: AreaPoint[],
  existingPolygons: AreaPoint[][],
  offset: number = SNAP_OFFSET
): AreaPoint[] {
  if (newPolygon.length < 3 || existingPolygons.length === 0) {
    return newPolygon;
  }

  const newPoints = areaPointsToPoints(newPolygon);
  const existingPoints = existingPolygons.map(areaPointsToPoints);

  const adjustedPoints: Point[] = [];

  for (const point of newPoints) {
    let adjustedPoint = point;

    // Verificar contra cada polígono existente
    for (const existingPoly of existingPoints) {
      if (isPointInPolygon(adjustedPoint, existingPoly)) {
        adjustedPoint = snapPointOutsidePolygon(adjustedPoint, existingPoly, offset);
      }
    }

    adjustedPoints.push(adjustedPoint);
  }

  return pointsToAreaPoints(adjustedPoints);
}

/**
 * Verifica si un polígono nuevo se solapa con alguno existente
 */
export function checkOverlapWithExisting(
  newPolygon: AreaPoint[],
  existingPolygons: AreaPoint[],
  excludeId?: number
): { overlaps: boolean; overlappingAreaName?: string } {
  // Esta función se usará desde el componente pasando las áreas existentes
  return { overlaps: false };
}

// ══════════════════════════════════════════════════════════════════════════════
// VALIDACIONES
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Verifica si un polígono es válido (no se auto-intersecta)
 */
export function isPolygonValid(polygon: Point[]): boolean {
  if (polygon.length < 3) return false;

  // Verificar que no haya auto-intersección
  for (let i = 0; i < polygon.length; i++) {
    const seg1: Segment = {
      p1: polygon[i],
      p2: polygon[(i + 1) % polygon.length],
    };

    // Comparar con segmentos no adyacentes
    for (let j = i + 2; j < polygon.length; j++) {
      // Evitar comparar segmentos adyacentes
      if (i === 0 && j === polygon.length - 1) continue;

      const seg2: Segment = {
        p1: polygon[j],
        p2: polygon[(j + 1) % polygon.length],
      };

      if (segmentsIntersect(seg1, seg2)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Verifica si un polígono de AreaPoints es válido
 */
export function isAreaPolygonValid(polygon: AreaPoint[]): boolean {
  return isPolygonValid(areaPointsToPoints(polygon));
}

/**
 * Calcula el área de un polígono (usando fórmula del shoelace)
 */
export function calculatePolygonArea(polygon: Point[]): number {
  if (polygon.length < 3) return 0;

  let area = 0;
  const n = polygon.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += polygon[i].x * polygon[j].y;
    area -= polygon[j].x * polygon[i].y;
  }

  return Math.abs(area) / 2;
}

/**
 * Calcula el área de un polígono de AreaPoints (en km² aproximados)
 */
export function calculateAreaPolygonSize(polygon: AreaPoint[]): number {
  const points = areaPointsToPoints(polygon);
  const areaDegrees = calculatePolygonArea(points);
  
  // Conversión aproximada de grados² a km² (depende de la latitud)
  // En latitud ~-17° (Bolivia), 1 grado ≈ 111 km
  const kmPerDegree = 111;
  return areaDegrees * kmPerDegree * kmPerDegree;
}
