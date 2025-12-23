import { Country } from '../domain/entities/Country';
import { ICountryRepository } from '../domain/ports/ICountryRepository';

export class CountryService {
  constructor(private readonly repository: ICountryRepository) {}

  async getAll(): Promise<Country[]> {
    return this.repository.getAll();
  }
}
