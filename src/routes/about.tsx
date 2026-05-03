import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Brain, Shield, BarChart3, CheckCircle2 } from "lucide-react";
import { SCORE_CRITERIA } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "Qanday ishlaydi | Startup → Hokim" },
      { name: "description", content: "Startup → Hokim platformasi qanday ishlashi, baholash tizimi va kriteriyalar haqida." },
    ],
  }),
});

function AboutPage() {
  const { lang } = useI18n();
  const ru = lang === "ru";
  const tx = {
    title: ru ? "Как работает платформа?" : "Platforma qanday ishlaydi?",
    subtitle: ru
      ? "Startup → Hokim — это система, которая прозрачно и справедливо оценивает идеи."
      : "Startup → Hokim — bu g'oyalarni shaffof va adolatli baholaydigan tizim.",
    aiTitle: ru ? "Система AI-оценки" : "AI Scoring tizimi",
    aiDesc: ru
      ? "Каждая идея оценивается искусственным интеллектом по 6 критериям:"
      : "Har bir g'oya sun'iy intellekt tomonidan 6 ta kriteriya bo'yicha baholanadi:",
    statuses: ru ? "Статусы" : "Statuslar",
    points: ru ? "баллов" : "ball",
    fairness: ru ? "Гарантия справедливости" : "Adolat kafolati",
    items: ru
      ? [
          "Идеи оцениваются только по содержанию",
          "Знакомства не влияют на систему",
          "Объективная оценка с помощью AI",
          "Только ТОП идеи доходят до хокимията",
        ]
      : [
          "G'oyalar faqat mazmuni bo'yicha baholanadi",
          "Tanish-bilish tizimga ta'sir qilmaydi",
          "AI yordamida ob'ektiv baholash",
          "Faqat TOP g'oyalar hokimiyatga chiqadi",
        ],
    criteriaLabels: ru
      ? {
          problem_clarity: "Ясность проблемы",
          solution_realism: "Реалистичность решения",
          revenue_model: "Модель дохода",
          scalability: "Масштабируемость",
          regional_benefit: "Польза для региона",
          clarity: "Понятность и простота",
        }
      : null,
    statusLabels: ru
      ? { TOP: "ТОП", Yaxshi: "Хороший", Oddiy: "Обычный", Reject: "Отклонён" }
      : { TOP: "TOP", Yaxshi: "Yaxshi", Oddiy: "Oddiy", Reject: "Reject" },
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-10 md:py-14">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">{tx.title}</h1>
          <p className="mt-2 text-muted-foreground max-w-xl">{tx.subtitle}</p>

          <div className="mt-10 space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">{tx.aiTitle}</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{tx.aiDesc}</p>
              <div className="space-y-2">
                {SCORE_CRITERIA.map((c) => (
                  <div key={c.key} className="flex items-center justify-between rounded-lg border bg-card p-3">
                    <span className="text-sm font-medium text-foreground">
                      {tx.criteriaLabels ? tx.criteriaLabels[c.key as keyof typeof tx.criteriaLabels] || c.label : c.label}
                    </span>
                    <span className="text-sm font-bold text-primary">{c.max} {tx.points}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">{tx.statuses}</h2>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { range: "85–100", key: "TOP" as const, color: "bg-gold/15 border-gold/30" },
                  { range: "70–84", key: "Yaxshi" as const, color: "bg-success/15 border-success/30" },
                  { range: "50–69", key: "Oddiy" as const, color: "bg-warning/15 border-warning/30" },
                  { range: "0–49", key: "Reject" as const, color: "bg-reject/15 border-reject/30" },
                ].map((s) => (
                  <div key={s.key} className={`rounded-lg border p-3 ${s.color}`}>
                    <span className="font-bold text-foreground">{tx.statusLabels[s.key]}</span>
                    <span className="ml-2 text-sm text-muted-foreground">{s.range} {tx.points}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">{tx.fairness}</h2>
              </div>
              <ul className="space-y-2">
                {tx.items.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
