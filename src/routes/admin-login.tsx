import { createFileRoute } from "@tanstack/react-router";
import { AuthScreen } from "@/components/auth-screen";
import { GuestRoute } from "@/components/auth-guards";

export const Route = createFileRoute("/admin-login")({
  component: AdminLoginPage,
  head: () => ({
    meta: [{ title: "Admin Login | Startup → Hokim" }],
  }),
});

function AdminLoginPage() {
  return (
    <GuestRoute>
      <AuthScreen mode="admin-login" />
    </GuestRoute>
  );
}
