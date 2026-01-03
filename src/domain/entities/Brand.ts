/**
 * Brand Entity - Domain Layer (Frontend)
 */
export interface Brand {
  id: number;
  name: string;
  state: boolean;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}
