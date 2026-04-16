import { Link, useLocation } from "@tanstack/react-router";
import { Rocket, Menu, X, LogIn, LogOut, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, lang, setLang } = useI18n();
  const { isAuthenticated, role, username, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.assign("/");
  };

  const toggleLang = () => setLang(lang === "uz" ? "ru" : "uz");

  const navLinks = [
    { to: "/" as const, label: t.home },
    { to: "/about" as const, label: t.howItWorks },
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
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${location.pathname === link.to ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggleLang} className="gap-1">
            <Globe className="h-4 w-4" />
            {lang === "uz" ? "RU" : "UZ"}
          </Button>
          {isAuthenticated ? (
            <>
              <span className="text-xs text-muted-foreground mr-1">{username}</span>
              {role === "admin" && (
                <Link to="/admin-dashboard"><Button variant="outline" size="sm">{t.adminPanel}</Button></Link>
              )}
              {role === "user" && (
                <Link to="/user-dashboard"><Button variant="outline" size="sm">{t.userDashboard}</Button></Link>
              )}
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" /> {t.logout}
              </Button>
            </>
          ) : (
            <Link to="/login"><Button variant="default" size="sm"><LogIn className="h-4 w-4 mr-1" /> {t.login}</Button></Link>
          )}
        </div>

        <button className="md:hidden p-2 text-muted-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t bg-card px-4 py-3 md:hidden">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2">
            <Button variant="ghost" size="sm" onClick={toggleLang} className="w-full justify-start gap-2">
              <Globe className="h-4 w-4" />{lang === "uz" ? "Русский" : "O'zbekcha"}
            </Button>
            {isAuthenticated ? (
              <>
                <span className="text-xs text-muted-foreground px-3">{username}</span>
                {role === "admin" && (
                  <Link to="/admin-dashboard" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">{t.adminPanel}</Button>
                  </Link>
                )}
                {role === "user" && (
                  <Link to="/user-dashboard" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">{t.userDashboard}</Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" className="w-full" onClick={() => { void handleLogout(); setMobileOpen(false); }}>
                  <LogOut className="h-4 w-4 mr-1" /> {t.logout}
                </Button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="default" size="sm" className="w-full"><LogIn className="h-4 w-4 mr-1" /> {t.login}</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
