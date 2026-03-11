import { Presale } from "@domain/entities/Presale";
import { IPresaleRepository, PaginatedPresales, PresaleFilters } from "@domain/ports/IPresaleRepository";

export class PresaleService {
    constructor(private repo: IPresaleRepository) {}

    async getAll(filters?: PresaleFilters): Promise<PaginatedPresales> {
        return this.repo.getAll()
    } 

    async assign(presaleId: number, distributorId: number): Promise<Presale | null> {
        return this.repo.assign(presaleId, distributorId)
    }
}