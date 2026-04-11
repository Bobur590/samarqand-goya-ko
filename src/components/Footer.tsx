import { Rocket } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card py-8">
      <div className="mx-auto max-w-6xl px-4 flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-2">
          <Rocket className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Startup → Hokim</span>
        </div>
        <p className="text-xs text-muted-foreground max-w-md">
          Samarqand shahri hokimligi innovatsion g'oyalar platformasi.
          Tanish-bilishsiz ham yaxshi g'oya tepaga chiqadi.
        </p>
        <p className="text-xs text-muted-foreground">© 2026 Startup → Hokim. Barcha huquqlar himoyalangan.</p>
      </div>
    </footer>
  );
}
