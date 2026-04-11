import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HokimDashboard } from "@/components/HokimDashboard";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Hokimiyat Dashboard | Startup → Hokim" },
    ],
  }),
});

function DashboardPage() {
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
