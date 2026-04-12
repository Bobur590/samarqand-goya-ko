import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const submitSchema = z.object({
  title: z.string().min(2).max(200),
  problem: z.string().min(10).max(2000),
  solution: z.string().min(10).max(2000),
  budget: z.string().max(100),
  category: z.string().min(1).max(100),
  author_name: z.string().min(2).max(100),
  author_phone: z.string().min(5).max(20),
  author_email: z.string().max(255),
});

export const submitStartup = createServerFn({ method: "POST" })
  .inputValidator((input: z.infer<typeof submitSchema>) => submitSchema.parse(input))
  .handler(async ({ data }) => {
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
        status: "pending",
      })
      .select()
      .single();

    if (error) throw new Error("Failed to insert startup: " + error.message);

    // AI Scoring
    try {
      const aiResult = await scoreStartupWithAI(data);
      const scores = aiResult.scores as Record<string, number>;
      const totalScore = Object.values(scores).reduce((a: number, b: number) => a + b, 0);
      
      let status = "rejected";
      if (totalScore >= 85) status = "top";
      else if (totalScore >= 70) status = "approved";
      else if (totalScore >= 50) status = "scored";

      await supabaseAdmin
        .from("startups")
        .update({
          score: totalScore,
          status,
          ai_feedback: aiResult,
        })
        .eq("id", startup.id);
    } catch (e) {
      console.error("AI scoring failed:", e);
    }

    return { success: true, id: startup.id };
  });

export const getAllStartups = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("startups")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error("Failed to fetch startups: " + error.message);
    return data || [];
  });

export const getTopStartups = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("startups")
      .select("*")
      .eq("status", "top")
      .order("score", { ascending: false });

    if (error) throw new Error("Failed to fetch top startups: " + error.message);
    return data || [];
  });

async function scoreStartupWithAI(input: { title: string; problem: string; solution: string; budget: string; category: string }) {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

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
      messages: [
        { role: "system", content: "Sen startup baholovchi AI sifatida ishlaysan. Samarqand shahri kontekstida baholab, natijani structured formatda ber." },
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
                    problem_clarity: { type: "number", description: "0-20 ball" },
                    solution_realism: { type: "number", description: "0-20 ball" },
                    revenue_model: { type: "number", description: "0-15 ball" },
                    scalability: { type: "number", description: "0-15 ball" },
                    regional_benefit: { type: "number", description: "0-15 ball" },
                    clarity: { type: "number", description: "0-15 ball" },
                  },
                  required: ["problem_clarity", "solution_realism", "revenue_model", "scalability", "regional_benefit", "clarity"],
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
                  required: ["problem_clarity", "solution_realism", "revenue_model", "scalability", "regional_benefit", "clarity"],
                },
                strengths: { type: "array", items: { type: "string" }, description: "2-4 kuchli tomon" },
                weaknesses: { type: "array", items: { type: "string" }, description: "2-4 kuchsiz tomon" },
                verdict: { type: "string", description: "Yakuniy xulosa" },
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
  if (!toolCall) throw new Error("No tool call in AI response");

  const parsed = JSON.parse(toolCall.function.arguments);
  const totalScore = Object.values(parsed.scores as Record<string, number>).reduce((a, b) => a + b, 0);

  return {
    ...parsed,
    total_score: totalScore,
  };
}
