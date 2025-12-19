/**
 * Supplier Entity - Domain Layer (Frontend)
 */
export interface Supplier {
  id: number;
  nit: string;
  name: string;
  phone: string | null;
  country: string | null;
  address: string | null;
  contactName: string | null;
  state: boolean;
}
