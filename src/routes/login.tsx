import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginFn } from "@/lib/auth.functions";
import { useServerFn } from "@tanstack/react-start";
import { LogIn } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [{ title: "Kirish | Startup → Hokim" }],
  }),
});

function LoginPage() {
  const { t } = useI18n();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useServerFn(loginFn);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login({ data: { username, password } });
      if ("success" in result && result.success === true) {
        if (result.role === "admin") {
          window.location.href = "/admin-dashboard";
        } else {
          window.location.href = "/user-dashboard";
        }
      } else {
        setError(("error" in result && result.error) ? String(result.error) : t.loginError);
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
        <div className="w-full max-w-sm px-4">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <LogIn className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold text-foreground">{t.loginTitle}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username">{t.username}</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin / user" required />
              </div>
              <div>
                <Label htmlFor="password">{t.password}</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" required />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t.loggingIn : t.loginButton}
              </Button>

              <div className="text-xs text-muted-foreground text-center mt-3 space-y-1">
                <p><strong>Admin:</strong> admin / hokim2026!</p>
                <p><strong>User:</strong> user / user123</p>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
