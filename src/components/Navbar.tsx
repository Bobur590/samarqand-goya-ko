import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Rocket, Menu, X, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getSessionFn, logoutFn } from "@/lib/auth.functions";
import { useServerFn } from "@tanstack/react-start";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [session, setSession] = useState<{ authenticated: boolean; role: string | null; username: string | null }>({ authenticated: false, role: null, username: null });

  const getSession = useServerFn(getSessionFn);
  const logout = useServerFn(logoutFn);

  useEffect(() => {
    getSession().then(setSession).catch(() => {});
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    setSession({ authenticated: false, role: null, username: null });
    navigate({ to: "/" });
  };

  const navLinks = [
    { to: "/" as const, label: "Bosh sahifa" },
    { to: "/about" as const, label: "Qanday ishlaydi" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Rocket className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base font-bold text-foreground tracking-tight">Startup → Hokim</span>
            <span className="text-[10px] text-muted-foreground">Samarqand shahri</span>
          </div>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {session.authenticated ? (
            <>
              <span className="text-xs text-muted-foreground mr-1">
                {session.username} ({session.role})
              </span>
              {session.role === "admin" && (
                <Link to="/admin">
                  <Button variant="outline" size="sm">Admin Panel</Button>
                </Link>
              )}
              {session.role === "user" && (
                <Link to="/submit">
                  <Button variant="outline" size="sm">G'oya yuborish</Button>
                </Link>
              )}
              {session.role === "admin" && (
                <Link to="/dashboard">
                  <Button variant="gold" size="sm">Hokimiyat</Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" /> Chiqish
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="default" size="sm">
                <LogIn className="h-4 w-4 mr-1" /> Kirish
              </Button>
            </Link>
          )}
        </div>

        <button
          className="md:hidden p-2 text-muted-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t bg-card px-4 py-3 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2">
            {session.authenticated ? (
              <>
                <span className="text-xs text-muted-foreground px-3">
                  {session.username} ({session.role})
                </span>
                {session.role === "admin" && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">Admin Panel</Button>
                  </Link>
                )}
                {session.role === "user" && (
                  <Link to="/submit" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">G'oya yuborish</Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" className="w-full" onClick={() => { handleLogout(); setMobileOpen(false); }}>
                  <LogOut className="h-4 w-4 mr-1" /> Chiqish
                </Button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="default" size="sm" className="w-full">
                  <LogIn className="h-4 w-4 mr-1" /> Kirish
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
