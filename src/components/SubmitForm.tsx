import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES } from "@/lib/types";
import { Loader2, CheckCircle2, Send } from "lucide-react";
import { toast } from "sonner";
import { submitStartup } from "@/lib/startup.functions";
import { useServerFn } from "@tanstack/react-start";

export function SubmitForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.problem || !form.solution || !form.category || !form.author_name || !form.author_phone) {
      toast.error("Barcha majburiy maydonlarni to'ldiring");
      return;
    }
    setLoading(true);
    try {
      await submitFn({ data: form });
      setSuccess(true);
      toast.success("G'oyangiz muvaffaqiyatli yuborildi!");
    } catch (err) {
      toast.error("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
        <h2 className="mt-4 text-xl font-bold text-foreground">G'oyangiz qabul qilindi!</h2>
        <p className="mt-2 text-muted-foreground">
          AI tizim g'oyangizni baholaydi va natijani tez orada ko'rasiz.
        </p>
        <Button className="mt-6" onClick={() => { setSuccess(false); setForm({ title: "", problem: "", solution: "", budget: "", category: "", author_name: "", author_phone: "", author_email: "" }); }}>
          Yana g'oya yuborish
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h3 className="font-semibold text-foreground">G'oya haqida</h3>

        <div>
          <Label htmlFor="title">Startup nomi *</Label>
          <Input id="title" placeholder="Masalan: AgriConnect" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="mt-1" />
        </div>

        <div>
          <Label htmlFor="category">Kategoriya *</Label>
          <Select value={form.category} onValueChange={(v) => setForm({...form, category: v})}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Tanlang" /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="problem">Muammo nima? *</Label>
          <Textarea id="problem" placeholder="Qanday muammoni hal qilasiz? Kimlar uchun?" rows={3} value={form.problem} onChange={(e) => setForm({...form, problem: e.target.value})} className="mt-1" />
        </div>

        <div>
          <Label htmlFor="solution">Yechimingiz nima? *</Label>
          <Textarea id="solution" placeholder="Muammoni qanday hal qilasiz? Texnologiya, usul..." rows={3} value={form.solution} onChange={(e) => setForm({...form, solution: e.target.value})} className="mt-1" />
        </div>

        <div>
          <Label htmlFor="budget">Kerakli byudjet (so'm)</Label>
          <Input id="budget" placeholder="Masalan: 50,000,000" value={form.budget} onChange={(e) => setForm({...form, budget: e.target.value})} className="mt-1" />
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h3 className="font-semibold text-foreground">Aloqa ma'lumotlari</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="author_name">Ismingiz *</Label>
            <Input id="author_name" placeholder="To'liq ism" value={form.author_name} onChange={(e) => setForm({...form, author_name: e.target.value})} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="author_phone">Telefon raqam *</Label>
            <Input id="author_phone" placeholder="+998 90 123 45 67" value={form.author_phone} onChange={(e) => setForm({...form, author_phone: e.target.value})} className="mt-1" />
          </div>
        </div>
        <div>
          <Label htmlFor="author_email">Email (ixtiyoriy)</Label>
          <Input id="author_email" type="email" placeholder="email@example.com" value={form.author_email} onChange={(e) => setForm({...form, author_email: e.target.value})} className="mt-1" />
        </div>
      </div>

      <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> AI baholash jarayonida...</> : <><Send className="h-4 w-4" /> G'oyani yuborish</>}
      </Button>
    </form>
  );
}
