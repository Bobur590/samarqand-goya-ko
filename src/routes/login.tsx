import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginFn, registerFn } from "@/lib/auth.functions";
import { useServerFn } from "@tanstack/react-start";
import { LogIn, UserPlus } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [{ title: "Kirish | Startup → Hokim" }],
  }),
});

function LoginPage() {
  const { t } = useI18n();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = useServerFn(loginFn);
  const register = useServerFn(registerFn);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login({ data: { username, password } });
      if (result.success) {
        window.location.href = result.role === "admin" ? "/admin-dashboard" : "/user-dashboard";
      } else {
        const errorMap: Record<string, string> = { invalid_credentials: t.loginError };
        setError(errorMap[result.error] || t.loginErrorGeneric);
      }
    } catch {
      setError(t.loginErrorGeneric);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }
    setLoading(true);
    try {
      const result = await register({ data: { username, password, full_name: fullName, phone: phone || undefined, email: email || undefined, region: region || undefined } });
      if (result.success) {
        window.location.href = "/user-dashboard";
      } else {
        const errorMap: Record<string, string> = {
          username_taken: t.usernameTaken,
          email_taken: t.emailTaken,
          register_failed: t.registerFailed,
        };
        setError(errorMap[result.error] || t.loginErrorGeneric);
      }
    } catch {
      setError(t.loginErrorGeneric);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-10">
        <div className="w-full max-w-md px-4">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            {/* Tabs */}
            <div className="flex mb-6 border-b">
              <button
                onClick={() => { setMode("login"); setError(""); }}
                className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${mode === "login" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                <LogIn className="h-4 w-4 inline mr-1.5" />
                {t.loginTitle}
              </button>
              <button
                onClick={() => { setMode("register"); setError(""); }}
                className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${mode === "register" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                <UserPlus className="h-4 w-4 inline mr-1.5" />
                {t.registerTitle}
              </button>
            </div>

            {mode === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username">{t.username}</Label>
                  <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="password">{t.password}</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" required className="mt-1" />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t.loggingIn : t.loginButton}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  {t.noAccount}{" "}
                  <button type="button" onClick={() => setMode("register")} className="text-primary font-medium hover:underline">{t.register}</button>
                </p>
                <div className="mt-4 rounded-lg bg-accent/50 p-3 text-xs text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">Demo kirish:</p>
                  <p>👤 User: <code className="bg-accent px-1 rounded">startup_user</code> / <code className="bg-accent px-1 rounded">UserAccess_2026#</code></p>
                  <p>🔐 Admin: <code className="bg-accent px-1 rounded">superadmin</code> / <code className="bg-accent px-1 rounded">PanelMaster_2026#</code></p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <Label htmlFor="reg-fullname">{t.fullName} *</Label>
                  <Input id="reg-fullname" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="reg-username">{t.username} *</Label>
                  <Input id="reg-username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" required className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="reg-password">{t.password} *</Label>
                    <Input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="reg-confirm">{t.confirmPassword} *</Label>
                    <Input id="reg-confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reg-phone">{t.phone}</Label>
                  <Input id="reg-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 90 123 45 67" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="reg-email">{t.emailOptional}</Label>
                  <Input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="reg-region">{t.regionField}</Label>
                  <Input id="reg-region" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Samarqand" className="mt-1" />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t.registering : t.registerButton}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  {t.haveAccount}{" "}
                  <button type="button" onClick={() => setMode("login")} className="text-primary font-medium hover:underline">{t.login}</button>
                </p>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
