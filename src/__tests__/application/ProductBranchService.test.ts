import { ProductBranchService } from '@application/ProductBranchService';
import { IProductBranchRepository, UpdateStockDTO } from '@domain/ports/IProductBranchRepository';
import { PaginatedBranchProducts, BranchProductsFilters } from '@domain/entities/ProductBranch';

const makeProductBranchRepo = (): jest.Mocked<IProductBranchRepository> => ({
    getByBranch: jest.fn(),
    getByBranchPaginated: jest.fn(),
    setStock: jest.fn(),
});

describe('ProductBranchService', () => {
    it('getByBranchPaginated usa branchId y filtros', async () => {
        const repo = makeProductBranchRepo();
        const pagResult = { data: [], total: 0, totalPages: 0 } as unknown as PaginatedBranchProducts;
        repo.getByBranchPaginated.mockResolvedValue(pagResult);
        const filters: BranchProductsFilters = { search: 'x' } as BranchProductsFilters;

        await new ProductBranchService(repo).getByBranchPaginated(1, filters);

        expect(repo.getByBranchPaginated).toHaveBeenCalledWith(1, filters);
    });

    it('setStock busca según productId, branchId y usa DTO', async () => {
        const repo = makeProductBranchRepo();
        const response = { message: 'ok', productId: 1, branchId: 2, hasStock: true, stockQty: 10, deleted: false };
        repo.setStock.mockResolvedValue(response);
        const dto: UpdateStockDTO = { hasStock: true, stockQty: 10 };

        const result = await new ProductBranchService(repo).setStock(1, 2, dto);

        expect(repo.setStock).toHaveBeenCalledWith(1, 2, dto);
        expect(result.stockQty).toBe(10);
    });
});