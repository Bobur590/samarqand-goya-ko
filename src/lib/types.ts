export type AppRole = "admin" | "user";

export interface StartupSubmission {
  id: string;
  title: string;
  problem: string;
  solution: string;
  budget: string | null;
  category: string;
  author_name: string;
  author_phone: string;
  author_email: string | null;
  pdf_url: string | null;
  score: number | null;
  status: string;
  ai_feedback: AiFeedback | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  founder_name: string | null;
  region: string | null;
  business_model: string | null;
  target_audience: string | null;
  current_stage: string | null;
  team_info: string | null;
  investment_needed: string | null;
  additional_notes: string | null;
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

export interface StartupDocument {
  id: string;
  startup_id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  document_type: string;
  created_at: string;
}

export interface AdminNote {
  id: string;
  startup_id: string;
  admin_username: string;
  note: string;
  created_at: string;
}

export interface AppUser {
  id: string;
  username: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  region: string | null;
  role: AppRole;
  created_at: string;
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

export const STATUSES = [
  "pending",
  "under_review",
  "approved",
  "rejected",
  "needs_revision",
] as const;

export const STAGES = [
  "Idea",
  "MVP",
  "Beta",
  "Growth",
  "Scaling",
] as const;

export const SCORE_CRITERIA = [
  { key: "problem_clarity", label: "Muammo aniqligi", max: 20 },
  { key: "solution_realism", label: "Yechim realistikligi", max: 20 },
  { key: "revenue_model", label: "Pul modeli", max: 15 },
  { key: "scalability", label: "Masshtablash imkoniyati", max: 15 },
  { key: "regional_benefit", label: "Hududga foyda", max: 15 },
  { key: "clarity", label: "Tushunarlilik va soddalik", max: 15 },
] as const;
