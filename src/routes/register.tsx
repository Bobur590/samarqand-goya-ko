import { createFileRoute } from "@tanstack/react-router";
import { AuthScreen } from "@/components/auth-screen";
import { GuestRoute } from "@/components/auth-guards";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({
    meta: [{ title: "Ro'yxatdan o'tish | Startup → Hokim" }],
  }),
});

function RegisterPage() {
  return (
    <GuestRoute>
      <AuthScreen mode="register" />
    </GuestRoute>
  );
}
