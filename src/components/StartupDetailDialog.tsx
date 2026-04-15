import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScoreBadge } from "@/components/ScoreBadge";
import { SCORE_CRITERIA } from "@/lib/types";
import type { StartupSubmission } from "@/lib/types";
import { CheckCircle2, XCircle, FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface Props {
  startup: StartupSubmission;
  onClose: () => void;
}

export function StartupDetailDialog({ startup, onClose }: Props) {
  const fb = startup.ai_feedback;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">{startup.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Kategoriya: {startup.category}</div>
            <div className="text-xs text-muted-foreground">Muallif: {startup.author_name} | {startup.author_phone}</div>
            {startup.pdf_url && (
              <a href={startup.pdf_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> PDF faylni ko'rish
                </Button>
              </a>
            )}
          </div>

          {startup.score !== null && (
            <div className="flex items-center gap-3">
              <ScoreBadge score={startup.score} size="lg" />
            </div>
          )}

          {fb && (
            <>
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">AI xulosasi</h4>
                <p className="text-sm text-muted-foreground">{fb.summary}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Baholash</h4>
                <div className="space-y-2.5">
                  {SCORE_CRITERIA.map((c) => {
                    const scoreKey = c.key as keyof typeof fb.scores;
                    const score = fb.scores[scoreKey];
                    const explanation = fb.explanations[scoreKey];
                    const pct = (score / c.max) * 100;
                    return (
                      <div key={c.key}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-medium text-foreground">{c.label}</span>
                          <span className="text-xs font-bold text-primary">{score}/{c.max}</span>
                        </div>
                        <Progress value={pct} className="h-1.5" />
                        <p className="text-xs text-muted-foreground mt-0.5">{explanation}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Kuchli tomonlari
                  </h4>
                  <ul className="space-y-1">
                    {fb.strengths.map((s, i) => (
                      <li key={i} className="text-xs text-muted-foreground">• {s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5 text-reject" /> Kuchsiz tomonlari
                  </h4>
                  <ul className="space-y-1">
                    {fb.weaknesses.map((w, i) => (
                      <li key={i} className="text-xs text-muted-foreground">• {w}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-lg bg-accent p-3">
                <h4 className="text-sm font-semibold text-foreground mb-0.5">Yakuniy xulosa</h4>
                <p className="text-sm text-muted-foreground">{fb.verdict}</p>
              </div>
            </>
          )}

          {!fb && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-1">Muammo</h4>
              <p className="text-sm text-muted-foreground">{startup.problem}</p>
              <h4 className="text-sm font-semibold text-foreground mt-3 mb-1">Yechim</h4>
              <p className="text-sm text-muted-foreground">{startup.solution}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
