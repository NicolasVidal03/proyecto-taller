import { Country } from '../entities/Country';

export interface ICountryRepository {
  getAll(): Promise<Country[]>;
}
