import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

function getScoreInfo(score: number) {
  if (score >= 85) return { label: "TOP", className: "bg-gold/15 text-gold-foreground border-gold/30" };
  if (score >= 70) return { label: "Yaxshi", className: "bg-success/15 text-success border-success/30" };
  if (score >= 50) return { label: "Oddiy", className: "bg-warning/15 text-warning-foreground border-warning/30" };
  return { label: "Reject", className: "bg-reject/15 text-reject border-reject/30" };
}

export function ScoreBadge({ score, size = "md" }: ScoreBadgeProps) {
  const info = getScoreInfo(score);
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5 font-semibold",
  };

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border font-medium", info.className, sizeClasses[size])}>
      <span className="font-bold">{score}</span>
      <span className="opacity-70">/100</span>
      <span className="ml-0.5">• {info.label}</span>
    </span>
  );
}
