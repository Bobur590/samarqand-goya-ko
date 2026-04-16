import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// --- Password hashing with Web Crypto (Worker-compatible) ---
async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const hash = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" }, keyMaterial, 256);
  const saltB64 = btoa(String.fromCharCode(...salt));
  const hashB64 = btoa(String.fromCharCode(...new Uint8Array(hash)));
  return `${saltB64}:${hashB64}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltB64, hashB64] = stored.split(":");
  if (!saltB64 || !hashB64) return false;
  const salt = Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const hash = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" }, keyMaterial, 256);
  const computed = btoa(String.fromCharCode(...new Uint8Array(hash)));
  return computed === hashB64;
}

// --- Seed demo accounts ---
async function seedDemoAccounts() {
  // Admin: superadmin / PanelMaster_2026#
  const { data: adminExists } = await supabaseAdmin.from("app_users").select("id").eq("username", "superadmin").single();
  if (!adminExists) {
    const hash = await hashPassword("PanelMaster_2026#");
    await supabaseAdmin.from("app_users").insert({
      username: "superadmin",
      password_hash: hash,
      full_name: "Super Admin",
      role: "admin",
    });
  }

  // User: startup_user / UserAccess_2026#
  const { data: userExists } = await supabaseAdmin.from("app_users").select("id").eq("username", "startup_user").single();
  if (!userExists) {
    const hash = await hashPassword("UserAccess_2026#");
    await supabaseAdmin.from("app_users").insert({
      username: "startup_user",
      password_hash: hash,
      full_name: "Demo Foydalanuvchi",
      phone: "+998 90 123 45 67",
      email: "demo@startup.uz",
      region: "Samarqand",
      role: "user",
    });
  }
}

// --- Cookie helpers ---
function setAuthCookies(userId: string, username: string, role: string) {
  const opts = { httpOnly: true, secure: false, sameSite: "lax" as const, maxAge: 60 * 60 * 24, path: "/" };
  setCookie("auth_user_id", userId, opts);
  setCookie("auth_user", username, { ...opts, httpOnly: false });
  setCookie("auth_role", role, opts);
}

// --- Register ---
const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(6).max(100),
  full_name: z.string().min(2).max(100),
  phone: z.string().min(5).max(20).optional(),
  email: z.string().email().max(255).optional(),
  region: z.string().max(100).optional(),
});

export const registerFn = createServerFn({ method: "POST" })
  .inputValidator((input: z.infer<typeof registerSchema>) => registerSchema.parse(input))
  .handler(async ({ data }) => {
    const { data: existing } = await supabaseAdmin.from("app_users").select("id").eq("username", data.username).single();
    if (existing) return { success: false as const, error: "username_taken" };

    if (data.email) {
      const { data: emailExists } = await supabaseAdmin.from("app_users").select("id").eq("email", data.email).single();
      if (emailExists) return { success: false as const, error: "email_taken" };
    }

    const hash = await hashPassword(data.password);
    const { data: user, error } = await supabaseAdmin.from("app_users").insert({
      username: data.username,
      password_hash: hash,
      full_name: data.full_name,
      phone: data.phone || null,
      email: data.email || null,
      region: data.region || null,
      role: "user",
    }).select().single();

    if (error) {
      console.error("Register error:", error);
      return { success: false as const, error: "register_failed" };
    }

    setAuthCookies(user.id, user.username, user.role);
    return { success: true as const, role: user.role, username: user.username };
  });

// --- Login ---
const loginSchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(1).max(100),
});

export const loginFn = createServerFn({ method: "POST" })
  .inputValidator((input: z.infer<typeof loginSchema>) => loginSchema.parse(input))
  .handler(async ({ data }) => {
    // Seed demo accounts on first login attempt
    try { await seedDemoAccounts(); } catch (e) { console.error("Seed error:", e); }

    const { data: user } = await supabaseAdmin.from("app_users")
      .select("*")
      .eq("username", data.username)
      .single();

    if (!user) return { success: false as const, error: "invalid_credentials" };

    const valid = await verifyPassword(data.password, user.password_hash);
    if (!valid) return { success: false as const, error: "invalid_credentials" };

    setAuthCookies(user.id, user.username, user.role);
    return { success: true as const, role: user.role, username: user.username, userId: user.id };
  });

// --- Logout ---
export const logoutFn = createServerFn({ method: "POST" })
  .handler(async () => {
    deleteCookie("auth_role");
    deleteCookie("auth_user");
    deleteCookie("auth_user_id");
    return { success: true };
  });

// --- Session ---
export const getSessionFn = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const role = getCookie("auth_role");
      const username = getCookie("auth_user");
      const userId = getCookie("auth_user_id");
      if (!role || !username || !userId) {
        return { authenticated: false as const, role: null, username: null, userId: null };
      }
      return { authenticated: true as const, role: role as "admin" | "user", username, userId };
    } catch {
      return { authenticated: false as const, role: null, username: null, userId: null };
    }
  });

// --- Get user profile ---
export const getUserProfileFn = createServerFn({ method: "POST" })
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data }) => {
    const { data: user } = await supabaseAdmin.from("app_users")
      .select("id, username, full_name, phone, email, region, role, created_at")
      .eq("id", data.userId)
      .single();
    return user;
  });

// --- Update user profile ---
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
    const { error } = await supabaseAdmin.from("app_users").update({
      full_name: data.full_name,
      phone: data.phone || null,
      email: data.email || null,
      region: data.region || null,
    }).eq("id", data.userId);
    if (error) throw new Error("Update failed");
    return { success: true };
  });

// --- Admin: get all users ---
export const getAllUsersFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin.from("app_users")
      .select("id, username, full_name, phone, email, region, role, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error("Failed to fetch users");
    return data || [];
  });
