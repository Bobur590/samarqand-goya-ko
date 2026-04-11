import { useState, useEffect } from "react";
import { ScoreBadge } from "@/components/ScoreBadge";
import { StartupSubmission, SCORE_CRITERIA } from "@/lib/types";
import { Trophy, TrendingUp } from "lucide-react";
import { getTopStartups } from "@/lib/startup.functions";
import { useServerFn } from "@tanstack/react-start";
import { StartupDetailDialog } from "@/components/StartupDetailDialog";

export function HokimDashboard() {
  const [startups, setStartups] = useState<StartupSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<StartupSubmission | null>(null);

  const fetchFn = useServerFn(getTopStartups);

  useEffect(() => {
    fetchFn().then((data) => {
      setStartups(data as StartupSubmission[]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-20 text-center text-muted-foreground">Yuklanmoqda...</div>;
  if (startups.length === 0) {
    return (
      <div className="py-20 text-center">
        <Trophy className="mx-auto h-12 w-12 text-muted-foreground/30" />
        <p className="mt-4 text-muted-foreground">Hozircha TOP loyihalar yo'q</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3 mb-6">
        <StatCard label="TOP loyihalar" value={startups.length} icon={Trophy} />
        <StatCard label="O'rtacha ball" value={Math.round(startups.reduce((sum, s) => sum + (s.score || 0), 0) / startups.length)} icon={TrendingUp} />
        <StatCard label="Kategoriyalar" value={new Set(startups.map((s) => s.category)).size} icon={TrendingUp} />
      </div>

      <div className="space-y-3">
        {startups.map((s, i) => (
          <div
            key={s.id}
            onClick={() => setSelected(s)}
            className="flex items-center gap-4 rounded-xl border-2 border-gold/20 bg-card p-5 cursor-pointer hover:shadow-md hover:border-gold/40 transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-gold-foreground font-bold text-lg shrink-0">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">{s.title}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{s.ai_feedback?.summary || s.problem}</p>
              <span className="text-xs text-muted-foreground">{s.category} • {s.author_name}</span>
            </div>
            <ScoreBadge score={s.score!} size="md" />
          </div>
        ))}
      </div>

      {selected && <StartupDetailDialog startup={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}
