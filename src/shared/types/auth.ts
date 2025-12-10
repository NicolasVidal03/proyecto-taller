export interface AuthUser {
  id: number;
  username: string;
  names: string;
  last_name: string;
  second_last_name: string | null;
  role: string;
  branch_id: number | null;
  state?: boolean;
}

export interface AuthLoginResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  user: AuthUser;
}
