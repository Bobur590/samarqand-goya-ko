import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  clearAuthSession,
  getAuthSessionManager,
  persistAuthSession,
  requireAuth,
  resolveAuthSession,
} from "@/lib/auth-session";
import type { AppRole } from "@/lib/types";

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const hash = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    256,
  );
  const saltB64 = btoa(String.fromCharCode(...salt));
  const hashB64 = btoa(String.fromCharCode(...new Uint8Array(hash)));
  return `${saltB64}:${hashB64}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltB64, hashB64] = stored.split(":");

  if (!saltB64 || !hashB64) {
    return false;
  }

  const salt = Uint8Array.from(atob(saltB64), (char) => char.charCodeAt(0));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const hash = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    256,
  );
  const computed = btoa(String.fromCharCode(...new Uint8Array(hash)));
  return computed === hashB64;
}

interface DemoAccountInput {
  username: string;
  password: string;
  full_name: string;
  role: AppRole;
  phone?: string | null;
  email?: string | null;
  region?: string | null;
}

async function ensureDemoAccount(input: DemoAccountInput) {
  const passwordHash = await hashPassword(input.password);
  const { data: existingUser } = await supabaseAdmin
    .from("app_users")
    .select("id")
    .eq("username", input.username)
    .limit(1)
    .maybeSingle();

  if (existingUser) {
    await supabaseAdmin
      .from("app_users")
      .update({
        password_hash: passwordHash,
        full_name: input.full_name,
        role: input.role,
        phone: input.phone ?? null,
        email: input.email ?? null,
        region: input.region ?? null,
      })
      .eq("id", existingUser.id);
    return;
  }

  await supabaseAdmin.from("app_users").insert({
    username: input.username,
    password_hash: passwordHash,
    full_name: input.full_name,
    role: input.role,
    phone: input.phone ?? null,
    email: input.email ?? null,
    region: input.region ?? null,
  });
}

async function seedDemoAccounts() {
  await ensureDemoAccount({
    username: "superadmin",
    password: "PanelMaster_2026#",
    full_name: "Super Admin",
    role: "admin",
  });

  await ensureDemoAccount({
    username: "startup_user",
    password: "UserAccess_2026#",
    full_name: "Demo Foydalanuvchi",
    role: "user",
    phone: "+998 90 123 45 67",
    email: "demo@startup.uz",
    region: "Samarqand",
  });
}

const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8).max(100),
  full_name: z.string().min(2).max(100),
  phone: z.string().min(5).max(20).optional(),
  email: z.string().email().max(255).optional(),
  region: z.string().max(100).optional(),
});

export const registerFn = createServerFn({ method: "POST" })
  .inputValidator((input: z.infer<typeof registerSchema>) => registerSchema.parse(input))
  .handler(async ({ data }) => {
    const { data: existingUsername } = await supabaseAdmin
      .from("app_users")
      .select("id")
      .eq("username", data.username)
      .limit(1)
      .maybeSingle();

    if (existingUsername) {
      return { success: false as const, error: "username_taken" };
    }

    if (data.email) {
      const { data: existingEmail } = await supabaseAdmin
        .from("app_users")
        .select("id")
        .eq("email", data.email)
        .limit(1)
        .maybeSingle();

      if (existingEmail) {
        return { success: false as const, error: "email_taken" };
      }
    }

    const passwordHash = await hashPassword(data.password);
    const { data: user, error } = await supabaseAdmin
      .from("app_users")
      .insert({
        username: data.username,
        password_hash: passwordHash,
        full_name: data.full_name,
        phone: data.phone || null,
        email: data.email || null,
        region: data.region || null,
        role: "user",
      })
      .select("id, username, role")
      .single();

    if (error || !user) {
      console.error("Register error:", error);
      return { success: false as const, error: "register_failed" };
    }

    await persistAuthSession(user.id);

    return {
      success: true as const,
      role: user.role as AppRole,
      username: user.username,
    };
  });

const loginSchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(1).max(100),
  expectedRole: z.enum(["admin", "user"]).optional(),
});

export const loginFn = createServerFn({ method: "POST" })
  .inputValidator((input: z.infer<typeof loginSchema>) => loginSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      await seedDemoAccounts();
    } catch (error) {
      console.error("Seed error:", error);
    }

    const { data: user } = await supabaseAdmin
      .from("app_users")
      .select("id, username, password_hash, role")
      .eq("username", data.username)
      .limit(1)
      .maybeSingle();

    if (!user) {
      return { success: false as const, error: "invalid_credentials" };
    }

    const validPassword = await verifyPassword(data.password, user.password_hash);

    if (!validPassword) {
      return { success: false as const, error: "invalid_credentials" };
    }

    if (data.expectedRole && user.role !== data.expectedRole) {
      return {
        success: false as const,
        error: data.expectedRole === "admin" ? "admin_only" : "user_only",
      };
    }

    await persistAuthSession(user.id);

    return {
      success: true as const,
      role: user.role as AppRole,
      username: user.username,
      userId: user.id,
    };
  });

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  await clearAuthSession();
  return { success: true as const };
});

export const getSessionFn = createServerFn({ method: "GET" }).handler(async () => {
  const sessionManager = await getAuthSessionManager();
  const hadStoredSession = Boolean(sessionManager.data.userId);
  const sessionUser = await resolveAuthSession();

  if (!sessionUser) {
    return {
      authenticated: false as const,
      role: null,
      username: null,
      userId: null,
      error: hadStoredSession ? "session_restore_failed" : null,
    };
  }

  return {
    authenticated: true as const,
    role: sessionUser.role,
    username: sessionUser.username,
    userId: sessionUser.userId,
    error: null,
  };
});

export const getUserProfileFn = createServerFn({ method: "POST" })
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data }) => {
    const sessionUser = await requireAuth();

    if (sessionUser.role !== "admin" && sessionUser.userId !== data.userId) {
      throw new Error("Forbidden");
    }

    const { data: user, error } = await supabaseAdmin
      .from("app_users")
      .select("id, username, full_name, phone, email, region, role, created_at")
      .eq("id", data.userId)
      .maybeSingle();

    if (error) {
      throw new Error("Failed to fetch profile");
    }

    return user;
  });

const updateProfileSchema = z.object({
  userId: z.string().uuid(),
  full_name: z.string().min(2).max(100),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(255).optional(),
  region: z.string().max(100).optional(),
});

export const updateProfileFn = createServerFn({ method: "POST" })
  .inputValidator((input: z.infer<typeof updateProfileSchema>) => updateProfileSchema.parse(input))
  .handler(async ({ data }) => {
    const sessionUser = await requireAuth();

    if (sessionUser.role !== "admin" && sessionUser.userId !== data.userId) {
      throw new Error("Forbidden");
    }

    const { error } = await supabaseAdmin
      .from("app_users")
      .update({
        full_name: data.full_name,
        phone: data.phone || null,
        email: data.email || null,
        region: data.region || null,
      })
      .eq("id", data.userId);

    if (error) {
      throw new Error("Update failed");
    }

    return { success: true as const };
  });

export const getAllUsersFn = createServerFn({ method: "GET" }).handler(async () => {
  await requireAuth("admin");

  const { data, error } = await supabaseAdmin
    .from("app_users")
    .select("id, username, full_name, phone, email, region, role, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Failed to fetch users");
  }

  return data || [];
});
