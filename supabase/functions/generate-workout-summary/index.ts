// Supabase Edge Function: generate-workout-summary
// Deploy: npx supabase functions deploy generate-workout-summary --no-verify-jwt

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import OpenAI from "npm:openai@4";
import { createClient } from "jsr:@supabase/supabase-js@2";

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });

Deno.serve(async (req: Request) => {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { session, profile, previousBests } = await req.json();

    if (!session) {
      throw new Error("No session provided in request body");
    }

    // Support both session_exercises (DB format) and exercises (store format)
    const exercisesList = session.session_exercises ?? session.exercises ?? [];

    // ── Build context for GPT ──────────────────────────────────
    const profileCtx = profile
      ? `Usuario: ${profile.display_name ?? "Atleta"}, 
         Objetivo: ${profile.goal ?? "general"}, 
         Nivel: ${profile.fitness_level ?? "intermedio"},
         Peso: ${profile.current_weight ?? profile.initial_weight ?? "desconocido"} kg,
         Altura: ${profile.height_cm ?? "desconocida"} cm`
      : "Perfil no disponible";

    const exerciseSummaries = exercisesList.length > 0
      ? exercisesList
          .map((ex: any) => {
            const sets = ex.exercise_sets ?? ex.sets ?? [];
            const totalVol = sets.reduce(
              (sum: number, s: any) => sum + (s.reps ?? 0) * (s.weight_kg ?? 0),
              0
            );
            const maxWeight = sets.length > 0
              ? Math.max(...sets.map((s: any) => s.weight_kg ?? 0))
              : 0;
            const avgRest = sets.length > 0
              ? sets.reduce((sum: number, s: any) => sum + (s.rest_secs ?? 0), 0) / sets.length
              : 0;
            const prev = previousBests?.[ex.exercise_id];
            const prNote = prev && maxWeight > prev.weight_kg
              ? ` ⭐ PR! (anterior: ${prev.weight_kg}kg)`
              : "";

            return `  • ${ex.exercise_name}: ${sets.length} series, max ${maxWeight}kg, vol ${totalVol.toFixed(0)}kg, desc. prom. ${Math.round(avgRest)}s${prNote}`;
          })
          .join("\n")
      : "Sin ejercicios registrados";

    // ── Calculate metrics ─────────────────────────────────────
    const allSets = exercisesList.flatMap((ex: any) => ex.exercise_sets ?? ex.sets ?? []);
    const metrics = {
      exercise_count: exercisesList.length,
      total_sets: allSets.length,
      total_reps: allSets.reduce((s: number, set: any) => s + (set.reps ?? 0), 0),
      total_volume_kg: allSets.reduce(
        (s: number, set: any) => s + (set.reps ?? 0) * (set.weight_kg ?? 0),
        0
      ),
      avg_rest_secs: Math.round(
        allSets.length > 0
          ? allSets.reduce((s: number, set: any) => s + (set.rest_secs ?? 0), 0) / allSets.length
          : 0
      ),
      duration_secs: session.duration_secs ?? 0,
    };

    const durationMin = Math.max(1, Math.round((session.duration_secs ?? 0) / 60));

    const prompt = `Eres un entrenador personal experto y motivador. Analiza esta sesión de entrenamiento y da un resumen útil y personalizado en español.

PERFIL:
${profileCtx}

SESIÓN (${durationMin} min):
${exerciseSummaries}

Escribe un análisis de 3-5 oraciones que:
1. Evalúe el rendimiento general de forma motivadora
2. Destaque lo mejor de la sesión (PRs, consistencia, volumen levantado, etc.)
3. Dé 1-2 sugerencias concretas de mejora para la próxima vez
4. Considere el objetivo del usuario si está disponible

Sé directo, específico y usa los datos reales del entrenamiento. Nada genérico.`;

    // ── Call GPT-4o-mini ──────────────────────────────────────
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
      temperature: 0.7,
    });

    const summaryText = completion.choices[0]?.message?.content ?? "Entrenamiento registrado exitosamente.";

    // ── Generate embedding ─────────────────────────────────────
    const sessionDate = session.started_at
      ? new Date(session.started_at).toLocaleDateString("es-ES")
      : "Hoy";
    const embeddingText = `Sesión ${sessionDate}: ${exerciseSummaries}\n${summaryText}`;
    
    let embedding: number[] = [];
    try {
      const embeddingRes = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: embeddingText,
      });
      embedding = embeddingRes.data[0]?.embedding ?? [];
    } catch (e) {
      console.warn("Embedding generation warning:", e);
    }

    // ── Save to DB ────────────────────────────────────────────
    try {
      const authHeader = req.headers.get("Authorization");
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        { global: { headers: { Authorization: authHeader ?? "" } } }
      );

      await supabase.from("session_ai_summary").upsert({
        session_id: session.id,
        user_id: session.user_id,
        summary_text: summaryText,
        metrics_json: metrics,
        embedding: embedding.length > 0 ? embedding : null,
        model_used: "gpt-4o-mini",
      });
    } catch (dbErr) {
      console.warn("Could not save to session_ai_summary table:", dbErr);
    }

    return new Response(
      JSON.stringify({ summary_text: summaryText, metrics, embedding }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err: any) {
    console.error("Error in generate-workout-summary:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
