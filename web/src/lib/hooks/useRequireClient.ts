import { useAuth } from "@/contexts/AuthContext";
import type { ClientJwtPayload } from "@/lib/types/auth";

export function useRequireClient(): { actor: ClientJwtPayload | null; ready: boolean } {
  const { actor, loading } = useAuth();
  const isClient = actor?.type === "client";
  return { actor: isClient ? (actor as ClientJwtPayload) : null, ready: !loading };
}
