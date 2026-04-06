import { BrandService } from '@application/BrandService';
import { IBrandRepository, CreateBrandDTO, UpdateBrandDTO } from '@domain/ports/IBrandRepository';
import { Brand } from '@domain/entities/Brand';

const mockBrand = (): Brand => ({ id: 1, name: 'Samsung' } as Brand);

const makeBrandRepo = (): jest.Mocked<IBrandRepository> => ({
    getAll: jest.fn(), getById: jest.fn(), create: jest.fn(),
    update: jest.fn(), updateState: jest.fn(),
});

describe('BrandService', () => {
    it('getAll retorna la lista de marcas', async () => {
        const repo = makeBrandRepo();
        repo.getAll.mockResolvedValue([mockBrand()]);
        expect(await new BrandService(repo).getAll()).toHaveLength(1);
    });

    it('create usa el DTO', async () => {
        const repo = makeBrandRepo();
        repo.create.mockResolvedValue(mockBrand());
        const dto: CreateBrandDTO = { name: 'Adidas', userId: 1 };
        await new BrandService(repo).create(dto);
        expect(repo.create).toHaveBeenCalledWith(dto);
    });

    it('updateState usa id y userId', async () => {
        const repo = makeBrandRepo();
        repo.updateState.mockResolvedValue(undefined);
        await new BrandService(repo).updateState(1, 42);
        expect(repo.updateState).toHaveBeenCalledWith(1, 42);
    });
});