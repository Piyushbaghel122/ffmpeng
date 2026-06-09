import { api } from "../../../shared/lib/api";
import type { LoginInput, LoginResponse } from "../types";

export async function loginApi(input: LoginInput): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", input);
  return response.data;
}
