import { formatRole } from '@presentation/utils/format';

describe('formatRole', () => {
    it('retorna "Sin rol" para undefined', () => {
        expect(formatRole(undefined)).toBe('Sin rol');
    });

    it('retorna "Sin rol" para null', () => {
        expect(formatRole(null)).toBe('Sin rol');
    });

    it('retorna "Sin rol" para cadena vacía', () => {
        expect(formatRole('')).toBe('Sin rol');
    });

    it.each([
        ['gerente', 'Gerente'],
        ['administrador', 'Administrador'],
        ['prevendedor', 'Prevendedor'],
        ['transportista', 'Transportista'],
    ])('mapea "%s" → "%s"', (input, expected) => {
        expect(formatRole(input)).toBe(expected);
    });

    it('reemplaza guiones bajos y capitaliza roles desconocidos', () => {
        expect(formatRole('super_admin')).toBe('Super Admin');
    });

    it('capitaliza la primera letra de un rol simple desconocido', () => {
        expect(formatRole('gerente')).toBe('Gerente');
    });
});