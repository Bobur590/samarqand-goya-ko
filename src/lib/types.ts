export interface StartupSubmission {
  id: string;
  title: string;
  problem: string;
  solution: string;
  budget: string;
  category: string;
  author_name: string;
  author_phone: string;
  author_email: string | null;
  pdf_url: string | null;
  score: number | null;
  status: "pending" | "scored" | "rejected" | "approved" | "top";
  ai_feedback: AiFeedback | null;
  created_at: string;
  updated_at: string;
}

export interface AiFeedback {
  summary: string;
  scores: {
    problem_clarity: number;
    solution_realism: number;
    revenue_model: number;
    scalability: number;
    regional_benefit: number;
    clarity: number;
  };
  explanations: {
    problem_clarity: string;
    solution_realism: string;
    revenue_model: string;
    scalability: string;
    regional_benefit: string;
    clarity: string;
  };
  strengths: string[];
  weaknesses: string[];
  verdict: string;
  total_score: number;
}

export const CATEGORIES = [
  "IT va Texnologiya",
  "Qishloq xo'jaligi",
  "Ta'lim",
  "Turizm",
  "Sog'liqni saqlash",
  "Transport va logistika",
  "Ishlab chiqarish",
  "Xizmat ko'rsatish",
  "Energetika",
  "Boshqa",
] as const;

export const SCORE_CRITERIA = [
  { key: "problem_clarity", label: "Muammo aniqligi", max: 20 },
  { key: "solution_realism", label: "Yechim realistikligi", max: 20 },
  { key: "revenue_model", label: "Pul modeli", max: 15 },
  { key: "scalability", label: "Masshtablash imkoniyati", max: 15 },
  { key: "regional_benefit", label: "Hududga foyda", max: 15 },
  { key: "clarity", label: "Tushunarlilik va soddalik", max: 15 },
] as const;
