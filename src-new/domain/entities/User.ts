/**
 * User Entity - Domain Layer (Frontend)
 */
export interface User {
  id: number;
  username: string;
  ci: string;
  names: string;
  lastName: string;
  secondLastName: string;
  role: string;
  branchId: number;
  state: boolean;
}
