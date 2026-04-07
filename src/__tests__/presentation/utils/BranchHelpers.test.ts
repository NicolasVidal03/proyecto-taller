import { createBranchMap, getBranchName } from '@presentation/utils/branchHelpers';
import type { Branch } from '@domain/entities/Branch';

describe('createBranchMap', () => {
    it('crea un Map id→nombre', () => {
        const branches: Branch[] = [
            { id: 1, name: 'Central' } as Branch,
            { id: 2, name: 'Norte' } as Branch,
        ];
        const map = createBranchMap(branches);
        expect(map.get(1)).toBe('Central');
        expect(map.get(2)).toBe('Norte');
        expect(map.size).toBe(2);
    });
    it('retorna Map vacío para array vacío', () => {
        expect(createBranchMap([]).size).toBe(0);
    });
});

describe('getBranchName', () => {
    const map = new Map([[1, 'Central'], [2, 'Norte']]);

    it('retorna el nombre si el id existe', () => {
        expect(getBranchName(map, 1)).toBe('Central');
    });
    it('retorna "Sin sucursal" para null', () => {
        expect(getBranchName(map, null)).toBe('Sin sucursal');
    });
    it('retorna "Sin sucursal" para undefined', () => {
        expect(getBranchName(map, undefined)).toBe('Sin sucursal');
    });
    it('retorna el id como string si no está en el mapa', () => {
        expect(getBranchName(map, 99)).toBe('99');
    });
});
