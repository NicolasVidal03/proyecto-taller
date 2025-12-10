export type UserRole = 'super_admin' | 'admin' | 'prevendedor' | 'transportista';
export type AssignableRole = Exclude<UserRole, 'super_admin'>;

export interface User {
  id: number;
  username: string;
  ci: string | null;
  names: string;
  last_name: string;
  second_last_name?: string | null;
  role: UserRole;
  state: boolean;
  branch_id?: number | null;
  auth_user_id?: string | null;
  email: string | null;
}

export const ROLE_OPTIONS: Array<{ value: AssignableRole; label: string }> = [
  { value: 'admin', label: 'Administrador' },
  { value: 'prevendedor', label: 'Prevendedor' },
  { value: 'transportista', label: 'Transportista' },
];
