import { supabase } from '../lib/supabase';
import type {
  WorkoutSession,
  SessionExercise,
  ExerciseSet,
  SessionWithDetails,
  UserProfile,
  BodyWeight,
} from '../types';
import type { ActiveWorkout } from '../types';

// ─── Sesiones ──────────────────────────────────────────────────

export async function createSession(userId: string): Promise<WorkoutSession> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({ user_id: userId, started_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function finishSession(
  sessionId: string,
  durationSecs: number
): Promise<WorkoutSession> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .update({ finished_at: new Date().toISOString(), duration_secs: durationSecs })
    .eq('id', sessionId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('workout_sessions')
    .delete()
    .eq('id', sessionId);
  if (error) throw error;
}

export async function fetchSessionHistory(
  userId: string,
  limit = 30
): Promise<SessionWithDetails[]> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select(`
      *,
      session_exercises (
        *,
        exercise_sets ( * )
      ),
      session_ai_summary ( * )
    `)
    .eq('user_id', userId)
    .not('finished_at', 'is', null)
    .order('started_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as SessionWithDetails[];
}

export async function fetchSessionById(sessionId: string): Promise<SessionWithDetails> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select(`
      *,
      session_exercises (
        *,
        exercise_sets ( * )
      ),
      session_ai_summary ( * )
    `)
    .eq('id', sessionId)
    .single();
  if (error) throw error;
  return data as SessionWithDetails;
}

// ─── Ejercicios de sesión ──────────────────────────────────────

export async function addSessionExercise(
  sessionId: string,
  userId: string,
  exerciseId: string,
  exerciseName: string,
  category: string,
  orderIndex: number
): Promise<SessionExercise> {
  const { data, error } = await supabase
    .from('session_exercises')
    .insert({
      session_id: sessionId,
      user_id: userId,
      exercise_id: exerciseId,
      exercise_name: exerciseName,
      category,
      order_index: orderIndex,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Series ────────────────────────────────────────────────────

export async function addExerciseSet(
  sessionExerciseId: string,
  userId: string,
  set: {
    set_number: number;
    reps: number | null;
    weight_kg: number | null;
    duration_secs?: number | null;
    rest_secs?: number | null;
    rpe?: number | null;
    notes?: string | null;
  }
): Promise<ExerciseSet> {
  const { data, error } = await supabase
    .from('exercise_sets')
    .insert({ session_exercise_id: sessionExerciseId, user_id: userId, ...set })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateExerciseSet(
  setId: string,
  updates: Partial<Pick<ExerciseSet, 'reps' | 'weight_kg' | 'rest_secs' | 'rpe' | 'notes'>>
): Promise<ExerciseSet> {
  const { data, error } = await supabase
    .from('exercise_sets')
    .update(updates)
    .eq('id', setId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Guardar sesión completa desde el store activo ─────────────
// Llama esta función al finalizar el workout para persistirlo todo de golpe

export async function persistActiveWorkout(
  userId: string,
  workout: ActiveWorkout,
  durationSecs: number
): Promise<string> {
  // 1. Crear sesión
  const session = await createSession(userId);
  const sessionId = session.id;

  // 2. Para cada ejercicio activo
  for (const activeEx of workout.exercises) {
    if (activeEx.sets.length === 0) continue;

    const dbExercise = await addSessionExercise(
      sessionId,
      userId,
      activeEx.exerciseId,
      activeEx.exerciseName,
      activeEx.category,
      activeEx.orderIndex
    );

    // 3. Para cada serie del ejercicio
    for (const activeSet of activeEx.sets) {
      if (!activeSet.completed) continue;
      await addExerciseSet(dbExercise.id, userId, {
        set_number: activeSet.setNumber,
        reps: activeSet.reps,
        weight_kg: activeSet.weight_kg,
        rest_secs: activeSet.rest_secs,
      });
    }
  }

  // 4. Marcar sesión como terminada
  await finishSession(sessionId, durationSecs);

  return sessionId;
}

// ─── Perfil ────────────────────────────────────────────────────

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Peso corporal ─────────────────────────────────────────────

export async function upsertBodyWeight(
  userId: string,
  weight_kg: number,
  date: string
): Promise<BodyWeight> {
  const { data, error } = await supabase
    .from('body_weights')
    .upsert({ user_id: userId, weight_kg, date })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchBodyWeightHistory(
  userId: string,
  days = 90
): Promise<BodyWeight[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data, error } = await supabase
    .from('body_weights')
    .select('*')
    .eq('user_id', userId)
    .gte('date', since.toISOString().split('T')[0])
    .order('date', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// ─── Personal Records ──────────────────────────────────────────

export async function fetchPersonalRecords(userId: string) {
  const { data, error } = await supabase
    .from('exercise_personal_records')
    .select('*')
    .eq('user_id', userId)
    .order('total_sets_ever', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ─── Mejor marca anterior de un ejercicio (para comparar en IA) ─

export async function fetchExercisePreviousBest(
  userId: string,
  exerciseId: string,
  beforeSessionId: string
) {
  const { data, error } = await supabase
    .from('exercise_sets')
    .select(`
      reps,
      weight_kg,
      session_exercises!inner (
        exercise_id,
        session_id,
        workout_sessions!inner ( user_id, finished_at )
      )
    `)
    .eq('session_exercises.exercise_id', exerciseId)
    .eq('session_exercises.workout_sessions.user_id', userId)
    .neq('session_exercises.session_id', beforeSessionId)
    .not('session_exercises.workout_sessions.finished_at', 'is', null)
    .order('weight_kg', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return data;
}
