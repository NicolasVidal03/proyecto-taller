export interface ProductPrice {
  priceTypeId: number;
  priceTypeName?: string;
  price: number;
}

export interface Product {
  id: number;
  name: string;
  barcode: string | null;
  internalCode: string | null;
  presentationId: number | null;
  colorId: number | null;
  prices: ProductPrice[];
  state: boolean;
  categoryId: number;
  brandId: number;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
  categoryName?: string;
  brandName?: string;
  presentationName?: string;
  colorName?: string;
  pathImage?: string | null;
}
