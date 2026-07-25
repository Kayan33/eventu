export type UserRole = "admin" | "editor" | "viewer";

export interface UserJwtPayload {
  sub: string;
  tenantId: string;
  role: UserRole;
  type: "user";
}

export interface ClientJwtPayload {
  sub: string;
  type: "client";
}

export type JwtPayload = UserJwtPayload | ClientJwtPayload;
