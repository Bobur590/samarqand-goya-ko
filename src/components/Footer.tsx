import { Rocket } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t bg-card py-8">
      <div className="mx-auto max-w-6xl px-4 flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-2">
          <Rocket className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Startup → Hokim</span>
        </div>
        <p className="text-xs text-muted-foreground max-w-md">{t.footerDesc}</p>
        <p className="text-xs text-muted-foreground">{t.footerRights}</p>
      </div>
    </footer>
  );
}
