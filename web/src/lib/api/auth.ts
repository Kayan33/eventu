import { apiFetch } from "./client";
import type { JwtPayload, UserJwtPayload } from "@/lib/types/auth";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterOrganizationPayload {
  tenantName: string;
  name: string;
  email: string;
  password: string;
}

interface AuthResponse<T> {
  actor: T;
}

export function loginStaff(payload: LoginPayload): Promise<AuthResponse<UserJwtPayload>> {
  return apiFetch<AuthResponse<UserJwtPayload>>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function registerOrganization(
  payload: RegisterOrganizationPayload,
): Promise<AuthResponse<UserJwtPayload>> {
  return apiFetch<AuthResponse<UserJwtPayload>>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function fetchMe(): Promise<AuthResponse<JwtPayload>> {
  return apiFetch<AuthResponse<JwtPayload>>("/auth/me");
}

export function logout(): Promise<void> {
  return apiFetch<void>("/auth/logout", { method: "POST" });
}
