import { http } from '@shared/api/httpClient';
import { AssignableRole, User } from '@shared/types/user';

export interface UserDTO {
  id: number;
  username: string;
  ci: string;
  names: string;
  last_name: string;
  second_last_name?: string | null;
  role: string;
  state: boolean;
  branch_id?: number | null;
  email: string | null;
  auth_user_id?: string | null;
  auth0_email?: string | null;
  auth0_password?: string | null;
}

export interface UserFormValues {
  username: string;
  ci?: string | null;
  email: string;
  names: string;
  last_name: string;
  second_last_name?: string | null;
  branch_id: number;
  role: AssignableRole;
  // Optional credential (password) that a super_admin can supply when creating a user
  auth_password?: string;
}

export interface UpdateUserPayload {
  username?: string;
  ci?: string | null;
  email?: string;
  names?: string;
  last_name?: string;
  second_last_name?: string | null;
  branch_id?: number | null;
  role?: AssignableRole;
  auth_password?: string;
}

export interface UpdateUserResult {
  user: User;
  auth0Email?: string | null;
  auth0Password?: string | null;
}

const toUser = (dto: UserDTO): User => ({
  id: dto.id,
  username: dto.username,
  ci: (dto as any).ci ?? null,
  email: (dto as any).email ?? null,
  names: dto.names,
  last_name: dto.last_name,
  second_last_name: dto.second_last_name ?? null,
  role: dto.role as User['role'],
  state: dto.state,
  branch_id: dto.branch_id ?? null,
  auth_user_id: dto.auth_user_id ?? null,
});

export async function getUsers(): Promise<User[]> {
  const response = await http.get<UserDTO[]>('/users');
  return response.data.map(toUser);
}

export async function createUser(payload: UserFormValues): Promise<void> {
  await http.post('/users', {
    username: payload.username,
    ci: payload.ci,
    email: payload.email,
    names: payload.names,
    last_name: payload.last_name,
    second_last_name: payload.second_last_name ?? null,
    rol: payload.role,
    branch_id: payload.branch_id,
    auth_password: payload.auth_password,
  });
}

export async function updateUser(id: number, payload: UpdateUserPayload): Promise<UpdateUserResult> {
  const body: Record<string, unknown> = {};
  if (payload.username !== undefined) body.username = payload.username;
  if (payload.ci !== undefined) body.ci = payload.ci;
  if (payload.email !== undefined) body.email = payload.email;
  if (payload.names !== undefined) body.names = payload.names;
  if (payload.last_name !== undefined) body.last_name = payload.last_name;
  if (payload.second_last_name !== undefined) body.second_last_name = payload.second_last_name ?? null;
  if (payload.branch_id !== undefined) body.branch_id = payload.branch_id;
  if (payload.role !== undefined) body.rol = payload.role;
  if (payload.auth_password !== undefined) body.auth_password = payload.auth_password;

  body.sync_auth0 = true;

  const response = await http.put<UserDTO>(`/users/${id}`, body);
  const dto = response.data;
  return {
    user: toUser(dto),
    auth0Email: dto.auth0_email ?? undefined,
    auth0Password: dto.auth0_password ?? undefined,
  };
}

export async function deactivateUser(id: number): Promise<void> {
  await http.delete(`/users/${id}`);
}

export async function deleteUserHard(id: number): Promise<void> {
  // permanent deletion removed - keep API for compatibility but throw
  throw new Error('Permanent delete is not allowed');
}
