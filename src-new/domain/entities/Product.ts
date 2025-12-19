/**
 * Product Entity - Domain Layer (Frontend)
 */
export interface Product {
  id: number;
  name: string;
  description?: string | null;
  categoryId: number;
  barcode: string | null;
  internalCode: string | null;
  presentation: string | null;
  color: string | null;
  urlImage: string | null;
  salePrices: any | null;
  referenceBuyPrice: number | null;
  price?: number;
  stock?: number;
  state: boolean;
}
