import { useSession } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { AppRole } from "@/lib/types";

interface SessionPayload {
  userId?: string;
}

export interface AuthSessionUser {
  userId: string;
  username: string;
  role: AppRole;
}

function getSessionConfig() {
  const password = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.LOVABLE_API_KEY;

  if (!password) {
    throw new Error("Missing session secret");
  }

  return {
    password,
    name: "startup-platform-session",
    maxAge: 60 * 60 * 24 * 7,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

function isRole(role: string): role is AppRole {
  return role === "admin" || role === "user";
}

export async function getAuthSessionManager() {
  return useSession<SessionPayload>(getSessionConfig());
}

export async function persistAuthSession(userId: string) {
  const session = await getAuthSessionManager();
  await session.update({ userId });
}

export async function clearAuthSession() {
  const session = await getAuthSessionManager();
  await session.clear();
}

export async function resolveAuthSession(): Promise<AuthSessionUser | null> {
  const session = await getAuthSessionManager();
  const userId = session.data.userId;

  if (!userId) {
    return null;
  }

  const { data: user, error } = await supabaseAdmin
    .from("app_users")
    .select("id, username, role")
    .eq("id", userId)
    .maybeSingle();

  if (error || !user || !isRole(user.role)) {
    await session.clear();
    return null;
  }

  return {
    userId: user.id,
    username: user.username,
    role: user.role,
  };
}

export async function requireAuth(requiredRole?: AppRole) {
  const sessionUser = await resolveAuthSession();

  if (!sessionUser) {
    throw new Error("Unauthorized");
  }

  if (requiredRole && sessionUser.role !== requiredRole) {
    throw new Error("Forbidden");
  }

  return sessionUser;
}
