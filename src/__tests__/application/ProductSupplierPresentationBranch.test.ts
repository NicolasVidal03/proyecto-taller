import { ProductService } from '@/application/ProductService';
import { IProductRepository, CreateProductDTO, UpdateProductDTO, ProductFilters, PaginatedProducts } from '@/domain/ports/IProductRepository';
import { Product } from '@/domain/entities/Product';

import { SupplierService } from '@/application/SupplierService';
import { ISupplierRepository, CreateSupplierDTO, UpdateSupplierDTO } from '@/domain/ports/ISupplierRepository';
import { Supplier } from '@/domain/entities/Supplier';

import { PresentationService } from '@/application/PresentationService';
import { IPresentationRepository, CreatePresentationDTO, UpdatePresentationDTO } from '@/domain/ports/IPresentationRepository';
import { Presentation } from '@/domain/entities/Presentation';

import { ProductBranchService } from '@/application/ProductBranchService';
import { IProductBranchRepository, UpdateStockDTO } from '@/domain/ports/IProductBranchRepository';
import { PaginatedBranchProducts, BranchProductsFilters } from '@/domain/entities/ProductBranch';

import { ProductSupplierService } from '@/application/ProductSupplierService';
import { IProductSupplierRepository, CreateProductSupplierDTO, UpdateProductSupplierDTO } from '@/domain/ports/IProductSupplierRepository';
import { ProductSupplier } from '@/domain/entities/ProductSupplier';

// ─────────────────────────────────────────────────────────────
// ProductService
// ─────────────────────────────────────────────────────────────
const mockProduct = (): Product => ({ id: 1, name: 'Producto Test', prices: [] } as unknown as Product);

const paginated = (data: Product[]): PaginatedProducts =>
  ({ data, total: data.length, page: 1, limit: 10, totalPages: 1 });

const makeProductRepo = (): jest.Mocked<IProductRepository> => ({
  getAll: jest.fn(), getById: jest.fn(), create: jest.fn(),
  update: jest.fn(), updateState: jest.fn(), delete: jest.fn(),
});

