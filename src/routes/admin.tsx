import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdminPanel } from "@/components/AdminPanel";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin Panel | Startup → Hokim" },
    ],
  }),
});

function AdminPage() {
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
