import {
    leafletToApi,
    apiToLeaflet,
    isValidPolygon,
    isValidAreaPoints,
    isValidCoordinate,
    getPolygonCenter,
    getAreaColor,
    createAreaMap,
    getAreaName,
} from '@presentation/utils/areaHelpers';
import type { AreaPoint, LeafletPolygonCoords } from '@domain/entities/Area';
import type { Area } from '@domain/entities/Area';

describe('leafletToApi', () => {
    it('convierte [lat, lng] a { lat, lng }', () => {
        expect(leafletToApi([[1, 2], [3, 4]])).toEqual([{ lat: 1, lng: 2 }, { lat: 3, lng: 4 }]);
    });
    it('retorna array vacío para entrada vacía', () => {
        expect(leafletToApi([])).toEqual([]);
    });
});

describe('apiToLeaflet', () => {
    it('convierte { lat, lng } a [lat, lng]', () => {
        expect(apiToLeaflet([{ lat: 1, lng: 2 }, { lat: 3, lng: 4 }])).toEqual([[1, 2], [3, 4]]);
    });
    it('retorna array vacío para entrada vacía', () => {
        expect(apiToLeaflet([])).toEqual([]);
    });
});

describe('isValidPolygon', () => {
    it('retorna true para 3 o más puntos', () => {
        expect(isValidPolygon([[0, 0], [1, 1], [2, 0]])).toBe(true);
    });
    it.each([
        [[]],
        [[[0, 0]] as LeafletPolygonCoords],
        [[[0, 0], [1, 1]] as LeafletPolygonCoords],
    ])('retorna false para menos de 3 puntos (%#)', (input) => {
        expect(isValidPolygon(input as LeafletPolygonCoords)).toBe(false);
    });
});

describe('isValidAreaPoints', () => {
    it('retorna true para 3 o más puntos', () => {
        const pts: AreaPoint[] = [{ lat: 0, lng: 0 }, { lat: 1, lng: 1 }, { lat: 2, lng: 0 }];
        expect(isValidAreaPoints(pts)).toBe(true);
    });
    it('retorna false para menos de 3 puntos', () => {
        expect(isValidAreaPoints([{ lat: 0, lng: 0 }])).toBe(false);
    });
});

describe('isValidCoordinate', () => {
    it('acepta coordenadas en rango', () => {
        expect(isValidCoordinate(0, 0)).toBe(true);
        expect(isValidCoordinate(-90, -180)).toBe(true);
        expect(isValidCoordinate(90, 180)).toBe(true);
    });
    it('rechaza latitud fuera de rango', () => {
        expect(isValidCoordinate(91, 0)).toBe(false);
        expect(isValidCoordinate(-91, 0)).toBe(false);
    });
    it('rechaza longitud fuera de rango', () => {
        expect(isValidCoordinate(0, 181)).toBe(false);
        expect(isValidCoordinate(0, -181)).toBe(false);
    });
});

describe('getPolygonCenter', () => {
    it('calcula el centro promedio de un cuadrado', () => {
        const [lat, lng] = getPolygonCenter([[0, 0], [0, 4], [4, 4], [4, 0]]);
        expect(lat).toBeCloseTo(2);
        expect(lng).toBeCloseTo(2);
    });
    it('retorna [0, 0] para array vacío', () => {
        expect(getPolygonCenter([])).toEqual([0, 0]);
    });
});

describe('getAreaColor', () => {
    it('retorna un hex válido', () => {
        expect(getAreaColor(0)).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
    it('rota al superar el tamaño de la paleta (20 colores)', () => {
        expect(getAreaColor(0)).toBe(getAreaColor(20));
    });
    it('colores distintos para IDs consecutivos', () => {
        expect(getAreaColor(0)).not.toBe(getAreaColor(1));
    });
});

describe('createAreaMap', () => {
    it('crea mapa id→nombre', () => {
        const areas: Area[] = [{ id: 1, name: 'Norte' }, { id: 2, name: 'Sur' }];
        expect(createAreaMap(areas)).toEqual({ 1: 'Norte', 2: 'Sur' });
    });
    it('ignora áreas sin id', () => {
        expect(createAreaMap([{ name: 'Sin ID' }, { id: 3, name: 'Con ID' }])).toEqual({ 3: 'Con ID' });
    });
    it('retorna objeto vacío para array vacío', () => {
        expect(createAreaMap([])).toEqual({});
    });
});

describe('getAreaName', () => {
    const map = { 1: 'Norte', 2: 'Sur' };
    it('retorna el nombre si el id existe', () => {
        expect(getAreaName(map, 1)).toBe('Norte');
    });
    it('retorna "Sin área" para null', () => {
        expect(getAreaName(map, null)).toBe('Sin área');
    });
    it('retorna "Sin área" para undefined', () => {
        expect(getAreaName(map, undefined)).toBe('Sin área');
    });
    it('retorna fallback "Área #N" si el id no está en el mapa', () => {
        expect(getAreaName(map, 99)).toBe('Área #99');
    });
});