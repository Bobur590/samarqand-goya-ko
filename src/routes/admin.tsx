import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdminPanel } from "@/components/AdminPanel";
import { getSessionFn } from "@/lib/auth.functions";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [{ title: "Admin Panel | Startup → Hokim" }],
  }),
});

function AdminPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getSessionFn().then((s) => {
      if (!s.authenticated || s.role !== "admin") {
        navigate({ to: "/login" });
      } else {
        setAuthorized(true);
      }
    });
  }, []);

  if (authorized === null) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Tekshirilmoqda...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="mt-1 text-muted-foreground">Barcha startup g'oyalarini ko'ring va boshqaring</p>
          <div className="mt-6">
            <AdminPanel />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
