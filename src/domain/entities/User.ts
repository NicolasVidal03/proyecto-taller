/**
 * User Entity - Domain Layer (Frontend)
 */
export interface User {
  id: number;
  userName: string;
  ci: string;
  names: string;
  lastName: string;
  secondLastName: string;
  role: string;
  branchId: number | null;
}
