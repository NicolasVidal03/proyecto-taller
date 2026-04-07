import { extractErrorMessage, createAppError } from '@presentation/hooks/shared/errorUtils';

describe('extractErrorMessage', () => {
    it('extrae response.data.message (error Axios con message)', () => {
        const err = Object.assign(new Error('http'), { response: { data: { message: 'Error servidor' } } });
        expect(extractErrorMessage(err)).toBe('Error servidor');
    });

    it('extrae response.data.error si no hay message', () => {
        const err = Object.assign(new Error('http'), { response: { data: { error: 'Not found' } } });
        expect(extractErrorMessage(err)).toBe('Not found');
    });

    it('retorna err.message si no hay response.data', () => {
        expect(extractErrorMessage(new Error('Network Error'))).toBe('Network Error');
    });

    it('retorna el string directamente si el error es string', () => {
        expect(extractErrorMessage('algo salió mal')).toBe('algo salió mal');
    });

    it.each([{}, null, 42, undefined])(
        'retorna "Error desconocido" para tipo no reconocido (%p)',
        (input) => {
            expect(extractErrorMessage(input)).toBe('Error desconocido');
        }
    );
});

describe('createAppError', () => {
    it('crea AppError con mensaje y código', () => {
        const error = createAppError(new Error('falla'), 'ERR_001');
        expect(error).toEqual({ message: 'falla', code: 'ERR_001' });
    });

    it('crea AppError sin código cuando no se provee', () => {
        const error = createAppError(new Error('falla'));
        expect(error.code).toBeUndefined();
        expect(error.message).toBe('falla');
    });
});