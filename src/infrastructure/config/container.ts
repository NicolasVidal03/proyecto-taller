/**
 * Dependency Injection Container - Frontend
 * Contenedor central de servicios con inyección de dependencias
 */
import { 
  AuthService, 
  UserService, 
  CategoryService, 
  ProductService, 
  SupplierService,
  ProductSupplierService,
  BranchService,
  CountryService,
} from '../../application';

import { ClientService } from '../../application/ClientService';
import { AreaService } from '../../application/AreaService';

import {
  HttpAuthRepository,
  HttpUserRepository,
  HttpCategoryRepository,
  HttpProductRepository,
  HttpSupplierRepository,
  HttpProductSupplierRepository,
  HttpBranchRepository,
  HttpCountryRepository,
} from '../http/repositories';

import { HttpClientRepository } from '../http/repositories/HttpClientRepository';
import { HttpAreaRepository } from '../http/repositories/HttpAreaRepository';

// Repositories (Infraestructura)
const authRepository = new HttpAuthRepository();
const userRepository = new HttpUserRepository();
const categoryRepository = new HttpCategoryRepository();
const productRepository = new HttpProductRepository();
const supplierRepository = new HttpSupplierRepository();
const productSupplierRepository = new HttpProductSupplierRepository();
const branchRepository = new HttpBranchRepository();
const countryRepository = new HttpCountryRepository();
const clientRepository = new HttpClientRepository();
const areaRepository = new HttpAreaRepository();

// Services Container (Aplicación)
export const container = {
  auth: new AuthService(authRepository),
  users: new UserService(userRepository),
  categories: new CategoryService(categoryRepository),
  products: new ProductService(productRepository),
  suppliers: new SupplierService(supplierRepository),
  productSuppliers: new ProductSupplierService(productSupplierRepository),
  branches: new BranchService(branchRepository),
  countries: new CountryService(countryRepository),
  clients: new ClientService(clientRepository),
  areas: new AreaService(areaRepository),
};// Tipo del contenedor para TypeScript
export type Container = typeof container;
