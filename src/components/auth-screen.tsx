import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { LogIn, Shield, UserPlus } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import type { AppRole } from "@/lib/types";

export type AuthScreenMode = "user-login" | "register" | "admin-login";

function getAuthCopy(mode: AuthScreenMode, lang: "uz" | "ru") {
  if (mode === "admin-login") {
    return {
      title: lang === "uz" ? "Admin kirish" : "Вход администратора",
      description:
        lang === "uz"
          ? "Faqat admin hisoblari uchun xavfsiz kirish sahifasi."
          : "Безопасный вход только для администраторских аккаунтов.",
      helperTitle: lang === "uz" ? "Admin kirish ma'lumotlari" : "Демо-данные администратора",
      helperBody: "superadmin / PanelMaster_2026#",
      altLinkLabel: lang === "uz" ? "Foydalanuvchi kirishi" : "Вход пользователя",
      altLinkTo: "/login" as const,
      submitLabel: lang === "uz" ? "Admin sifatida kirish" : "Войти как администратор",
      expectedRole: "admin" as AppRole,
    };
  }

  if (mode === "register") {
    return {
      title: lang === "uz" ? "Ro'yxatdan o'tish" : "Регистрация",
      description:
        lang === "uz"
          ? "Startup yuborish va holatlarni kuzatish uchun yangi foydalanuvchi akkauntini yarating."
          : "Создайте новый аккаунт пользователя для подачи стартапов и отслеживания статусов.",
      helperTitle: lang === "uz" ? "Allaqachon akkaunt bormi?" : "Уже есть аккаунт?",
      helperBody: lang === "uz" ? "Kirish sahifasiga o'ting." : "Перейдите на страницу входа.",
      altLinkLabel: lang === "uz" ? "Kirish" : "Войти",
      altLinkTo: "/login" as const,
      submitLabel: lang === "uz" ? "Ro'yxatdan o'tish" : "Зарегистрироваться",
      expectedRole: "user" as AppRole,
    };
  }

  return {
    title: lang === "uz" ? "Tizimga kirish" : "Вход в систему",
    description:
      lang === "uz"
        ? "Startup yuborish, PDF yuklash va arizalaringiz holatini kuzatish uchun tizimga kiring."
        : "Войдите, чтобы отправлять стартапы, загружать PDF и отслеживать статус заявок.",
    helperTitle: lang === "uz" ? "Demo foydalanuvchi" : "Демо-пользователь",
    helperBody: "startup_user / UserAccess_2026#",
    altLinkLabel: lang === "uz" ? "Admin kirish" : "Вход администратора",
    altLinkTo: "/admin-login" as const,
    submitLabel: lang === "uz" ? "Kirish" : "Войти",
    expectedRole: "user" as AppRole,
  };
}

export function AuthScreen({ mode }: { mode: AuthScreenMode }) {
  const { t, lang } = useI18n();
  const { login, register } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const copy = getAuthCopy(mode, lang);
  const isRegisterMode = mode === "register";
  const isAdminMode = mode === "admin-login";

  const mapError = (code: string) => {
    const errorMap: Record<string, string> = {
      invalid_credentials: t.loginError,
      username_taken: t.usernameTaken,
      email_taken: t.emailTaken,
      register_failed: t.registerFailed,
      password_mismatch: t.passwordMismatch,
      admin_only:
        lang === "uz"
          ? "Bu kirish sahifasi faqat admin akkauntlari uchun."
          : "Эта страница входа доступна только администраторам.",
      user_only:
        lang === "uz"
          ? "Bu kirish sahifasi faqat foydalanuvchilar uchun."
          : "Эта страница входа доступна только пользователям.",
      session_restore_failed:
        lang === "uz"
          ? "Sessiyani tiklashda xatolik yuz berdi."
          : "Не удалось восстановить сессию.",
    };

    return errorMap[code] || t.loginErrorGeneric;
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login({
        username,
        password,
        expectedRole: copy.expectedRole,
      });

      if (result.success) {
        window.location.assign(result.role === "admin" ? "/admin-dashboard" : "/user-dashboard");
        return;
      }

      setError(mapError(result.error));
    } catch {
      setError(t.loginErrorGeneric);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        username,
        password,
        full_name: fullName,
        phone: phone || undefined,
        email: email || undefined,
        region: region || undefined,
      });

      if (result.success) {
        window.location.assign("/user-dashboard");
        return;
      }

      setError(mapError(result.error));
    } catch {
      setError(t.loginErrorGeneric);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-10 md:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <section className="rounded-3xl border bg-card p-8 shadow-sm md:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border bg-accent/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              {isRegisterMode ? <UserPlus className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
              Startup → Hokim
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {copy.title}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
              {copy.description}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border bg-background p-5">
                <p className="text-sm font-semibold text-foreground">
                  {lang === "uz" ? "Ishonchli boshqaruv" : "Надёжное управление"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {lang === "uz"
                    ? "Rolga asoslangan kirish, himoyalangan dashboard va barqaror sessiya tiklanishi."
                    : "Ролевой доступ, защищённые панели и стабильное восстановление сессии."}
                </p>
              </div>
              <div className="rounded-2xl border bg-background p-5">
                <p className="text-sm font-semibold text-foreground">
                  {lang === "uz" ? "Real ish jarayoni" : "Реальный рабочий процесс"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {lang === "uz"
                    ? "Startup yuborish, PDF yuklash, admin ko'rib chiqishi va statuslar bitta tizimda."
                    : "Подача стартапов, загрузка PDF, админ-ревью и статусы в одной системе."}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border bg-card p-6 shadow-sm md:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">{copy.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{copy.description}</p>
            </div>

            {isRegisterMode ? (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="full-name">{t.fullName}</Label>
                  <Input id="full-name" value={fullName} onChange={(event) => setFullName(event.target.value)} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="username">{t.username}</Label>
                  <Input id="username" value={username} onChange={(event) => setUsername(event.target.value)} required className="mt-1" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="password">{t.password}</Label>
                    <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">{t.confirmPassword}</Label>
                    <Input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required className="mt-1" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="phone">{t.phone}</Label>
                    <Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="email">{t.emailOptional}</Label>
                    <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="region">{t.regionField}</Label>
                  <Input id="region" value={region} onChange={(event) => setRegion(event.target.value)} className="mt-1" />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t.registering : copy.submitLabel}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username">{t.username}</Label>
                  <Input id="username" value={username} onChange={(event) => setUsername(event.target.value)} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="password">{t.password}</Label>
                  <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required className="mt-1" />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t.loggingIn : copy.submitLabel}
                </Button>
              </form>
            )}

            <div className="mt-6 rounded-2xl bg-accent/50 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{copy.helperTitle}</p>
              <p className="mt-1 break-all">{copy.helperBody}</p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              {!isRegisterMode && !isAdminMode ? (
                <Link to="/register" className="text-primary hover:underline">
                  {t.register}
                </Link>
              ) : null}
              <Link to={copy.altLinkTo} className="text-primary hover:underline">
                {copy.altLinkLabel}
              </Link>
              {mode !== "user-login" ? (
                <Link to="/login" className="text-muted-foreground hover:text-foreground">
                  <LogIn className="mr-1 inline h-4 w-4" />
                  {lang === "uz" ? "Foydalanuvchi kirishi" : "Вход пользователя"}
                </Link>
              ) : null}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
