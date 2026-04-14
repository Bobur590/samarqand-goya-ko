import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdminPanel } from "@/components/AdminPanel";
import { getSessionFn } from "@/lib/auth.functions";
import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { LayoutDashboard, List, Trophy, BarChart3 } from "lucide-react";
import { HokimDashboard } from "@/components/HokimDashboard";

export const Route = createFileRoute("/admin-dashboard")({
  component: AdminDashboardPage,
  head: () => ({
    meta: [{ title: "Admin Dashboard | Startup → Hokim" }],
  }),
});

function AdminDashboardPage() {
  const { t } = useI18n();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "top" | "stats">("all");

  useEffect(() => {
    getSessionFn().then((s) => {
      if (!s.authenticated || s.role !== "admin") {
        window.location.href = "/login";
      } else {
        setAuthorized(true);
      }
    }).catch(() => {
      window.location.href = "/login";
    });
  }, []);

  if (authorized === null) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">{t.checking}</p>
        </main>
        <Footer />
      </div>
    );
  }

  const sidebarItems = [
    { key: "all" as const, label: t.allStartups, icon: List },
    { key: "top" as const, label: t.topStartups, icon: Trophy },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r bg-sidebar">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-sidebar-primary" />
              <span className="font-bold text-sidebar-foreground">{t.adminDashboard}</span>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === item.key
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile tabs */}
        <main className="flex-1 flex flex-col">
          <div className="md:hidden flex border-b bg-card">
            {sidebarItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === item.key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex-1 py-6 md:py-8">
            <div className="mx-auto max-w-6xl px-4 md:px-6">
              {activeTab === "all" && (
                <>
                  <h1 className="text-2xl font-bold text-foreground">{t.adminTitle}</h1>
                  <p className="mt-1 text-muted-foreground">{t.adminDesc}</p>
                  <div className="mt-6">
                    <AdminPanel />
                  </div>
                </>
              )}
              {activeTab === "top" && (
                <>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold text-foreground">{t.topStartups}</h1>
                    <span className="rounded-full bg-gold/15 border border-gold/30 px-2.5 py-0.5 text-xs font-semibold text-gold-foreground">TOP</span>
                  </div>
                  <p className="text-muted-foreground">85+ ball olgan loyihalar</p>
                  <div className="mt-6">
                    <HokimDashboard />
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