describe('ProductService', () => {
  it('getAll delega al repositorio con los filtros indicados', async () => {
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

  it('getById delega el id correcto', async () => {
    const repo = makeProductRepo();
    repo.getById.mockResolvedValue(mockProduct());

    await new ProductService(repo).getById(1);

    expect(repo.getById).toHaveBeenCalledWith(1);
  });

  it('create delega el DTO y retorna el producto creado', async () => {
    const repo = makeProductRepo();
    repo.create.mockResolvedValue(mockProduct());
    const dto: CreateProductDTO = { name: 'Nuevo', categoryId: 1, brandId: 1, userId: 1, prices: [] };

    const result = await new ProductService(repo).create(dto);

    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(result.name).toBe('Producto Test');
  });

  it('update delega id y DTO', async () => {
    const repo = makeProductRepo();
    repo.update.mockResolvedValue({ ...mockProduct(), name: 'Actualizado' });
    const dto: UpdateProductDTO = { name: 'Actualizado' };

    const result = await new ProductService(repo).update(1, dto);

    expect(repo.update).toHaveBeenCalledWith(1, dto);
    expect(result.name).toBe('Actualizado');
  });

  it('updateState delega id y userId', async () => {
    const repo = makeProductRepo();
    repo.updateState.mockResolvedValue(undefined);

    await new ProductService(repo).updateState(1, 42);

    expect(repo.updateState).toHaveBeenCalledWith(1, 42);
  });

  it('delete delega el id', async () => {
    const repo = makeProductRepo();
    repo.delete.mockResolvedValue(undefined);

    await new ProductService(repo).delete(1);

    expect(repo.delete).toHaveBeenCalledWith(1);
  });
});

// ─────────────────────────────────────────────────────────────
// SupplierService
// ─────────────────────────────────────────────────────────────
const mockSupplier = (): Supplier => ({ id: 1, name: 'Proveedor SA', nit: '123' } as Supplier);

const makeSupplierRepo = (): jest.Mocked<ISupplierRepository> => ({
  getAll: jest.fn(), getById: jest.fn(), create: jest.fn(),
  update: jest.fn(), updateState: jest.fn(), delete: jest.fn(),
});

describe('SupplierService', () => {
  it('getAll retorna lista de proveedores', async () => {
    const repo = makeSupplierRepo();
    repo.getAll.mockResolvedValue([mockSupplier()]);
    expect(await new SupplierService(repo).getAll()).toHaveLength(1);
  });

  it('create delega el DTO', async () => {
    const repo = makeSupplierRepo();
    repo.create.mockResolvedValue(mockSupplier());
    const dto: CreateSupplierDTO = { nit: '123', name: 'Test', countryId: 1 };
    await new SupplierService(repo).create(dto);
    expect(repo.create).toHaveBeenCalledWith(dto);
  });

  it('updateState delega id, state y userId opcional', async () => {
    const repo = makeSupplierRepo();
    repo.updateState.mockResolvedValue(undefined);
    await new SupplierService(repo).updateState(1, false, 99);
    expect(repo.updateState).toHaveBeenCalledWith(1, false, 99);
  });

  it('delete delega id y userId opcional', async () => {
    const repo = makeSupplierRepo();
    repo.delete.mockResolvedValue(undefined);
    await new SupplierService(repo).delete(1, 99);
    expect(repo.delete).toHaveBeenCalledWith(1, 99);
  });
});

// ─────────────────────────────────────────────────────────────
// PresentationService
// ─────────────────────────────────────────────────────────────
const mockPresentation = (): Presentation => ({ id: 1, name: 'Botella 500ml' } as Presentation);

const makePresentationRepo = (): jest.Mocked<IPresentationRepository> => ({
  getAll: jest.fn(), getById: jest.fn(), create: jest.fn(),
  update: jest.fn(), updateState: jest.fn(), delete: jest.fn(),
});

describe('PresentationService', () => {
  it('getAll retorna lista de presentaciones', async () => {
    const repo = makePresentationRepo();
    repo.getAll.mockResolvedValue([mockPresentation()]);
    expect(await new PresentationService(repo).getAll()).toHaveLength(1);
  });

  it('create delega el DTO', async () => {
    const repo = makePresentationRepo();
    repo.create.mockResolvedValue(mockPresentation());
    const dto: CreatePresentationDTO = { name: 'Lata', userId: 1 };
    await new PresentationService(repo).create(dto);
    expect(repo.create).toHaveBeenCalledWith(dto);
  });

  it('updateState delega id y userId', async () => {
    const repo = makePresentationRepo();
    repo.updateState.mockResolvedValue(undefined);
    await new PresentationService(repo).updateState(1, 5);
    expect(repo.updateState).toHaveBeenCalledWith(1, 5);
  });

  it('delete delega el id', async () => {
    const repo = makePresentationRepo();
    repo.delete.mockResolvedValue(undefined);
    await new PresentationService(repo).delete(1);
    expect(repo.delete).toHaveBeenCalledWith(1);
  });
});

// ─────────────────────────────────────────────────────────────
// ProductBranchService
// ─────────────────────────────────────────────────────────────
const makeProductBranchRepo = (): jest.Mocked<IProductBranchRepository> => ({
  getByBranch: jest.fn(),
  getByBranchPaginated: jest.fn(),
  setStock: jest.fn(),
});

describe('ProductBranchService', () => {
  it('getByBranchPaginated delega branchId y filtros', async () => {
    const repo = makeProductBranchRepo();
    const pagResult = { data: [], total: 0, totalPages: 0 } as unknown as PaginatedBranchProducts;
    repo.getByBranchPaginated.mockResolvedValue(pagResult);
    const filters: BranchProductsFilters = { search: 'x' } as BranchProductsFilters;

    await new ProductBranchService(repo).getByBranchPaginated(1, filters);

    expect(repo.getByBranchPaginated).toHaveBeenCalledWith(1, filters);
  });

  it('setStock delega productId, branchId y DTO', async () => {
    const repo = makeProductBranchRepo();
    const response = { message: 'ok', productId: 1, branchId: 2, hasStock: true, stockQty: 10, deleted: false };
    repo.setStock.mockResolvedValue(response);
    const dto: UpdateStockDTO = { hasStock: true, stockQty: 10 };

    const result = await new ProductBranchService(repo).setStock(1, 2, dto);

    expect(repo.setStock).toHaveBeenCalledWith(1, 2, dto);
    expect(result.stockQty).toBe(10);
  });
});

// ─────────────────────────────────────────────────────────────
// ProductSupplierService
// ─────────────────────────────────────────────────────────────
const mockPS = (): ProductSupplier => ({ id: 1, productId: 1, supplierId: 2 } as ProductSupplier);

const makePSRepo = (): jest.Mocked<IProductSupplierRepository> => ({
  getAll: jest.fn(), getById: jest.fn(), create: jest.fn(),
  update: jest.fn(), delete: jest.fn(),
});

describe('ProductSupplierService', () => {
  it('getAll retorna la lista', async () => {
    const repo = makePSRepo();
    repo.getAll.mockResolvedValue([mockPS()]);
    expect(await new ProductSupplierService(repo).getAll()).toHaveLength(1);
  });

  it('create delega el DTO', async () => {
    const repo = makePSRepo();
    repo.create.mockResolvedValue(mockPS());
    const dto: CreateProductSupplierDTO = { productId: 1, supplierId: 2, agreedBuyPrice: 100 };
    await new ProductSupplierService(repo).create(dto);
    expect(repo.create).toHaveBeenCalledWith(dto);
  });

  it('updateState llama a update con el campo state', async () => {
    const repo = makePSRepo();
    repo.update.mockResolvedValue(mockPS());
    await new ProductSupplierService(repo).updateState(1, false);
    expect(repo.update).toHaveBeenCalledWith(1, { state: false });
  });

  it('delete delega el id', async () => {
    const repo = makePSRepo();
    repo.delete.mockResolvedValue(undefined);
    await new ProductSupplierService(repo).delete(1);
    expect(repo.delete).toHaveBeenCalledWith(1);
  });
});
