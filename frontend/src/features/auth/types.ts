export interface AuthUser {
  id: string;
  username: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
}
