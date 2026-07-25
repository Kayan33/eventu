"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  fetchMe,
  loginStaff,
  logout as logoutRequest,
  registerOrganization,
  type LoginPayload,
  type RegisterOrganizationPayload,
} from "@/lib/api/auth";
import type { JwtPayload } from "@/lib/types/auth";

interface AuthContextValue {
  actor: JwtPayload | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterOrganizationPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [actor, setActor] = useState<JwtPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshActor = useCallback(async () => {
    try {
      const { actor: current } = await fetchMe();
      setActor(current);
    } catch {
      setActor(null);
    }
  }, []);

  useEffect(() => {
    // The token lives in an httpOnly cookie, invisible to JS — the only way
    // to know who's logged in on first load is to ask the backend.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshActor().finally(() => setLoading(false));
  }, [refreshActor]);

  async function login(payload: LoginPayload) {
    const { actor: current } = await loginStaff(payload);
    setActor(current);
  }

  async function register(payload: RegisterOrganizationPayload) {
    const { actor: current } = await registerOrganization(payload);
    setActor(current);
  }

  async function logout() {
    await logoutRequest();
    setActor(null);
  }

  return (
    <AuthContext.Provider value={{ actor, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
