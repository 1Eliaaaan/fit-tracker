// Supabase Edge Function: ai-advisor
// Deploy: npx supabase functions deploy ai-advisor --no-verify-jwt

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import OpenAI from "npm:openai@4";
import { createClient } from "jsr:@supabase/supabase-js@2";

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { category, profile, contextData, user_id } = await req.json();

    const profileSummary = profile
      ? `Usuario: ${profile.display_name ?? "Atleta"}, Objetivo: ${profile.goal ?? "general"}, Nivel: ${profile.fitness_level ?? "intermedio"}, Peso: ${profile.current_weight ?? profile.initial_weight ?? "desconocido"}kg, Altura: ${profile.height_cm ?? "desconocida"}cm`
      : "Perfil no configurado";

    let systemPrompt = "";
    let userPrompt = "";

    if (category === "nutrition") {
      systemPrompt = `Eres un nutricionista deportivo y entrenador de alto nivel.
Analiza la alimentación reciente del usuario, evaluando la ingesta calórica y la distribución de macronutrientes (proteínas, carbohidratos y grasas) en relación con su objetivo físico y su peso corporal.
Sé empático, directo, técnico pero accesible, y ofrece 2 a 3 recomendaciones prácticas y accionables. No uses rodeos innecesarios.`;

      userPrompt = `PERFIL:
${profileSummary}

REGISTRO DE COMIDAS RECIENTES:
${JSON.stringify(contextData, null, 2)}

Por favor, dame un análisis claro de cómo voy nutricionalmente y qué ajustes puntuales me recomiendas hacer hoy o esta semana para progresar hacia mi objetivo.`;
    } else if (category === "sleep") {
      systemPrompt = `Eres un especialista en fisiología del ejercicio y recuperación del sueño.
Analiza el descanso del usuario, evaluando las horas promedio de sueño, regularidad y calidad subjetiva, correlacionándolas con la fatiga del entrenamiento muscular.
Ofrece retroalimentación honesta y 2 a 3 pautas científicamente respaldadas para optimizar la calidad del sueño y la síntesis muscular.`;

      userPrompt = `PERFIL:
${profileSummary}

REGISTRO DE SUEÑO Y DESCANSO:
${JSON.stringify(contextData, null, 2)}

Por favor, analiza mi descanso reciente y dime si es suficiente para mi recuperación y qué hábitos me sugieres mejorar.`;
    } else {
      throw new Error("Categoría no válida. Debe ser 'nutrition' o 'sleep'.");
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const feedbackText = completion.choices[0]?.message?.content || "Análisis completado.";

    // Save in ai_feedback_logs if user_id is provided
    if (user_id) {
      try {
        const authHeader = req.headers.get("Authorization");
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "",
          { global: { headers: { Authorization: authHeader ?? "" } } }
        );

        await supabase.from("ai_feedback_logs").insert({
          user_id,
          category,
          feedback_text: feedbackText,
        });
      } catch (dbErr) {
        console.warn("Could not save to ai_feedback_logs:", dbErr);
      }
    }

    return new Response(JSON.stringify({ feedback_text: feedbackText }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    console.error("Error in ai-advisor:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
