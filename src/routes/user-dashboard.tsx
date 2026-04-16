import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { UserRoute } from "@/components/auth-guards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUserProfileFn, updateProfileFn } from "@/lib/auth.functions";
import { submitStartup, getUserStartups } from "@/lib/startup.functions";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { useI18n, getStatusLabel } from "@/lib/i18n";
import { CATEGORIES, STAGES } from "@/lib/types";
import type { StartupSubmission } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard, Send, FileText, User, Loader2, CheckCircle2,
  FileUp, X, Rocket, Clock, CheckCircle, XCircle, Eye,
} from "lucide-react";
import { ScoreBadge } from "@/components/ScoreBadge";
import { StartupDetailDialog } from "@/components/StartupDetailDialog";

export const Route = createFileRoute("/user-dashboard")({
  component: UserDashboardRoute,
  head: () => ({ meta: [{ title: "Dashboard | Startup → Hokim" }] }),
});

type Tab = "dashboard" | "submit" | "my-startups" | "profile";

function UserDashboardRoute() {
  return (
    <UserRoute>
      <UserDashboardPage />
    </UserRoute>
  );
}

function UserDashboardPage() {
  const { t } = useI18n();
  const { userId, username } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const session = { userId: userId!, username: username! };

  const tabs = [
    { key: "dashboard" as const, label: t.dashboardTab, icon: LayoutDashboard },
    { key: "submit" as const, label: t.submitTab, icon: Send },
    { key: "my-startups" as const, label: t.myStartups, icon: FileText },
    { key: "profile" as const, label: t.profileTab, icon: User },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <aside className="hidden md:flex w-56 flex-col border-r bg-sidebar">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-sidebar-primary" />
              <span className="font-bold text-sidebar-foreground text-sm">{t.userDashboard}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{session.username}</p>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeTab === tab.key ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground hover:bg-sidebar-accent/50"}`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 flex flex-col">
          <div className="md:hidden flex border-b bg-card overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 py-3 text-xs font-medium border-b-2 transition-colors ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-1 py-6 md:py-8">
            <div className="mx-auto max-w-4xl px-4 md:px-6">
              {activeTab === "dashboard" && <DashboardTab session={session} onNavigate={setActiveTab} />}
              {activeTab === "submit" && <SubmitTab session={session} />}
              {activeTab === "my-startups" && <MyStartupsTab session={session} />}
              {activeTab === "profile" && <ProfileTab session={session} />}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

function DashboardTab({ session, onNavigate }: { session: { userId: string; username: string }; onNavigate: (t: Tab) => void }) {
  const { t } = useI18n();
  const [startups, setStartups] = useState<StartupSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchFn = useServerFn(getUserStartups);

  useEffect(() => {
    fetchFn({ data: { userId: session.userId } }).then((data) => { setStartups(data as StartupSubmission[]); setLoading(false); }).catch(() => setLoading(false));
  }, [fetchFn, session.userId]);

  const pending = startups.filter((startup) => startup.status === "pending" || startup.status === "under_review").length;
  const approved = startups.filter((startup) => startup.status === "approved").length;
  const rejected = startups.filter((startup) => startup.status === "rejected").length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">{t.welcome}, {session.username}!</h1>
      <p className="text-muted-foreground mt-1">{t.userDashboardDesc}</p>

      {loading ? (
        <div className="py-10 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-4 mt-6">
            <StatCard label={t.totalSubmitted} value={startups.length} icon={FileText} />
            <StatCard label={t.pendingReview} value={pending} icon={Clock} color="text-warning" />
            <StatCard label={t.approvedCount} value={approved} icon={CheckCircle} color="text-success" />
            <StatCard label={t.rejectedCount} value={rejected} icon={XCircle} color="text-reject" />
          </div>
          <Button className="mt-6" onClick={() => onNavigate("submit")}>
            <Send className="h-4 w-4 mr-1.5" /> {t.quickSubmit}
          </Button>
        </>
      )}
    </div>
  );
}

function SubmitTab({ session }: { session: { userId: string; username: string } }) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "", problem: "", solution: "", budget: "", category: "",
    author_name: "", author_phone: "", author_email: "",
    founder_name: "", region: "", business_model: "", target_audience: "",
    current_stage: "", team_info: "", investment_needed: "", additional_notes: "",
  });

  const submitFn = useServerFn(submitStartup);
  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") { toast.error(t.pdfOnly); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error(t.pdfTooLarge); return; }
    setPdfFile(file);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title || !form.problem || !form.solution || !form.category || !form.author_name || !form.author_phone) {
      toast.error(t.fillRequired); return;
    }
    setLoading(true);
    try {
      let pdfUrl: string | null = null;
      if (pdfFile) {
        const fileName = `${Date.now()}_${pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { error: uploadError } = await supabase.storage.from("startup-pdfs").upload(fileName, pdfFile, { contentType: "application/pdf" });
        if (uploadError) { toast.error(t.uploadError); setLoading(false); return; }
        const { data: urlData } = supabase.storage.from("startup-pdfs").getPublicUrl(fileName);
        pdfUrl = urlData.publicUrl;
      }
      await submitFn({ data: { ...form, pdf_url: pdfUrl || "", user_id: session.userId } });
      setSuccess(true);
      toast.success(t.ideaSubmitted);
    } catch {
      toast.error(t.submitError);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
        <h2 className="mt-4 text-xl font-bold text-foreground">{t.submitSuccess}</h2>
        <p className="mt-2 text-muted-foreground">{t.submitSuccessDesc}</p>
        <Button className="mt-6" onClick={() => { setSuccess(false); setPdfFile(null); setForm({ title: "", problem: "", solution: "", budget: "", category: "", author_name: "", author_phone: "", author_email: "", founder_name: "", region: "", business_model: "", target_audience: "", current_stage: "", team_info: "", investment_needed: "", additional_notes: "" }); }}>
          {t.submitAnother}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">{t.userDashboardTitle}</h1>
      <p className="text-muted-foreground mt-1">{t.userDashboardDesc}</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h3 className="font-semibold text-foreground">{t.aboutIdea}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>{t.startupName} *</Label>
              <Input value={form.title} onChange={(event) => set("title", event.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>{t.category} *</Label>
              <Select value={form.category} onValueChange={(value) => set("category", value)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t.selectCategory} /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>{t.problemLabel} *</Label>
            <Textarea rows={3} value={form.problem} onChange={(event) => set("problem", event.target.value)} placeholder={t.problemPlaceholder} className="mt-1" />
          </div>
          <div>
            <Label>{t.solutionLabel} *</Label>
            <Textarea rows={3} value={form.solution} onChange={(event) => set("solution", event.target.value)} placeholder={t.solutionPlaceholder} className="mt-1" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>{t.businessModel}</Label>
              <Textarea rows={2} value={form.business_model} onChange={(event) => set("business_model", event.target.value)} placeholder={t.businessModelPlaceholder} className="mt-1" />
            </div>
            <div>
              <Label>{t.targetAudience}</Label>
              <Input value={form.target_audience} onChange={(event) => set("target_audience", event.target.value)} placeholder={t.targetAudiencePlaceholder} className="mt-1" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>{t.currentStage}</Label>
              <Select value={form.current_stage} onValueChange={(value) => set("current_stage", value)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t.selectStage} /></SelectTrigger>
                <SelectContent>{STAGES.map((stage) => <SelectItem key={stage} value={stage}>{stage}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t.budget}</Label>
              <Input value={form.budget} onChange={(event) => set("budget", event.target.value)} placeholder={t.budgetPlaceholder} className="mt-1" />
            </div>
            <div>
              <Label>{t.investmentNeeded}</Label>
              <Input value={form.investment_needed} onChange={(event) => set("investment_needed", event.target.value)} placeholder={t.investmentPlaceholder} className="mt-1" />
            </div>
          </div>
          <div>
            <Label>{t.teamInfo}</Label>
            <Textarea rows={2} value={form.team_info} onChange={(event) => set("team_info", event.target.value)} placeholder={t.teamInfoPlaceholder} className="mt-1" />
          </div>
          <div>
            <Label>{t.additionalNotes}</Label>
            <Textarea rows={2} value={form.additional_notes} onChange={(event) => set("additional_notes", event.target.value)} className="mt-1" />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h3 className="font-semibold text-foreground">{t.pdfUpload}</h3>
          <p className="text-sm text-muted-foreground">{t.pdfUploadDesc}</p>
          {pdfFile ? (
            <div className="flex items-center gap-3 rounded-lg border bg-accent/50 px-4 py-3">
              <FileUp className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{pdfFile.name}</p>
                <p className="text-xs text-muted-foreground">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setPdfFile(null)}><X className="h-4 w-4" /></Button>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 px-4 py-6 transition-colors hover:border-primary/50 hover:bg-accent/30">
              <FileUp className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">{t.pdfUpload}</p>
                <p className="text-xs text-muted-foreground">{t.maxFileSize}</p>
              </div>
              <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleFileChange} />
            </label>
          )}
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h3 className="font-semibold text-foreground">{t.contactInfo}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>{t.fullName} *</Label>
              <Input value={form.author_name} onChange={(event) => set("author_name", event.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>{t.founderName}</Label>
              <Input value={form.founder_name} onChange={(event) => set("founder_name", event.target.value)} className="mt-1" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>{t.phone} *</Label>
              <Input value={form.author_phone} onChange={(event) => set("author_phone", event.target.value)} placeholder="+998 90 123 45 67" className="mt-1" />
            </div>
            <div>
              <Label>{t.emailOptional}</Label>
              <Input type="email" value={form.author_email} onChange={(event) => set("author_email", event.target.value)} placeholder="email@example.com" className="mt-1" />
            </div>
          </div>
          <div>
            <Label>{t.regionField}</Label>
            <Input value={form.region} onChange={(event) => set("region", event.target.value)} placeholder="Samarqand" className="mt-1" />
          </div>
        </div>

        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> {t.submitting}</> : <><Send className="h-4 w-4" /> {t.submit}</>}
        </Button>
      </form>
    </div>
  );
}

function MyStartupsTab({ session }: { session: { userId: string; username: string } }) {
  const { t } = useI18n();
  const [startups, setStartups] = useState<StartupSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<StartupSubmission | null>(null);
  const fetchFn = useServerFn(getUserStartups);

  useEffect(() => {
    fetchFn({ data: { userId: session.userId } }).then((data) => { setStartups(data as StartupSubmission[]); setLoading(false); }).catch(() => setLoading(false));
  }, [fetchFn, session.userId]);

  if (loading) return <div className="py-20 text-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;

  if (startups.length === 0) {
    return (
      <div className="py-20 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/30" />
        <p className="mt-4 text-muted-foreground">{t.noSubmissions}</p>
        <p className="text-sm text-muted-foreground">{t.submitFirst}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">{t.myStartups}</h1>
      <p className="text-muted-foreground mt-1">{t.total}: {startups.length}</p>
      <div className="mt-6 space-y-3">
        {startups.map((startup) => (
          <div key={startup.id} className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground truncate">{startup.title}</h3>
                <StatusBadge status={startup.status} />
              </div>
              <p className="text-sm text-muted-foreground mt-0.5 truncate">{startup.problem}</p>
              <p className="text-xs text-muted-foreground mt-1">{startup.category} • {new Date(startup.created_at).toLocaleDateString("uz")}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {startup.score !== null && <ScoreBadge score={startup.score} size="sm" />}
              {startup.pdf_url && (
                <a href={startup.pdf_url} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()}>
                  <Button variant="ghost" size="icon"><FileText className="h-4 w-4" /></Button>
                </a>
              )}
              <Button variant="ghost" size="icon" onClick={() => setSelected(startup)}><Eye className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>
      {selected && <StartupDetailDialog startup={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function ProfileTab({ session }: { session: { userId: string; username: string } }) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", region: "" });

  const getProfile = useServerFn(getUserProfileFn);
  const updateProfile = useServerFn(updateProfileFn);

  useEffect(() => {
    getProfile({ data: { userId: session.userId } }).then((profile) => {
      if (profile) {
        setForm({ full_name: profile.full_name, phone: profile.phone || "", email: profile.email || "", region: profile.region || "" });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [getProfile, session.userId]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ data: { userId: session.userId, ...form, phone: form.phone || undefined, email: form.email || undefined, region: form.region || undefined } });
      toast.success(t.profileSaved);
    } catch {
      toast.error(t.loginErrorGeneric);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">{t.profileTab}</h1>
      <form onSubmit={handleSave} className="mt-6 rounded-xl border bg-card p-6 space-y-4 max-w-lg">
        <div>
          <Label>{t.username}</Label>
          <Input value={session.username} disabled className="mt-1" />
        </div>
        <div>
          <Label>{t.fullName}</Label>
          <Input value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} className="mt-1" />
        </div>
        <div>
          <Label>{t.phone}</Label>
          <Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="mt-1" />
        </div>
        <div>
          <Label>{t.email}</Label>
          <Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-1" />
        </div>
        <div>
          <Label>{t.regionField}</Label>
          <Input value={form.region} onChange={(event) => setForm({ ...form, region: event.target.value })} className="mt-1" />
        </div>
        <Button type="submit" disabled={saving}>{saving ? t.saving : t.saveProfile}</Button>
      </form>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        <Icon className={`h-4 w-4 ${color || ""}`} />
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const label = getStatusLabel(status, t);
  const colorMap: Record<string, string> = {
    pending: "bg-warning/15 text-warning-foreground border-warning/30",
    under_review: "bg-primary/15 text-primary border-primary/30",
    approved: "bg-success/15 text-success border-success/30",
    rejected: "bg-reject/15 text-reject border-reject/30",
    needs_revision: "bg-gold/15 text-gold-foreground border-gold/30",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${colorMap[status] || "bg-muted text-muted-foreground"}`}>
      {label}
    </span>
  );
}
