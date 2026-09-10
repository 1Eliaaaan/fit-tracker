// Supabase Edge Function: parse-meal
// Deploy: npx supabase functions deploy parse-meal --no-verify-jwt

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
    const { raw_text, user_id, date } = await req.json();

    if (!raw_text || !raw_text.trim()) {
      throw new Error("No se proporcionó texto de la comida.");
    }

    const logDate = date || new Date().toISOString().split("T")[0];
    const currentHour = new Date().getHours();

    const systemPrompt = `Eres un nutricionista y analista dietético experto.
El usuario describirá en lenguaje natural lo que comió. Tu tarea es extraer la información nutricional aproximada y catalogarla.

Reglas:
1. Identifica el tipo de comida ('desayuno', 'almuerzo', 'merienda', 'cena', 'snack', 'otro'). Si el usuario dice "almorcé" o "almuerzo", usa 'almuerzo'. Si no lo menciona explícitamente, deduce por la hora actual (${currentHour}:00h).
2. Desglosa cada ingrediente/plato en un array de items con porción estimada, calorías, proteína (g), carbohidratos (g) y grasas (g).
3. Calcula los totales numéricos.
4. Responde ÚNICAMENTE en JSON con el siguiente formato exacto, sin markdown ni explicaciones adicionales:
{
  "meal_type": "almuerzo",
  "items": [
    {
      "name": "Arroz blanco",
      "portion": "200g",
      "calories": 260,
      "protein_g": 5,
      "carbs_g": 56,
      "fat_g": 1
    }
  ],
  "total_calories": 260,
  "protein_g": 5,
  "carbs_g": 56,
  "fat_g": 1
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: raw_text },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const parsedJson = JSON.parse(completion.choices[0]?.message?.content || "{}");

    // ── Generate semantic embedding ────────────────────────────
    const embeddingText = `Comida ${parsedJson.meal_type || 'comida'} (${logDate}): ${raw_text}. Total: ${parsedJson.total_calories || 0} kcal, P: ${parsedJson.protein_g || 0}g, C: ${parsedJson.carbs_g || 0}g, G: ${parsedJson.fat_g || 0}g`;
    
    let embedding: number[] = [];
    try {
      const embRes = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: embeddingText,
      });
      embedding = embRes.data[0]?.embedding ?? [];
    } catch (e) {
      console.warn("Embedding error in parse-meal:", e);
    }

    // ── Save in Supabase ───────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader ?? "" } } }
    );

    const { data: inserted, error: insertError } = await supabase
      .from("nutrition_logs")
      .insert({
        user_id,
        date: logDate,
        meal_type: parsedJson.meal_type || "otro",
        raw_text,
        parsed_items: parsedJson.items || [],
        total_calories: parsedJson.total_calories || 0,
        protein_g: parsedJson.protein_g || 0,
        carbs_g: parsedJson.carbs_g || 0,
        fat_g: parsedJson.fat_g || 0,
        embedding: embedding.length > 0 ? embedding : null,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return new Response(JSON.stringify(inserted), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    console.error("Error in parse-meal:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
