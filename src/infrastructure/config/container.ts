
import { 
  AuthService, 
  UserService, 
  CategoryService, 
  ProductService, 
  SupplierService,
  ProductSupplierService,
  BranchService,
  CountryService,
  BrandService,
  ProductBranchService,
  PresentationService,
  ColorService,
  ClientService,
  AreaService,
  RouteService,
} from '../../application';

import {
  HttpAuthRepository,
  HttpUserRepository,
  HttpCategoryRepository,
  HttpProductRepository,
  HttpSupplierRepository,
  HttpProductSupplierRepository,
  HttpBranchRepository,
  HttpCountryRepository,
  HttpBrandRepository,
  HttpProductBranchRepository,
  HttpPresentationRepository,
  HttpColorRepository,
  HttpClientRepository,
  HttpAreaRepository,
  HttpRouteRepository,
} from '../http/repositories';

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
const brandRepository = new HttpBrandRepository();
const productBranchRepository = new HttpProductBranchRepository();
const presentationRepository = new HttpPresentationRepository();
const colorRepository = new HttpColorRepository();
const routeRepository = new HttpRouteRepository();


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
  brands: new BrandService(brandRepository),
  productBranches: new ProductBranchService(productBranchRepository),
  presentations: new PresentationService(presentationRepository),
  colors: new ColorService(colorRepository),
  routes: new RouteService(routeRepository),
};
export type Container = typeof container;
