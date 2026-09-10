import { supabase } from '../lib/supabase';
import type { SleepLog, SleepQuality, UserProfile } from '../types';

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export async function upsertSleepLog({
  userId,
  date,
  sleepHours,
  quality,
  bedTime,
  wakeTime,
  notes,
}: {
  userId: string;
  date: string;
  sleepHours: number;
  quality: SleepQuality;
  bedTime?: string | null;
  wakeTime?: string | null;
  notes?: string | null;
}): Promise<SleepLog> {
  const { data, error } = await supabase
    .from('sleep_logs')
    .upsert(
      {
        user_id: userId,
        date,
        sleep_hours: sleepHours,
        quality,
        bed_time: bedTime || null,
        wake_time: wakeTime || null,
        notes: notes || null,
      },
      { onConflict: 'user_id,date' }
    )
    .select()
    .single();

  if (error) throw error;
  return data as SleepLog;
}

export async function fetchSleepHistory(userId: string, days = 30): Promise<SleepLog[]> {
  const minDate = new Date();
  minDate.setDate(minDate.getDate() - days);
  const minDateStr = minDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('sleep_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('date', minDateStr)
    .order('date', { ascending: true });

  if (error) throw error;
  return (data ?? []) as SleepLog[];
}

export async function fetchTodaySleep(userId: string): Promise<SleepLog | null> {
  const todayStr = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('sleep_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', todayStr)
    .maybeSingle();

  if (error) throw error;
  return data as SleepLog | null;
}

export async function requestSleepFeedback({
  userId,
  profile,
  recentSleep,
  accessToken,
}: {
  userId: string;
  profile: UserProfile | null;
  recentSleep: SleepLog[];
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
      category: 'sleep',
      user_id: userId,
      profile,
      contextData: recentSleep.map((s) => ({
        date: s.date,
        hours: s.sleep_hours,
        quality: s.quality,
        notes: s.notes,
      })),
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(errorData.error || `Error ${res.status} al solicitar feedback de descanso`);
  }

  const data = await res.json();
  return data.feedback_text;
}
