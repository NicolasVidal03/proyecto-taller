/**
 * ProductSupplier Entity - Domain Layer (Frontend)
 */
export interface ProductSupplier {
  id: number;
  productId: number;
  supplierId: number;
  agreedBuyPrice: number;
  state: boolean;
}
