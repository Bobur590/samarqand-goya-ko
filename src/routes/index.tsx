import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Rocket, Target, Brain, Trophy, ArrowRight, Shield, BarChart3 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Startup → Hokim | Samarqand innovatsion platforma" },
      { name: "description", content: "Samarqand shahri uchun startup g'oyalarini baholash platformasi." },
    ],
  }),
});

function Index() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <StatsSection />
      </main>
      <Footer />
    </div>
  );
}

function HeroSection() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden border-b bg-card">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.30_0.08_255/0.06),transparent_50%)]" />
      <div className="mx-auto max-w-6xl px-4 py-20 md:py-28 relative">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-accent/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Rocket className="h-3 w-3" />
            {t.heroTag}
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl leading-[1.1]">
            {t.heroTitle1}
            <br />
            <span className="text-primary">{t.heroTitle2}</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-lg leading-relaxed">{t.heroDesc}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/login">
              <Button variant="hero" size="xl">
                {t.heroSubmit} <ArrowRight className="h-5 w-5 ml-1" />
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" size="lg">{t.heroHow}</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const { t } = useI18n();
  const steps = [
    { icon: Rocket, title: t.step1Title, desc: t.step1Desc },
    { icon: Brain, title: t.step2Title, desc: t.step2Desc },
    { icon: Target, title: t.step3Title, desc: t.step3Desc },
    { icon: Trophy, title: t.step4Title, desc: t.step4Desc },
  ];

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-2xl font-bold text-center text-foreground md:text-3xl">{t.heroHow}</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={i} className="group relative rounded-xl border bg-card p-6 transition-all hover:shadow-md hover:border-primary/20">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <step.icon className="h-5 w-5" />
              </div>
              <div className="absolute top-4 right-4 text-4xl font-black text-muted/40">{i + 1}</div>
              <h3 className="font-semibold text-foreground">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const { t } = useI18n();
  const stats = [
    { icon: Shield, value: "100%", label: t.stat1 },
    { icon: Brain, value: "AI", label: t.stat2 },
    { icon: BarChart3, value: "6", label: t.stat3 },
  ];

  return (
    <section className="border-t bg-card py-14">
      <div className="mx-auto max-w-4xl px-4 grid grid-cols-3 gap-6 text-center">
        {stats.map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <s.icon className="h-6 w-6 text-primary" />
            <div className="text-2xl font-bold text-foreground md:text-3xl">{s.value}</div>
            <div className="text-xs text-muted-foreground md:text-sm">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
