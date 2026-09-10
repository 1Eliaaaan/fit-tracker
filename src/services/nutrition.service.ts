import { supabase } from '../lib/supabase';
import type { NutritionLog, UserProfile } from '../types';

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export async function logMealWithAI({
  rawText,
  userId,
  date,
  accessToken,
}: {
  rawText: string;
  userId: string;
  date?: string;
  accessToken: string;
}): Promise<NutritionLog> {
  const res = await fetch(`${FUNCTIONS_URL}/parse-meal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      raw_text: rawText,
      user_id: userId,
      date: date || new Date().toISOString().split('T')[0],
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(errorData.error || `Error ${res.status} al procesar comida con IA`);
  }

  return res.json();
}

export async function fetchMealsByDate(userId: string, date: string): Promise<NutritionLog[]> {
  const { data, error } = await supabase
    .from('nutrition_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as NutritionLog[];
}

export async function fetchRecentMeals(userId: string, days = 7): Promise<NutritionLog[]> {
  const minDate = new Date();
  minDate.setDate(minDate.getDate() - days);
  const minDateStr = minDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('nutrition_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('date', minDateStr)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as NutritionLog[];
}

export async function deleteMealLog(id: string): Promise<void> {
  const { error } = await supabase.from('nutrition_logs').delete().eq('id', id);
  if (error) throw error;
}

export async function requestNutritionFeedback({
  userId,
  profile,
  recentMeals,
  accessToken,
}: {
  userId: string;
  profile: UserProfile | null;
  recentMeals: NutritionLog[];
  accessToken: string;
}): Promise<string> {
  const res = await fetch(`${FUNCTIONS_URL}/ai-advisor`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      category: 'nutrition',
      user_id: userId,
      profile,
      contextData: recentMeals.map((m) => ({
        date: m.date,
        meal_type: m.meal_type,
        raw_text: m.raw_text,
        items: m.parsed_items,
        total_calories: m.total_calories,
        macros: { protein: m.protein_g, carbs: m.carbs_g, fat: m.fat_g },
      })),
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(errorData.error || `Error ${res.status} al solicitar feedback de nutrición`);
  }

  const data = await res.json();
  return data.feedback_text;
}
