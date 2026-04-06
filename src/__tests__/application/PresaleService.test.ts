import { PresaleService } from '@application/PresaleService';
import { IPresaleRepository, PaginatedPresales, PresaleFilters, CreatePresaleDTO, UpdatePresaleDTO } from '@domain/ports/IPresaleRepository';
import { Presale } from '@domain/entities/Presale';

const mockPresale = (): Presale => ({ id: 1, status: 'pendiente' } as unknown as Presale);

const makePaginatedPresales = (): PaginatedPresales => ({
    data: [mockPresale()], total: 1, page: 1, limit: 10, totalPages: 1,
});

const makePresaleRepo = (): jest.Mocked<IPresaleRepository> => ({
    getAll: jest.fn(), 
    getById: jest.fn(), 
    assign: jest.fn(),
    create: jest.fn(), 
    update: jest.fn(), 
    cancelPresale: jest.fn(),
});

describe('PresaleService', () => {
    it('getAll llama al repositorio con los filtros', async () => {
        const repo = makePresaleRepo();
        repo.getAll.mockResolvedValue(makePaginatedPresales());
        const filters: PresaleFilters = { status: 'pendiente' };

        const result = await new PresaleService(repo).getAll(filters);

        expect(repo.getAll).toHaveBeenCalledWith(filters);
        expect(result.data).toHaveLength(1);
    });

    it('getAll sin filtros pasa undefined al repositorio', async () => {
        const repo = makePresaleRepo();
        repo.getAll.mockResolvedValue(makePaginatedPresales());
        await new PresaleService(repo).getAll();
        expect(repo.getAll).toHaveBeenCalledWith(undefined);
    });

    it('getById busca según el id', async () => {
        const repo = makePresaleRepo();
        repo.getById.mockResolvedValue(mockPresale());
        await new PresaleService(repo).getById(1, true);
        expect(repo.getById).toHaveBeenCalledWith(1, true);
    });

    it('assign usa presaleId y distributorId', async () => {
        const repo = makePresaleRepo();
        repo.assign.mockResolvedValue(mockPresale());
        const result = await new PresaleService(repo).assign(1, 5);
        expect(repo.assign).toHaveBeenCalledWith(1, 5);
        expect(result).not.toBeNull();
    });

    it('create llama al DTO y crea la preventa', async () => {
        const repo = makePresaleRepo();
        repo.create.mockResolvedValue(mockPresale());
        const dto: CreatePresaleDTO = {
            clientId: 1, businessId: 2, branchId: 3,
            deliveryDate: '2024-01-15', details: [],
        };
        await new PresaleService(repo).create(dto);
        expect(repo.create).toHaveBeenCalledWith(dto);
    });

    it('update usa id y DTO', async () => {
        const repo = makePresaleRepo();
        repo.update.mockResolvedValue(mockPresale());
        const dto: UpdatePresaleDTO = { notes: 'urgente' };
        await new PresaleService(repo).update(1, dto);
        expect(repo.update).toHaveBeenCalledWith(1, dto);
    });

    it('cancelPresale llama según id y llama a razón', async () => {
        const repo = makePresaleRepo();
        repo.cancelPresale.mockResolvedValue({ ...mockPresale(), status: 'cancelado' } as unknown as Presale);
        const result = await new PresaleService(repo).cancelPresale(1, 'Sin stock');
        expect(repo.cancelPresale).toHaveBeenCalledWith(1, 'Sin stock');
        expect((result as any).status).toBe('cancelado');
    });

    it('cancelPresale peude funcionar sin razón (undefined)', async () => {
        const repo = makePresaleRepo();
        repo.cancelPresale.mockResolvedValue(mockPresale());
        await new PresaleService(repo).cancelPresale(1);
        expect(repo.cancelPresale).toHaveBeenCalledWith(1, undefined);
    });
});