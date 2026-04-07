import {
  areaPointsToPoints,
  isPointInPolygon,
  areaPolygonsOverlap,
  isAreaPolygonValid,
  distance,
  closestPointOnPolygonEdge,
  Point,
} from '@domain/utils/geometry';
import type { AreaPoint } from '@domain/entities/Area';


const square: Point[] = [
  { x: 0, y: 0 },
  { x: 4, y: 0 },
  { x: 4, y: 4 },
  { x: 0, y: 4 },
];

const areaSquare: AreaPoint[] = [
  { lat: 0, lng: 0 },
  { lat: 0, lng: 4 },
  { lat: 4, lng: 4 },
  { lat: 4, lng: 0 },
];


describe('areaPointsToPoints', () => {
  it('convierte AreaPoint[] a Point[] mapeando lng→x, lat→y', () => {
    const input: AreaPoint[] = [{ lat: 1, lng: 2 }, { lat: 3, lng: 4 }];
    expect(areaPointsToPoints(input)).toEqual([{ x: 2, y: 1 }, { x: 4, y: 3 }]);
  });

  it('retorna array vacío para entrada vacía', () => {
    expect(areaPointsToPoints([])).toEqual([]);
  });
});


describe('isPointInPolygon', () => {
  it('retorna true para un punto claramente dentro del polígono', () => {
    expect(isPointInPolygon({ x: 2, y: 2 }, square)).toBe(true);
  });

  it('retorna false para un punto claramente fuera del polígono', () => {
    expect(isPointInPolygon({ x: 10, y: 10 }, square)).toBe(false);
  });

  it('retorna false si el polígono tiene menos de 3 puntos', () => {
    expect(isPointInPolygon({ x: 0, y: 0 }, [{ x: 0, y: 0 }, { x: 1, y: 1 }])).toBe(false);
  });

  it('retorna false para polígono vacío', () => {
    expect(isPointInPolygon({ x: 0, y: 0 }, [])).toBe(false);
  });
});


describe('distance', () => {
  it('calcula correctamente con el triángulo 3-4-5', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBeCloseTo(5);
  });

  it('retorna 0 cuando los dos puntos son iguales', () => {
    expect(distance({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0);
  });

  it('funciona con coordenadas negativas', () => {
    expect(distance({ x: -3, y: -4 }, { x: 0, y: 0 })).toBeCloseTo(5);
  });
});


describe('closestPointOnPolygonEdge', () => {
  it('retorna el propio punto si el polígono tiene menos de 2 vértices', () => {
    const p = { x: 5, y: 5 };
    expect(closestPointOnPolygonEdge(p, [{ x: 0, y: 0 }])).toEqual(p);
  });

  it('retorna el punto del borde más cercano para un punto exterior al cuadrado', () => {
    const result = closestPointOnPolygonEdge({ x: 2, y: 6 }, square);
    expect(result.x).toBeCloseTo(2);
    expect(result.y).toBeCloseTo(4);
  });

  it('funciona con un polígono de exactamente 2 puntos (segmento)', () => {
    const seg: Point[] = [{ x: 0, y: 0 }, { x: 10, y: 0 }];
    const result = closestPointOnPolygonEdge({ x: 5, y: 3 }, seg);
    expect(result.x).toBeCloseTo(5);
    expect(result.y).toBeCloseTo(0);
  });
});

describe('isAreaPolygonValid', () => {
  it('valida un cuadrado convexo como válido', () => {
    expect(isAreaPolygonValid(areaSquare)).toBe(true);
  });

  it('valida un triángulo como válido', () => {
    expect(isAreaPolygonValid([
      { lat: 0, lng: 0 },
      { lat: 5, lng: 0 },
      { lat: 2.5, lng: 5 },
    ])).toBe(true);
  });

  it('invalida un polígono con menos de 3 puntos', () => {
    expect(isAreaPolygonValid([{ lat: 0, lng: 0 }, { lat: 1, lng: 1 }])).toBe(false);
  });

  it('invalida un polígono auto-intersectante (forma de X)', () => {
    expect(isAreaPolygonValid([
      { lat: 0, lng: 0 },
      { lat: 4, lng: 4 },
      { lat: 4, lng: 0 },
      { lat: 0, lng: 4 },
    ])).toBe(false);
  });
});

describe('areaPolygonsOverlap', () => {
  const poly1: AreaPoint[] = [
    { lat: 0, lng: 0 }, { lat: 0, lng: 4 },
    { lat: 4, lng: 4 }, { lat: 4, lng: 0 },
  ];

  it('detecta solapamiento entre dos polígonos que se intersectan', () => {
    const poly2: AreaPoint[] = [
      { lat: 2, lng: 2 }, { lat: 2, lng: 6 },
      { lat: 6, lng: 6 }, { lat: 6, lng: 2 },
    ];
    expect(areaPolygonsOverlap(poly1, poly2)).toBe(true);
  });

  it('retorna false cuando los polígonos no se tocan', () => {
    const poly2: AreaPoint[] = [
      { lat: 10, lng: 10 }, { lat: 10, lng: 14 },
      { lat: 14, lng: 14 }, { lat: 14, lng: 10 },
    ];
    expect(areaPolygonsOverlap(poly1, poly2)).toBe(false);
  });

  it('detecta cuando un polígono está completamente dentro de otro', () => {
    const inner: AreaPoint[] = [
      { lat: 1, lng: 1 }, { lat: 1, lng: 3 },
      { lat: 3, lng: 3 }, { lat: 3, lng: 1 },
    ];
    expect(areaPolygonsOverlap(poly1, inner)).toBe(true);
  });

  it('retorna false si cualquiera de los dos polígonos tiene menos de 3 puntos', () => {
    const small: AreaPoint[] = [{ lat: 0, lng: 0 }, { lat: 1, lng: 1 }];
    expect(areaPolygonsOverlap(poly1, small)).toBe(false);
    expect(areaPolygonsOverlap(small, poly1)).toBe(false);
  });
});
