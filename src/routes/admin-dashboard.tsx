import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getSessionFn, getAllUsersFn } from "@/lib/auth.functions";
import { getAllStartups, updateStartupStatus, addAdminNote, getAdminNotes, getDashboardStats } from "@/lib/startup.functions";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { useI18n, getStatusLabel } from "@/lib/i18n";
import { CATEGORIES, STATUSES } from "@/lib/types";
import type { StartupSubmission, AppUser, AdminNote } from "@/lib/types";
import { toast } from "sonner";
import { ScoreBadge } from "@/components/ScoreBadge";
import {
  LayoutDashboard, List, Users, Loader2, Search, RefreshCw, Eye,
  FileText, MessageSquare, CheckCircle, XCircle, Clock, FileUp, Send,
} from "lucide-react";

export const Route = createFileRoute("/admin-dashboard")({
  component: AdminDashboardPage,
  head: () => ({ meta: [{ title: "Admin Dashboard | Startup → Hokim" }] }),
});

type Tab = "dashboard" | "startups" | "users";

function AdminDashboardPage() {
  const { t } = useI18n();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [session, setSession] = useState<{ username: string } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const getSession = useServerFn(getSessionFn);

  useEffect(() => {
    getSession().then((s) => {
      if (!s.authenticated || s.role !== "admin") { window.location.href = "/login"; }
      else { setSession({ username: s.username! }); setAuthorized(true); }
    }).catch(() => { window.location.href = "/login"; });
  }, []);

  if (!authorized || !session) {
    return (<div className="flex min-h-screen flex-col"><Navbar /><main className="flex-1 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></main><Footer /></div>);
  }

  const tabs = [
    { key: "dashboard" as const, label: t.dashboardTab, icon: LayoutDashboard },
    { key: "startups" as const, label: t.allStartups, icon: List },
    { key: "users" as const, label: t.usersTab, icon: Users },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <aside className="hidden md:flex w-56 flex-col border-r bg-sidebar">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-sidebar-primary" />
              <span className="font-bold text-sidebar-foreground text-sm">{t.adminDashboard}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{session.username}</p>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeTab === tab.key ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground hover:bg-sidebar-accent/50"}`}>
                <tab.icon className="h-4 w-4" />{tab.label}
              </button>
            ))}
          </nav>
        </aside>
        <main className="flex-1 flex flex-col">
          <div className="md:hidden flex border-b bg-card">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium border-b-2 transition-colors ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
                <tab.icon className="h-3.5 w-3.5" />{tab.label}
              </button>
            ))}
          </div>
          <div className="flex-1 py-6 md:py-8">
            <div className="mx-auto max-w-6xl px-4 md:px-6">
              {activeTab === "dashboard" && <AdminDashboardTab />}
              {activeTab === "startups" && <StartupsTab adminUsername={session.username} />}
              {activeTab === "users" && <UsersTab />}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

function AdminDashboardTab() {
  const { t } = useI18n();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const fetchStats = useServerFn(getDashboardStats);

  useEffect(() => { fetchStats().then((s) => { setStats(s); setLoading(false); }).catch(() => setLoading(false)); }, []);

  if (loading) return <div className="py-20 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>;
  if (!stats) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">{t.adminDashboard}</h1>
      <p className="text-muted-foreground mt-1">{t.adminDesc}</p>
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6 mt-6">
        <SC label={t.totalUsers} value={stats.totalUsers} icon={Users} />
        <SC label={t.totalStartups} value={stats.totalStartups} icon={List} />
        <SC label={t.pendingReviews} value={stats.pending + stats.underReview} icon={Clock} color="text-warning" />
        <SC label={t.approvedStartups} value={stats.approved} icon={CheckCircle} color="text-success" />
        <SC label={t.rejectedStartups} value={stats.rejected} icon={XCircle} color="text-reject" />
        <SC label={t.uploadedDocs} value={stats.totalDocuments} icon={FileUp} />
      </div>
    </div>
  );
}

