import { Link, useLocation } from "@tanstack/react-router";
import { Rocket, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Bosh sahifa" },
    { to: "/submit", label: "G'oya yuborish" },
    { to: "/about", label: "Qanday ishlaydi" },
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
          <Link to="/admin">
            <Button variant="outline" size="sm">Admin</Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="gold" size="sm">Hokimiyat</Button>
          </Link>
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
          <div className="mt-2 flex gap-2">
            <Link to="/admin" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" size="sm" className="w-full">Admin</Button>
            </Link>
            <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
              <Button variant="gold" size="sm" className="w-full">Hokimiyat</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
