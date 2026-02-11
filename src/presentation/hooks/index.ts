// ========== Hooks Compartidos / Genéricos ==========
export * from './shared';

// ========== Hooks de Debounce ==========
export { useDebounce } from './useDebounce';

// ========== Hooks de Entidades ==========

// Users
export { useUsers } from './useUsers';
export type { UseUsersReturn, UserError } from './useUsers';

// Branches
export { useBranches } from './useBranches';
export type { UseBranchesReturn, BranchError } from './useBranches';

// Categories
export { useCategories } from './useCategories';
export type { UseCategoriesReturn } from './useCategories';

// Products
export { useProducts } from './useProducts';
export type { UseProductsReturn } from './useProducts';

// Suppliers
export { useSuppliers } from './useSuppliers';
export type { UseSuppliersReturn, SupplierFilters } from './useSuppliers';

// Product Suppliers
export { useProductSuppliers } from './useProductSuppliers';
export type { UseProductSuppliersReturn } from './useProductSuppliers';

// Presentations
export { usePresentations } from './usePresentations';
export type { UsePresentationsReturn } from './usePresentations';

// Colors
export { useColors } from './useColors';
export type { UseColorsReturn } from './useColors';

// Brands
export { useBrands } from './useBrands';
export type { UseBrandsReturn } from './useBrands';

// Clients
export { useClients } from './useClients';
export type { UseClientsReturn } from './useClients';

// Inventory
export { useInventory } from './useInventory';
export type { UseInventoryReturn } from './useInventory';
