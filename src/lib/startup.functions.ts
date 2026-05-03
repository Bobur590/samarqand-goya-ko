import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireAuth } from "@/lib/auth-session";

const submitSchema = z.object({
  title: z.string().min(2).max(200),
  problem: z.string().min(3).max(2000),
  solution: z.string().min(3).max(2000),
  budget: z.string().max(100),
  category: z.string().min(1).max(100),
  author_name: z.string().min(2).max(100),
  author_phone: z.string().min(5).max(20),
  author_email: z.string().max(255),
  pdf_url: z.string().max(1000).optional(),
  user_id: z.string().uuid().optional(),
  founder_name: z.string().max(200).optional(),
  region: z.string().max(100).optional(),
  business_model: z.string().max(2000).optional(),
  target_audience: z.string().max(1000).optional(),
  current_stage: z.string().max(100).optional(),
  team_info: z.string().max(1000).optional(),
  investment_needed: z.string().max(200).optional(),
  additional_notes: z.string().max(2000).optional(),
});

async function assertStartupAccess(startupId: string, userId: string) {
  const { data: startup, error } = await supabaseAdmin
    .from("startups")
    .select("id, user_id")
    .eq("id", startupId)
    .maybeSingle();

  if (error || !startup) {
    throw new Error("Startup not found");
  }

  if (startup.user_id !== userId) {
    throw new Error("Forbidden");
  }
}

export const submitStartup = createServerFn({ method: "POST" })
  .inputValidator((input: z.infer<typeof submitSchema>) => submitSchema.parse(input))
  .handler(async ({ data }) => {
    const sessionUser = await requireAuth("user");

    const { data: startup, error } = await supabaseAdmin
      .from("startups")
      .insert({
        title: data.title,
        problem: data.problem,
        solution: data.solution,
        budget: data.budget || null,
        category: data.category,
        author_name: data.author_name,
        author_phone: data.author_phone,
        author_email: data.author_email || null,
        pdf_url: data.pdf_url || null,
        user_id: sessionUser.userId,
        founder_name: data.founder_name || null,
        region: data.region || null,
        business_model: data.business_model || null,
        target_audience: data.target_audience || null,
        current_stage: data.current_stage || null,
        team_info: data.team_info || null,
        investment_needed: data.investment_needed || null,
        additional_notes: data.additional_notes || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to insert startup: ${error.message}`);
    }

    // Fire-and-forget AI scoring — don't block the user's submit response.
    // The score/status will be updated in the background and visible on refresh.
    void (async () => {
      try {
        const aiResult = await scoreStartupWithAI(data);
        const scores = aiResult.scores as Record<string, number>;
        const totalScore = Object.values(scores).reduce((sum: number, value: number) => sum + value, 0);

        let status = "rejected";
        if (totalScore >= 85) status = "approved";
        else if (totalScore >= 70) status = "under_review";
        else if (totalScore >= 50) status = "pending";

        await supabaseAdmin
          .from("startups")
          .update({ score: totalScore, status, ai_feedback: aiResult })
          .eq("id", startup.id);
      } catch (err) {
        console.error("AI scoring failed:", err);
      }
    })();

    return { success: true as const, id: startup.id };
  });

export const getAllStartups = createServerFn({ method: "GET" }).handler(async () => {
  await requireAuth("admin");

  const { data, error } = await supabaseAdmin
    .from("startups")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch startups: ${error.message}`);
  }

  return data || [];
});

export const getUserStartups = createServerFn({ method: "POST" })
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data }) => {
    const sessionUser = await requireAuth();

    if (sessionUser.role === "user" && sessionUser.userId !== data.userId) {
      throw new Error("Forbidden");
    }

    const targetUserId = sessionUser.role === "admin" ? data.userId : sessionUser.userId;

    const { data: startups, error } = await supabaseAdmin
      .from("startups")
      .select("*")
      .eq("user_id", targetUserId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user startups: ${error.message}`);
    }

    return startups || [];
  });

export const getTopStartups = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("startups")
    .select("*")
    .eq("status", "approved")
    .order("score", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch top startups: ${error.message}`);
  }

  return data || [];
});

export const updateStartupStatus = createServerFn({ method: "POST" })
  .inputValidator((input: { startupId: string; status: string }) => input)
  .handler(async ({ data }) => {
    await requireAuth("admin");

    const { error } = await supabaseAdmin
      .from("startups")
      .update({ status: data.status })
      .eq("id", data.startupId);

    if (error) {
      throw new Error(`Failed to update status: ${error.message}`);
    }

    return { success: true as const };
  });

export const addAdminNote = createServerFn({ method: "POST" })
  .inputValidator((input: { startupId: string; note: string; adminUsername: string }) => input)
  .handler(async ({ data }) => {
    const sessionUser = await requireAuth("admin");

    const { error } = await supabaseAdmin.from("admin_notes").insert({
      startup_id: data.startupId,
      note: data.note,
      admin_username: sessionUser.username,
    });

    if (error) {
      throw new Error(`Failed to add note: ${error.message}`);
    }

    return { success: true as const };
  });

