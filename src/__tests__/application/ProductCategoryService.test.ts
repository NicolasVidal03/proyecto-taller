import { CategoryService } from '@application/CategoryService';
import { ICategoryRepository, CreateCategoryDTO, UpdateCategoryDTO } from '@domain/ports/ICategoryRepository';
import { Category } from '@domain/entities/Category';

const mockCategory = (): Category => ({ id: 1, name: 'Cables' } as Category);

const makeCategoryRepo = (): jest.Mocked<ICategoryRepository> => ({
    getAll: jest.fn(), getById: jest.fn(), create: jest.fn(),
    update: jest.fn(), updateState: jest.fn(), delete: jest.fn(),
});

describe('CategoryService', () => {
    it('getAll retorna la lista de categorías', async () => {
        const repo = makeCategoryRepo();
        repo.getAll.mockResolvedValue([mockCategory()]);
        expect(await new CategoryService(repo).getAll()).toHaveLength(1);
    });

    it('create usa el DTO', async () => {
        const repo = makeCategoryRepo();
        repo.create.mockResolvedValue(mockCategory());
        const dto: CreateCategoryDTO = { name: 'Bebidas', userId: 1 };
        await new CategoryService(repo).create(dto);
        expect(repo.create).toHaveBeenCalledWith(dto);
    });

    it('update manda id y DTO', async () => {
        const repo = makeCategoryRepo();
        repo.update.mockResolvedValue(mockCategory());
        const dto: UpdateCategoryDTO = { name: 'Lácteos' };
        await new CategoryService(repo).update(1, dto);
        expect(repo.update).toHaveBeenCalledWith(1, dto);
    });

    it('updateState usa id y userId', async () => {
        const repo = makeCategoryRepo();
        repo.updateState.mockResolvedValue(undefined);
        await new CategoryService(repo).updateState(1, 42);
        expect(repo.updateState).toHaveBeenCalledWith(1, 42);
    });

    it('delete manda el id', async () => {
        const repo = makeCategoryRepo();
        repo.delete.mockResolvedValue(undefined);
        await new CategoryService(repo).delete(1);
        expect(repo.delete).toHaveBeenCalledWith(1);
    });
});