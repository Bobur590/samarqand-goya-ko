import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SubmitForm } from "@/components/SubmitForm";
import { getSessionFn } from "@/lib/auth.functions";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/submit")({
  component: SubmitPage,
  head: () => ({
    meta: [
      { title: "G'oya yuborish | Startup → Hokim" },
      { name: "description", content: "Startup g'oyangizni yuboring va AI baholash tizimidan o'ting." },
    ],
  }),
});

function SubmitPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    getSessionFn().then((s) => {
      if (!s.authenticated) {
        window.location.href = "/login";
      } else {
        setAuthorized(true);
      }
    }).catch(() => {
      window.location.href = "/login";
    });
  }, []);

  if (authorized === null) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Tekshirilmoqda...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-10 md:py-14">
        <div className="mx-auto max-w-2xl px-4">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Startup g'oyangizni yuboring</h1>
            <p className="mt-2 text-muted-foreground">
              Barcha maydonlarni to'ldiring. AI tizim g'oyangizni 6 ta kriteriya bo'yicha baholaydi.
            </p>
          </div>
          <SubmitForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
