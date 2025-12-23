/**
 * Category Entity - Domain Layer (Frontend)
 */
export interface Category {
  id: number;
  name: string;
  description: string | null;
  state: boolean;
}
