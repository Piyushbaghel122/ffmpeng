import axios, { AxiosError } from "axios";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const api = axios.create({
  baseURL: "/api",
});

export function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const payload = error.response?.data as { message?: string } | undefined;
    return payload?.message ?? error.message;
  }

  return error instanceof Error ? error.message : "Something went wrong";
}
