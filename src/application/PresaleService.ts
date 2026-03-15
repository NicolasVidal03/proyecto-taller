import { Presale } from "@domain/entities/Presale";
import { CreatePresaleDTO, IPresaleRepository, PaginatedPresales, PresaleFilters, UpdatePresaleDTO } from "@domain/ports/IPresaleRepository";

export class PresaleService {
    constructor(private repo: IPresaleRepository) {}

    async getAll(filters?: PresaleFilters): Promise<PaginatedPresales> {
        return this.repo.getAll(filters)
    } 

    async getById(id: number, details?: boolean): Promise<Presale> {
        return this.repo.getById(id, details);
    }

    async assign(presaleId: number, distributorId: number): Promise<Presale | null> {
        return this.repo.assign(presaleId, distributorId)
    }

    async create(data: CreatePresaleDTO): Promise<Presale> {
        return this.repo.create(data);
    }

    async update(id: number, data: UpdatePresaleDTO): Promise<Presale> {
        return this.repo.update(id, data);
    }

    async cancelPresale(id: number, reason?: string): Promise<Presale> {
        return this.repo.cancelPresale(id, reason)
    }
}