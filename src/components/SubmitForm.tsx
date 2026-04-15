import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES } from "@/lib/types";
import { Loader2, CheckCircle2, Send, FileUp, X } from "lucide-react";
import { toast } from "sonner";
import { submitStartup } from "@/lib/startup.functions";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

export function SubmitForm() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "",
    problem: "",
    solution: "",
    budget: "",
    category: "",
    author_name: "",
    author_phone: "",
    author_email: "",
  });

  const submitFn = useServerFn(submitStartup);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Faqat PDF fayl yuklash mumkin");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Fayl hajmi 10MB dan oshmasligi kerak");
      return;
    }
    setPdfFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.problem || !form.solution || !form.category || !form.author_name || !form.author_phone) {
      toast.error(t.fillRequired);
      return;
    }
    setLoading(true);
    try {
      let pdfUrl: string | null = null;

      if (pdfFile) {
        const fileName = `${Date.now()}_${pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const { error: uploadError } = await supabase.storage
          .from("startup-pdfs")
          .upload(fileName, pdfFile, { contentType: "application/pdf" });

        if (uploadError) {
          console.error("PDF upload error:", uploadError);
          toast.error("PDF yuklashda xatolik yuz berdi");
          setLoading(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from("startup-pdfs")
          .getPublicUrl(fileName);
        pdfUrl = urlData.publicUrl;
      }

      await submitFn({ data: { ...form, pdf_url: pdfUrl || "" } });
      setSuccess(true);
      toast.success(t.ideaSubmitted);
    } catch (err) {
      console.error("Submit error:", err);
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
        <Button className="mt-6" onClick={() => { setSuccess(false); setPdfFile(null); setForm({ title: "", problem: "", solution: "", budget: "", category: "", author_name: "", author_phone: "", author_email: "" }); }}>
          {t.submitAnother}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h3 className="font-semibold text-foreground">{t.aboutIdea}</h3>

        <div>
          <Label htmlFor="title">{t.startupName} *</Label>
          <Input id="title" placeholder="Masalan: AgriConnect" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="mt-1" />
        </div>

        <div>
          <Label htmlFor="category">{t.category} *</Label>
          <Select value={form.category} onValueChange={(v) => setForm({...form, category: v})}>
            <SelectTrigger className="mt-1"><SelectValue placeholder={t.selectCategory} /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="problem">{t.problemLabel} *</Label>
          <Textarea id="problem" placeholder={t.problemPlaceholder} rows={3} value={form.problem} onChange={(e) => setForm({...form, problem: e.target.value})} className="mt-1" />
        </div>

        <div>
          <Label htmlFor="solution">{t.solutionLabel} *</Label>
          <Textarea id="solution" placeholder={t.solutionPlaceholder} rows={3} value={form.solution} onChange={(e) => setForm({...form, solution: e.target.value})} className="mt-1" />
        </div>

        <div>
          <Label htmlFor="budget">{t.budget}</Label>
          <Input id="budget" placeholder={t.budgetPlaceholder} value={form.budget} onChange={(e) => setForm({...form, budget: e.target.value})} className="mt-1" />
        </div>

        <div>
          <Label>PDF fayl (ixtiyoriy)</Label>
          <div className="mt-1">
            {pdfFile ? (
              <div className="flex items-center gap-3 rounded-lg border bg-accent/50 px-4 py-3">
                <FileUp className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{pdfFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => setPdfFile(null)} className="shrink-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 px-4 py-6 transition-colors hover:border-primary/50 hover:bg-accent/30">
                <FileUp className="h-6 w-6 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">PDF fayl yuklash</p>
                  <p className="text-xs text-muted-foreground">Maksimum 10MB</p>
                </div>
                <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleFileChange} />
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h3 className="font-semibold text-foreground">{t.contactInfo}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="author_name">{t.fullName} *</Label>
            <Input id="author_name" placeholder="To'liq ism" value={form.author_name} onChange={(e) => setForm({...form, author_name: e.target.value})} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="author_phone">{t.phone} *</Label>
            <Input id="author_phone" placeholder="+998 90 123 45 67" value={form.author_phone} onChange={(e) => setForm({...form, author_phone: e.target.value})} className="mt-1" />
          </div>
        </div>
        <div>
          <Label htmlFor="author_email">{t.email}</Label>
          <Input id="author_email" type="email" placeholder="email@example.com" value={form.author_email} onChange={(e) => setForm({...form, author_email: e.target.value})} className="mt-1" />
        </div>
      </div>

      <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> {t.submitting}</> : <><Send className="h-4 w-4" /> {t.submit}</>}
      </Button>
    </form>
  );
}
