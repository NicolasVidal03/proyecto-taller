import { ProductService } from '@application/ProductService';
import { IProductRepository, CreateProductDTO, UpdateProductDTO, ProductFilters, PaginatedProducts } from '@domain/ports/IProductRepository';
import { Product } from '@domain/entities/Product';

const mockProduct = (): Product => ({ id: 1, name: 'Producto Test', prices: [] } as unknown as Product);

const paginated = (data: Product[]): PaginatedProducts =>
    ({ data, total: data.length, page: 1, limit: 10, totalPages: 1 });

const makeProductRepo = (): jest.Mocked<IProductRepository> => ({
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateState: jest.fn(),
    delete: jest.fn(),
});

describe('ProductService', () => {
    it('getAll funciona con los filtros indicados', async () => {
        const repo = makeProductRepo();
        repo.getAll.mockResolvedValue(paginated([mockProduct()]));
        const filters: ProductFilters = { search: 'test' };

        const result = await new ProductService(repo).getAll(filters);

        expect(repo.getAll).toHaveBeenCalledWith(filters);
        expect(result.data).toHaveLength(1);
    });

    it('getAll sin filtros pasa undefined al repositorio', async () => {
        const repo = makeProductRepo();
        repo.getAll.mockResolvedValue(paginated([]));

        await new ProductService(repo).getAll();

        expect(repo.getAll).toHaveBeenCalledWith(undefined);
    });

    it('getById usa el id correcto', async () => {
        const repo = makeProductRepo();
        repo.getById.mockResolvedValue(mockProduct());

        await new ProductService(repo).getById(1);

        expect(repo.getById).toHaveBeenCalledWith(1);
    });

    it('create usa el DTO y retorna el producto creado', async () => {
        const repo = makeProductRepo();
        repo.create.mockResolvedValue(mockProduct());
        const dto: CreateProductDTO = { name: 'Nuevo', categoryId: 1, brandId: 1, userId: 1, prices: [] };

        const result = await new ProductService(repo).create(dto);

        expect(repo.create).toHaveBeenCalledWith(dto);
        expect(result.name).toBe('Producto Test');
    });

    it('update busca por id y usa el DTO', async () => {
        const repo = makeProductRepo();
        repo.update.mockResolvedValue({ ...mockProduct(), name: 'Actualizado' });
        const dto: UpdateProductDTO = { name: 'Actualizado' };

        const result = await new ProductService(repo).update(1, dto);

        expect(repo.update).toHaveBeenCalledWith(1, dto);
        expect(result.name).toBe('Actualizado');
    });

    it('updateState usa id y userId', async () => {
        const repo = makeProductRepo();
        repo.updateState.mockResolvedValue(undefined);

        await new ProductService(repo).updateState(1, 42);

        expect(repo.updateState).toHaveBeenCalledWith(1, 42);
    });

    it('delete busca por id', async () => {
        const repo = makeProductRepo();
        repo.delete.mockResolvedValue(undefined);

        await new ProductService(repo).delete(1);

        expect(repo.delete).toHaveBeenCalledWith(1);
    });
});