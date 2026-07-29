import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { UserJwtPayload } from "@/lib/types/auth";

export function useRequireUser(adminOnly = false): { actor: UserJwtPayload | null; ready: boolean } {
  const router = useRouter();
  const { actor, loading } = useAuth();

  const isUser = actor?.type === "user";
  const allowed = isUser && (!adminOnly || actor.role === "admin");

  useEffect(() => {
    if (loading) return;
    if (!isUser) {
      router.replace("/login");
      return;
    }
    if (adminOnly && actor.role !== "admin") {
      router.replace("/");
    }
  }, [loading, isUser, adminOnly, actor, router]);

  return { actor: allowed ? (actor as UserJwtPayload) : null, ready: !loading && allowed };
}
