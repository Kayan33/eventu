import { apiFetch } from "./client";

export interface ClientEntity {
  id: string;
  name: string;
  email: string;
  cpf: string;
}

export function getClient(id: string): Promise<ClientEntity> {
  return apiFetch<ClientEntity>(`/clients/${id}`);
}
