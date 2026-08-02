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
  loginClient,
  loginStaff,
  logout as logoutRequest,
  registerClient,
  registerOrganization,
  type LoginPayload,
  type RegisterClientPayload,
  type RegisterOrganizationPayload,
} from "@/lib/api/auth";
import type { JwtPayload } from "@/lib/types/auth";

interface AuthContextValue {
  actor: JwtPayload | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<JwtPayload>;
  register: (payload: RegisterOrganizationPayload) => Promise<JwtPayload>;
  loginAsClient: (payload: LoginPayload) => Promise<JwtPayload>;
  registerAsClient: (payload: RegisterClientPayload) => Promise<JwtPayload>;
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
    return current;
  }

  async function register(payload: RegisterOrganizationPayload) {
    const { actor: current } = await registerOrganization(payload);
    setActor(current);
    return current;
  }

  async function loginAsClient(payload: LoginPayload) {
    const { actor: current } = await loginClient(payload);
    setActor(current);
    return current;
  }

  async function registerAsClient(payload: RegisterClientPayload) {
    await registerClient(payload);
    return loginAsClient({ email: payload.email, password: payload.password });
  }

  async function logout() {
    await logoutRequest();
    setActor(null);
  }

  return (
    <AuthContext.Provider
      value={{ actor, loading, login, register, loginAsClient, registerAsClient, logout }}
    >
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
