import type { ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

function AuthLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

export function GuestRoute({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, role } = useAuth();

  if (isLoading) {
    return <AuthLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to={role === "admin" ? "/admin-dashboard" : "/user-dashboard"} replace />;
  }

  return <>{children}</>;
}

export function UserRoute({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, role } = useAuth();

  if (isLoading) {
    return <AuthLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "user") {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return <>{children}</>;
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, role } = useAuth();

  if (isLoading) {
    return <AuthLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  if (role !== "admin") {
    return <Navigate to="/user-dashboard" replace />;
  }

  return <>{children}</>;
}
