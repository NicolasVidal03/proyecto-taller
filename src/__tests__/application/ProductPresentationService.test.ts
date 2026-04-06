import { PresentationService } from '@application/PresentationService';
import { IPresentationRepository, CreatePresentationDTO } from '@domain/ports/IPresentationRepository';
import { Presentation } from '@domain/entities/Presentation';

const mockPresentation = (): Presentation => ({ id: 1, name: 'Caja' } as Presentation);

const makePresentationRepo = (): jest.Mocked<IPresentationRepository> => ({
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateState: jest.fn(),
    delete: jest.fn(),
});

describe('PresentationService', () => {
    it('getAll retorna lista de presentaciones', async () => {
        const repo = makePresentationRepo();
        repo.getAll.mockResolvedValue([mockPresentation()]);
        expect(await new PresentationService(repo).getAll()).toHaveLength(1);
    });

    it('create usa el DTO', async () => {
        const repo = makePresentationRepo();
        repo.create.mockResolvedValue(mockPresentation());
        const dto: CreatePresentationDTO = { name: 'Bolsa', userId: 1 };
        await new PresentationService(repo).create(dto);
        expect(repo.create).toHaveBeenCalledWith(dto);
    });

    it('updateState usa id y userId', async () => {
        const repo = makePresentationRepo();
        repo.updateState.mockResolvedValue(undefined);
        await new PresentationService(repo).updateState(1, 5);
        expect(repo.updateState).toHaveBeenCalledWith(1, 5);
    });

    it('delete busca según el id', async () => {
        const repo = makePresentationRepo();
        repo.delete.mockResolvedValue(undefined);
        await new PresentationService(repo).delete(1);
        expect(repo.delete).toHaveBeenCalledWith(1);
    });
});