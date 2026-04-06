import { ColorService } from '@application/ColorService';
import { IColorRepository, CreateColorDTO, UpdateColorDTO } from '@domain/ports/IColorRepository';
import { Color } from '@domain/entities/Color';

const mockColor = (): Color => ({ id: 1, name: 'Rojo' } as Color);

const makeColorRepo = (): jest.Mocked<IColorRepository> => ({
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateState: jest.fn(),
    delete: jest.fn(),
});

describe('ColorService', () => {
    it('getAll retorna la lista de colores', async () => {
        const repo = makeColorRepo();
        repo.getAll.mockResolvedValue([mockColor(), mockColor()]);
        expect(await new ColorService(repo).getAll()).toHaveLength(2);
    });

    it('create manda el DTO', async () => {
        const repo = makeColorRepo();
        repo.create.mockResolvedValue(mockColor());
        const dto: CreateColorDTO = { name: 'Azul', userId: 1 };
        await new ColorService(repo).create(dto);
        expect(repo.create).toHaveBeenCalledWith(dto);
    });

    it('updateState manda id y userId', async () => {
        const repo = makeColorRepo();
        repo.updateState.mockResolvedValue(undefined);
        await new ColorService(repo).updateState(1, 5);
        expect(repo.updateState).toHaveBeenCalledWith(1, 5);
    });

    it('delete manda el id', async () => {
        const repo = makeColorRepo();
        repo.delete.mockResolvedValue(undefined);
        await new ColorService(repo).delete(1);
        expect(repo.delete).toHaveBeenCalledWith(1);
    });
});