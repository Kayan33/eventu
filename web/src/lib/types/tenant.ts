export type PixKeyType = "cpf" | "email" | "phone" | "random";

export interface TenantEntity {
  id: string;
  name: string;
  pixKey?: string;
  pixKeyType?: PixKeyType;
  pixBeneficiary?: string;
}

export interface UpdateTenantPixPayload {
  pixKey: string;
  pixKeyType: PixKeyType;
  pixBeneficiary: string;
}

export interface UpdateTenantPayload {
  name: string;
  pixKey: string;
  pixKeyType: PixKeyType;
  pixBeneficiary: string;
}