function SC({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-1"><Icon className={`h-4 w-4 ${color || ""}`} /><span className="text-xs">{label}</span></div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}

function StartupsTab({ adminUsername }: { adminUsername: string }) {
  const { t } = useI18n();
  const [startups, setStartups] = useState<StartupSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<StartupSubmission | null>(null);
  const fetchFn = useServerFn(getAllStartups);

  const load = () => { setLoading(true); fetchFn().then((d) => { setStartups(d as StartupSubmission[]); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const filtered = startups.filter((s) => {
    if (search && !s.title.toLowerCase().includes(search.toLowerCase()) && !s.author_name.toLowerCase().includes(search.toLowerCase())) return false;
    if (catFilter !== "all" && s.category !== catFilter) return false;
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    return true;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">{t.allStartups}</h1>
      <div className="flex flex-wrap gap-3 mt-4 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t.search} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.allCategories}</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.allStatuses}</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{getStatusLabel(s, t)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{t.total}: {filtered.length} {t.ideas}</p>

      {loading ? <div className="py-20 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div> : filtered.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">{t.noIdeas}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-foreground truncate">{s.title}</h3>
                  <SBadge status={s.status} />
                  {s.pdf_url && <a href={s.pdf_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline" onClick={(e) => e.stopPropagation()}>📄 PDF</a>}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5 truncate">{s.problem}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.author_name} • {s.category} • {new Date(s.created_at).toLocaleDateString("uz")}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {s.score !== null && <ScoreBadge score={s.score} size="sm" />}
                <Button variant="ghost" size="icon" onClick={() => setSelected(s)}><Eye className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
      {selected && <AdminDetailDialog startup={selected} adminUsername={adminUsername} onClose={() => { setSelected(null); load(); }} />}
    </div>
  );
}

function AdminDetailDialog({ startup, adminUsername, onClose }: { startup: StartupSubmission; adminUsername: string; onClose: () => void }) {
  const { t } = useI18n();
  const [status, setStatus] = useState(startup.status);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [saving, setSaving] = useState(false);

  const updateStatus = useServerFn(updateStartupStatus);
  const addNote = useServerFn(addAdminNote);
  const fetchNotes = useServerFn(getAdminNotes);

  useEffect(() => { fetchNotes({ data: { startupId: startup.id } }).then((n) => setNotes(n as AdminNote[])).catch(() => {}); }, []);

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    try { await updateStatus({ data: { startupId: startup.id, status: newStatus } }); toast.success("Status yangilandi"); } catch { toast.error("Xatolik"); }
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    setSaving(true);
    try {
      await addNote({ data: { startupId: startup.id, note, adminUsername } });
      setNotes((prev) => [{ id: Date.now().toString(), startup_id: startup.id, admin_username: adminUsername, note, created_at: new Date().toISOString() }, ...prev]);
      setNote("");
      toast.success("Izoh qo'shildi");
    } catch { toast.error("Xatolik"); }
    finally { setSaving(false); }
  };

  const fb = startup.ai_feedback;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{startup.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <div><span className="text-muted-foreground">{t.fullName}:</span> <strong>{startup.author_name}</strong></div>
            <div><span className="text-muted-foreground">{t.phone}:</span> <strong>{startup.author_phone}</strong></div>
            <div><span className="text-muted-foreground">{t.category}:</span> <strong>{startup.category}</strong></div>
            <div><span className="text-muted-foreground">{t.submissionDate}:</span> <strong>{new Date(startup.created_at).toLocaleDateString("uz")}</strong></div>
            {startup.region && <div><span className="text-muted-foreground">{t.regionField}:</span> <strong>{startup.region}</strong></div>}
            {startup.founder_name && <div><span className="text-muted-foreground">{t.founderName}:</span> <strong>{startup.founder_name}</strong></div>}
          </div>

          {startup.pdf_url && (
            <a href={startup.pdf_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> {t.viewPdf}</Button>
            </a>
          )}

          {startup.score !== null && <ScoreBadge score={startup.score} size="lg" />}

          <div>
            <h4 className="text-sm font-semibold mb-1">{t.problemLabel}</h4>
            <p className="text-sm text-muted-foreground">{startup.problem}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1">{t.solutionLabel}</h4>
            <p className="text-sm text-muted-foreground">{startup.solution}</p>
          </div>
          {startup.business_model && <div><h4 className="text-sm font-semibold mb-1">{t.businessModel}</h4><p className="text-sm text-muted-foreground">{startup.business_model}</p></div>}
          {startup.team_info && <div><h4 className="text-sm font-semibold mb-1">{t.teamInfo}</h4><p className="text-sm text-muted-foreground">{startup.team_info}</p></div>}

          {fb && (
            <div className="rounded-lg bg-accent p-3">
              <h4 className="text-sm font-semibold mb-1">AI: {fb.summary}</h4>
              <p className="text-sm text-muted-foreground">{fb.verdict}</p>
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-2">{t.changeStatus}</h4>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{getStatusLabel(s, t)}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-2">{t.adminNotes}</h4>
            <div className="flex gap-2 mb-3">
              <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.noteText} className="flex-1" />
              <Button onClick={handleAddNote} disabled={saving} size="sm" className="self-end"><Send className="h-4 w-4" /></Button>
            </div>
            {notes.length === 0 ? <p className="text-xs text-muted-foreground">{t.noNotes}</p> : (
              <div className="space-y-2">
                {notes.map((n) => (
                  <div key={n.id} className="rounded-lg border bg-accent/50 p-3">
                    <p className="text-sm">{n.note}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.admin_username} • {new Date(n.created_at).toLocaleString("uz")}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function UsersTab() {
  const { t } = useI18n();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const fetchUsers = useServerFn(getAllUsersFn);

  useEffect(() => { fetchUsers().then((d) => { setUsers(d as AppUser[]); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const filtered = users.filter((u) => {
    if (search && !u.username.toLowerCase().includes(search.toLowerCase()) && !u.full_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">{t.usersTab}</h1>
      <div className="relative mt-4 mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder={t.search} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {loading ? <div className="py-20 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div> : (
        <div className="space-y-3">
          {filtered.map((u) => (
            <div key={u.id} className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{u.full_name}</h3>
                  <span className="text-xs rounded-full bg-accent px-2 py-0.5">{u.role}</span>
                </div>
                <p className="text-sm text-muted-foreground">@{u.username} {u.email ? `• ${u.email}` : ""} {u.phone ? `• ${u.phone}` : ""}</p>
                <p className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString("uz")}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const label = getStatusLabel(status, t);
  const colorMap: Record<string, string> = {
    pending: "bg-warning/15 text-warning-foreground border-warning/30",
    under_review: "bg-primary/15 text-primary border-primary/30",
    approved: "bg-success/15 text-success border-success/30",
    rejected: "bg-reject/15 text-reject border-reject/30",
    needs_revision: "bg-gold/15 text-gold-foreground border-gold/30",
  };
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${colorMap[status] || "bg-muted text-muted-foreground"}`}>{label}</span>;
}
