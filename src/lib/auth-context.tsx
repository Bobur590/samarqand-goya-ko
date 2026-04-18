import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useServerFn } from "@tanstack/react-start";
import { getSessionFn, loginFn, logoutFn, registerFn } from "@/lib/auth.functions";
import type { AppRole } from "@/lib/types";

interface SessionState {
  authenticated: boolean;
  role: AppRole | null;
  username: string | null;
  userId: string | null;
  error: string | null;
}

interface LoginPayload {
  username: string;
  password: string;
  expectedRole?: AppRole;
}

interface RegisterPayload {
  username: string;
  password: string;
  full_name: string;
  phone?: string;
  email?: string;
  region?: string;
}

type LoginResult =
  | { success: true; role: AppRole; username: string; userId: string }
  | { success: false; error: string };

type RegisterResult =
  | { success: true; role: AppRole; username: string }
  | { success: false; error: string };

interface AuthContextValue {
  isLoading: boolean;
  isAuthenticated: boolean;
  role: AppRole | null;
  username: string | null;
  userId: string | null;
  error: string | null;
  refreshSession: () => Promise<SessionState>;
  login: (payload: LoginPayload) => Promise<LoginResult>;
  register: (payload: RegisterPayload) => Promise<RegisterResult>;
  logout: () => Promise<void>;
}

const initialSession: SessionState = {
  authenticated: false,
  role: null,
  username: null,
  userId: null,
  error: null,
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const runGetSession = useServerFn(getSessionFn);
  const runLogin = useServerFn(loginFn);
  const runRegister = useServerFn(registerFn);
  const runLogout = useServerFn(logoutFn);

  const [session, setSession] = useState<SessionState>(initialSession);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);

    try {
      const nextSession = await runGetSession();
      setSession(nextSession);
      return nextSession;
    } catch {
      const fallback = { ...initialSession, error: "session_restore_failed" };
      setSession(fallback);
      return fallback;
    } finally {
      setIsLoading(false);
    }
  }, [runGetSession]);

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      try {
        const nextSession = await runGetSession();
        if (!cancelled) {
          setSession(nextSession);
        }
      } catch {
        if (!cancelled) {
          setSession({ ...initialSession, error: "session_restore_failed" });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [runGetSession]);

  const login = useCallback(async (payload: LoginPayload) => {
    const result = await runLogin({ data: payload });

    if (result.success) {
      setSession({
        authenticated: true,
        role: result.role,
        username: result.username,
        userId: result.userId,
        error: null,
      });
      setIsLoading(false);
    } else {
      setSession((prev) => ({ ...prev, error: result.error }));
    }

    return result;
  }, [runLogin]);

  const register = useCallback(async (payload: RegisterPayload) => {
    const result = await runRegister({ data: payload });

    if (result.success) {
      setSession((prev) => ({
        ...prev,
        authenticated: true,
        role: result.role,
        username: result.username,
        error: null,
      }));
    } else {
      setSession((prev) => ({ ...prev, error: result.error }));
    }

    return result;
  }, [runRegister]);

  const logout = useCallback(async () => {
    try {
      await runLogout();
    } finally {
      setSession(initialSession);
      setIsLoading(false);
    }
  }, [runLogout]);

  const value = useMemo<AuthContextValue>(() => ({
    isLoading,
    isAuthenticated: session.authenticated,
    role: session.role,
    username: session.username,
    userId: session.userId,
    error: session.error,
    refreshSession,
    login,
    register,
    logout,
  }), [isLoading, session, refreshSession, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
