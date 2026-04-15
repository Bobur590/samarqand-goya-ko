import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { z } from "zod";

const USERS: Record<string, { password: string; role: "admin" | "user" }> = {
  admin: { password: "hokim2026!", role: "admin" },
  user: { password: "user123", role: "user" },
};

const loginSchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(1).max(100),
});

export const loginFn = createServerFn({ method: "POST" })
  .inputValidator((input: z.infer<typeof loginSchema>) => loginSchema.parse(input))
  .handler(async ({ data }) => {
    const user = USERS[data.username];
    if (!user || user.password !== data.password) {
      return { success: false as const, error: "Login yoki parol noto'g'ri" };
    }

    setCookie("auth_role", user.role, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    setCookie("auth_user", data.username, {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return { success: true as const, role: user.role, username: data.username };
  });

export const logoutFn = createServerFn({ method: "POST" })
  .handler(async () => {
    deleteCookie("auth_role");
    deleteCookie("auth_user");
    return { success: true };
  });

export const getSessionFn = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const role = getCookie("auth_role");
      const username = getCookie("auth_user");
      if (!role || !username) {
        return { authenticated: false as const, role: null, username: null };
      }
      return { authenticated: true as const, role: role as "admin" | "user", username };
    } catch {
      return { authenticated: false as const, role: null, username: null };
    }
  });
