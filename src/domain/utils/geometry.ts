/**
 * Utilidades de Geometría para Polígonos
 * 
 * Funciones para:
 * - Detectar si un punto está dentro de un polígono
 * - Detectar solapamiento entre polígonos
 * - Encontrar el punto más cercano en el borde de un polígono
 * - Validar polígonos
 */

import { AreaPoint } from '../entities/Area';

// ══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ══════════════════════════════════════════════════════════════════════════════

export interface Point {
  x: number;
  y: number;
}

interface Segment {
  p1: Point;
  p2: Point;
}

// ══════════════════════════════════════════════════════════════════════════════
// CONVERSIÓN (helpers internos)
// ══════════════════════════════════════════════════════════════════════════════

/** Convierte AreaPoint a Point interno */
function areaPointToPoint(ap: AreaPoint): Point {
  return { x: ap.lng, y: ap.lat };
}

/** Convierte array de AreaPoint a array de Point */
export function areaPointsToPoints(aps: AreaPoint[]): Point[] {
  return aps.map(areaPointToPoint);
}

// ══════════════════════════════════════════════════════════════════════════════
// PUNTO EN POLÍGONO (Ray Casting Algorithm)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Determina si un punto está dentro de un polígono usando Ray Casting
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

// ══════════════════════════════════════════════════════════════════════════════
// INTERSECCIÓN DE SEGMENTOS (helpers internos)
// ══════════════════════════════════════════════════════════════════════════════

/** Calcula la orientación de tres puntos: 0 = colineal, 1 = horario, 2 = antihorario */
function orientation(p: Point, q: Point, r: Point): number {
  const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  if (Math.abs(val) < 1e-10) return 0;
  return val > 0 ? 1 : 2;
}

/** Verifica si el punto q está en el segmento pr */
function onSegment(p: Point, q: Point, r: Point): boolean {
  return (
    q.x <= Math.max(p.x, r.x) &&
    q.x >= Math.min(p.x, r.x) &&
    q.y <= Math.max(p.y, r.y) &&
    q.y >= Math.min(p.y, r.y)
  );
}

/** Verifica si dos segmentos se intersectan */
function segmentsIntersect(seg1: Segment, seg2: Segment): boolean {
  const { p1: p1, p2: q1 } = seg1;
  const { p1: p2, p2: q2 } = seg2;

  const o1 = orientation(p1, q1, p2);
  const o2 = orientation(p1, q1, q2);
  const o3 = orientation(p2, q2, p1);
  const o4 = orientation(p2, q2, q1);

  if (o1 !== o2 && o3 !== o4) return true;

  // Casos especiales (colineales)
  if (o1 === 0 && onSegment(p1, p2, q1)) return true;
  if (o2 === 0 && onSegment(p1, q2, q1)) return true;
  if (o3 === 0 && onSegment(p2, p1, q2)) return true;
  if (o4 === 0 && onSegment(p2, q1, q2)) return true;

  return false;
}

// ══════════════════════════════════════════════════════════════════════════════
// SOLAPAMIENTO DE POLÍGONOS
// ══════════════════════════════════════════════════════════════════════════════

/** Verifica si dos polígonos se solapan */
function polygonsOverlap(poly1: Point[], poly2: Point[]): boolean {
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

/** Verifica si dos polígonos de AreaPoints se solapan */
export function areaPolygonsOverlap(poly1: AreaPoint[], poly2: AreaPoint[]): boolean {
  return polygonsOverlap(areaPointsToPoints(poly1), areaPointsToPoints(poly2));
}

// ══════════════════════════════════════════════════════════════════════════════
// PUNTO MÁS CERCANO EN BORDE
// ══════════════════════════════════════════════════════════════════════════════

/** Calcula la distancia entre dos puntos */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Encuentra el punto más cercano en un segmento a un punto dado */
function closestPointOnSegment(point: Point, seg: Segment): Point {
  const { p1, p2 } = seg;
  
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len2 = dx * dx + dy * dy;

  if (len2 === 0) return p1;

  let t = ((point.x - p1.x) * dx + (point.y - p1.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));

  return {
    x: p1.x + t * dx,
    y: p1.y + t * dy,
  };
}

/** Encuentra el punto más cercano en el borde de un polígono */
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
// VALIDACIONES
// ══════════════════════════════════════════════════════════════════════════════

/** Verifica si un polígono es válido (no se auto-intersecta) */
function isPolygonValid(polygon: Point[]): boolean {
  if (polygon.length < 3) return false;

  for (let i = 0; i < polygon.length; i++) {
    const seg1: Segment = {
      p1: polygon[i],
      p2: polygon[(i + 1) % polygon.length],
    };

    for (let j = i + 2; j < polygon.length; j++) {
      if (i === 0 && j === polygon.length - 1) continue;

      const seg2: Segment = {
        p1: polygon[j],
        p2: polygon[(j + 1) % polygon.length],
      };

      if (segmentsIntersect(seg1, seg2)) return false;
    }
  }

  return true;
}

/** Verifica si un polígono de AreaPoints es válido */
export function isAreaPolygonValid(polygon: AreaPoint[]): boolean {
  return isPolygonValid(areaPointsToPoints(polygon));
}
