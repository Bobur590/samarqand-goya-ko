import { useState, useEffect } from "react";
import { ScoreBadge } from "@/components/ScoreBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, SCORE_CRITERIA } from "@/lib/types";
import type { StartupSubmission } from "@/lib/types";
import { Search, Eye, RefreshCw } from "lucide-react";
import { getAllStartups } from "@/lib/startup.functions";
import { useServerFn } from "@tanstack/react-start";
import { StartupDetailDialog } from "@/components/StartupDetailDialog";

export function AdminPanel() {
  const [startups, setStartups] = useState<StartupSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<StartupSubmission | null>(null);

  const fetchFn = useServerFn(getAllStartups);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchFn();
      setStartups(data as StartupSubmission[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = startups.filter((s) => {
    if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== "all" && s.category !== categoryFilter) return false;
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    return true;
  });

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Qidirish..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Kategoriya" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha kategoriyalar</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="pending">Kutilmoqda</SelectItem>
            <SelectItem value="scored">Baholangan</SelectItem>
            <SelectItem value="top">TOP</SelectItem>
            <SelectItem value="rejected">Rad etilgan</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      <div className="text-sm text-muted-foreground mb-3">
        Jami: {filtered.length} ta g'oya
      </div>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground">Yuklanmoqda...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">Hali g'oyalar yo'q</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-foreground truncate">{s.title}</h3>
                  <span className="text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded-full">{s.category}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5 truncate">{s.problem}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.author_name} • {new Date(s.created_at).toLocaleDateString("uz")}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {s.score !== null ? <ScoreBadge score={s.score} size="sm" /> : <span className="text-xs text-muted-foreground">Kutilmoqda</span>}
                <Button variant="ghost" size="icon" onClick={() => setSelected(s)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && <StartupDetailDialog startup={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
