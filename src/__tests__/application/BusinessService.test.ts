import { BusinessService } from '@application/BusinessService';
import { IBusinessRepository, CreateBusinessDTO } from '@domain/ports/IBusinessRepository';
import { Business } from '@domain/entities/Business';

const mockBusiness = (): Business => ({ id: 1, name: 'Tienda Central' } as Business);
const mockBusiness2 = (): Business => ({ id: 2, name: 'Tienda Norte' } as Business);

const makeBusinessRepo = (): jest.Mocked<IBusinessRepository> => ({
    getAll: jest.fn(),
    getByClientId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
});

describe('BusinessService', () => {
    it('listAll retorna todos los negocios', async () => {
        const repo = makeBusinessRepo();
        repo.getAll.mockResolvedValue([mockBusiness(), mockBusiness2()]);
        expect(await new BusinessService(repo).listAll()).toHaveLength(2);
    });

    it('getByClient busca según el clientId', async () => {
        const repo = makeBusinessRepo();
        repo.getByClientId.mockResolvedValue([mockBusiness()]);
        await new BusinessService(repo).getByClient(5);
        expect(repo.getByClientId).toHaveBeenCalledWith(5);
    });

        it('create funciona, usa el DTO y gaurda con userId', async () => {
        const repo = makeBusinessRepo();
        repo.create.mockResolvedValue(mockBusiness());
        const dto: CreateBusinessDTO = { name: 'Nueva', businessTypeId: 1, clientId: 2 };
        await new BusinessService(repo).create(dto, 99);
        expect(repo.create).toHaveBeenCalledWith(dto, 99);
    });

    it('create funciona sin userId (undefined)', async () => {
        const repo = makeBusinessRepo();
        repo.create.mockResolvedValue(mockBusiness());
        const dto: CreateBusinessDTO = { name: 'Nueva', businessTypeId: 1, clientId: 2 };
        await new BusinessService(repo).create(dto);
        expect(repo.create).toHaveBeenCalledWith(dto, undefined);
    });

    it('update busca por id y edita correctamente', async () => {
        const repo = makeBusinessRepo();
        repo.update.mockResolvedValue(mockBusiness());
        await new BusinessService(repo).update(1, { name: 'Editado' }, 5);
        expect(repo.update).toHaveBeenCalledWith(1, { name: 'Editado' }, 5);
    });

    it('softDelete retorna el booleano del repositorio', async () => {
        const repo = makeBusinessRepo();
        repo.softDelete.mockResolvedValue(true);
        const result = await new BusinessService(repo).softDelete(1, 99);
        expect(repo.softDelete).toHaveBeenCalledWith(1, 99);
        expect(result).toBe(true);
    });
});