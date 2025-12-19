/**
 * Dependency Injection Container - Frontend
 */
import { 
  AuthService, 
  UserService, 
  CategoryService, 
  ProductService, 
  SupplierService, 
  ProductSupplierService 
} from '../../application';

import {
  HttpAuthRepository,
  HttpUserRepository,
  HttpCategoryRepository,
  HttpProductRepository,
  HttpSupplierRepository,
  HttpProductSupplierRepository,
} from '../http/repositories';

// Repositories
const authRepository = new HttpAuthRepository();
const userRepository = new HttpUserRepository();
const categoryRepository = new HttpCategoryRepository();
const productRepository = new HttpProductRepository();
const supplierRepository = new HttpSupplierRepository();
const productSupplierRepository = new HttpProductSupplierRepository();

// Services Container
export const container = {
  auth: new AuthService(authRepository),
  users: new UserService(userRepository),
  categories: new CategoryService(categoryRepository),
  products: new ProductService(productRepository),
  suppliers: new SupplierService(supplierRepository),
  productSuppliers: new ProductSupplierService(productSupplierRepository),
};
