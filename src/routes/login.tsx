import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginFn } from "@/lib/auth.functions";
import { useServerFn } from "@tanstack/react-start";
import { LogIn } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [{ title: "Kirish | Startup → Hokim" }],
  }),
});

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useServerFn(loginFn);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login({ data: { username, password } });
      if (result.success) {
        if (result.role === "admin") {
          navigate({ to: "/admin" });
        } else {
          navigate({ to: "/submit" });
        }
      } else {
        setError(result.error || "Xatolik yuz berdi");
      }
    } catch {
      setError("Xatolik yuz berdi");
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
              <h1 className="text-xl font-bold text-foreground">Tizimga kirish</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username">Login</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin yoki user"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Parol</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Kirilmoqda..." : "Kirish"}
              </Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
