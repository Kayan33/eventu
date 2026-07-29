import { apiFetch } from "./client";
import type { TeamMember } from "@/lib/types/user";
import type { UserRole } from "@/lib/types/auth";

export interface CreateTeamMemberPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateTeamMemberPayload {
  name?: string;
  email?: string;
  role?: UserRole;
}

export function listTeamMembers(): Promise<TeamMember[]> {
  return apiFetch<TeamMember[]>("/users");
}

export function getTeamMember(id: string): Promise<TeamMember> {
  return apiFetch<TeamMember>(`/users/${id}`);
}

export function createTeamMember(payload: CreateTeamMemberPayload): Promise<TeamMember> {
  return apiFetch<TeamMember>("/users", { method: "POST", body: payload });
}

export function updateTeamMember(
  id: string,
  payload: UpdateTeamMemberPayload,
): Promise<TeamMember> {
  return apiFetch<TeamMember>(`/users/${id}`, { method: "PUT", body: payload });
}

export function removeTeamMember(id: string): Promise<void> {
  return apiFetch<void>(`/users/${id}`, { method: "DELETE" });
}
