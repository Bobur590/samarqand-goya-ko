import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HokimDashboard } from "@/components/HokimDashboard";
import { getSessionFn } from "@/lib/auth.functions";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [{ title: "Hokimiyat Dashboard | Startup → Hokim" }],
  }),
});

function DashboardPage() {
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
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-foreground">Hokimiyat Dashboard</h1>
            <span className="rounded-full bg-gold/15 border border-gold/30 px-2.5 py-0.5 text-xs font-semibold text-gold-foreground">TOP</span>
          </div>
          <p className="text-muted-foreground">Faqat 85+ ball olgan eng yaxshi startup loyihalar</p>
          <div className="mt-6">
            <HokimDashboard />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
