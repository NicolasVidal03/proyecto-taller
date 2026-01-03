/**
 * Product Entity - Domain Layer (Frontend)
 */
export interface SalePrice {
  mayorista?: number;
  minorista?: number;
  regular?: number;
  [key: string]: number | undefined;
}

export interface Product {
  id: number;
  name: string;
  barcode: string | null;
  internalCode: string | null;
  presentationId: number | null;
  colorId: number | null;
  salePrice: SalePrice;
  state: boolean;
  categoryId: number;
  brandId: number;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
  // Datos de relaciones para lectura
  categoryName?: string;
  brandName?: string;
  presentationName?: string;
  colorName?: string;
  // Ruta pública hacia la imagen (ej: /images/products/1.jpg)
  pathImage?: string | null;
}