export const getAdminNotes = createServerFn({ method: "POST" })
  .inputValidator((input: { startupId: string }) => input)
  .handler(async ({ data }) => {
    await requireAuth("admin");

    const { data: notes, error } = await supabaseAdmin
      .from("admin_notes")
      .select("*")
      .eq("startup_id", data.startupId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch notes: ${error.message}`);
    }

    return notes || [];
  });

export const saveDocument = createServerFn({ method: "POST" })
  .inputValidator((input: { startupId: string; fileName: string; fileUrl: string; fileSize: number; documentType: string }) => input)
  .handler(async ({ data }) => {
    const sessionUser = await requireAuth();

    if (sessionUser.role !== "admin") {
      await assertStartupAccess(data.startupId, sessionUser.userId);
    }

    const { error } = await supabaseAdmin.from("startup_documents").insert({
      startup_id: data.startupId,
      file_name: data.fileName,
      file_url: data.fileUrl,
      file_size: data.fileSize,
      document_type: data.documentType,
      file_type: "pdf",
    });

    if (error) {
      throw new Error(`Failed to save document: ${error.message}`);
    }

    return { success: true as const };
  });

export const getStartupDocuments = createServerFn({ method: "POST" })
  .inputValidator((input: { startupId: string }) => input)
  .handler(async ({ data }) => {
    const sessionUser = await requireAuth();

    if (sessionUser.role !== "admin") {
      await assertStartupAccess(data.startupId, sessionUser.userId);
    }

    const { data: docs, error } = await supabaseAdmin
      .from("startup_documents")
      .select("*")
      .eq("startup_id", data.startupId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }

    return docs || [];
  });

export const getDashboardStats = createServerFn({ method: "GET" }).handler(async () => {
  await requireAuth("admin");

  const [startupsRes, usersRes, docsRes] = await Promise.all([
    supabaseAdmin.from("startups").select("status"),
    supabaseAdmin.from("app_users").select("id", { count: "exact", head: true }).eq("role", "user"),
    supabaseAdmin.from("startup_documents").select("id", { count: "exact", head: true }),
  ]);

  const all = startupsRes.data || [];

  return {
    totalUsers: usersRes.count || 0,
    totalStartups: all.length,
    pending: all.filter((startup) => startup.status === "pending").length,
    underReview: all.filter((startup) => startup.status === "under_review").length,
    approved: all.filter((startup) => startup.status === "approved").length,
    rejected: all.filter((startup) => startup.status === "rejected").length,
    needsRevision: all.filter((startup) => startup.status === "needs_revision").length,
    totalDocuments: docsRes.count || 0,
  };
});

async function scoreStartupWithAI(input: { title: string; problem: string; solution: string; budget: string; category: string }) {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;

  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY not configured");
  }

  const prompt = `Sen startup evaluator sifatida ishlaysan. Quyidagi startup g'oyasini baholab ber.

Startup: ${input.title}
Kategoriya: ${input.category}
Muammo: ${input.problem}
Yechim: ${input.solution}
Byudjet: ${input.budget || "Ko'rsatilmagan"}

Kriteriyalar:
1. Muammo aniqligi (problem_clarity) — max 20 ball
2. Yechim realistikligi (solution_realism) — max 20 ball
3. Pul modeli (revenue_model) — max 15 ball
4. Masshtablash imkoniyati (scalability) — max 15 ball
5. Hududga foyda (regional_benefit) — max 15 ball (Samarqand shahri uchun)
6. Tushunarlilik va soddalik (clarity) — max 15 ball`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-lite",
      messages: [
        {
          role: "system",
          content: "Sen startup baholovchi AI sifatida ishlaysan. Samarqand shahri kontekstida baholab, natijani structured formatda ber.",
        },
        { role: "user", content: prompt },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "score_startup",
            description: "Startup g'oyasini baholash natijalari",
            parameters: {
              type: "object",
              properties: {
                summary: { type: "string", description: "G'oyaning 1-2 gaplik qisqa tavsifi" },
                scores: {
                  type: "object",
                  properties: {
                    problem_clarity: { type: "number" },
                    solution_realism: { type: "number" },
                    revenue_model: { type: "number" },
                    scalability: { type: "number" },
                    regional_benefit: { type: "number" },
                    clarity: { type: "number" },
                  },
                  required: [
                    "problem_clarity",
                    "solution_realism",
                    "revenue_model",
                    "scalability",
                    "regional_benefit",
                    "clarity",
                  ],
                },
                explanations: {
                  type: "object",
                  properties: {
                    problem_clarity: { type: "string" },
                    solution_realism: { type: "string" },
                    revenue_model: { type: "string" },
                    scalability: { type: "string" },
                    regional_benefit: { type: "string" },
                    clarity: { type: "string" },
                  },
                  required: [
                    "problem_clarity",
                    "solution_realism",
                    "revenue_model",
                    "scalability",
                    "regional_benefit",
                    "clarity",
                  ],
                },
                strengths: { type: "array", items: { type: "string" } },
                weaknesses: { type: "array", items: { type: "string" } },
                verdict: { type: "string" },
              },
              required: ["summary", "scores", "explanations", "strengths", "weaknesses", "verdict"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "score_startup" } },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("AI gateway error:", response.status, text);
    throw new Error(`AI scoring failed: ${response.status}`);
  }

  const result = await response.json();
  const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];

  if (!toolCall) {
    throw new Error("No tool call in AI response");
  }

  const parsed = JSON.parse(toolCall.function.arguments);
  const totalScore = Object.values(parsed.scores as Record<string, number>).reduce((sum, value) => sum + value, 0);

  return { ...parsed, total_score: totalScore };
}
