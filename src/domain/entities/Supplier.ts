export interface Supplier {
  id: number;
  nit: string;
  name: string;
  phone: string | null;
  countryId: number;
  address: string | null;
  contactName: string | null;
  state: boolean;
  userId?: number | null;
}
