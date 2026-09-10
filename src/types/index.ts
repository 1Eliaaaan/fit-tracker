// ═══════════════════════════════════════════════════════════════
//  FitTrack v2 — TypeScript Types
// ═══════════════════════════════════════════════════════════════

// ─── Primitives del sistema ──────────────────────────────────────

export interface UserProfile {
  id: string;
  display_name: string | null;
  birth_date: string | null;          // ISO date string
  height_cm: number | null;
  initial_weight: number | null;
  current_weight: number | null;
  goal: GoalType | null;
  fitness_level: FitnessLevel | null;
  created_at: string;
  updated_at: string;
}

export type GoalType = 'lose_weight' | 'gain_muscle' | 'maintain' | 'strength' | 'endurance';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

export const GOAL_LABELS: Record<GoalType, string> = {
  lose_weight: 'Perder peso',
  gain_muscle: 'Ganar músculo',
  maintain: 'Mantener forma',
  strength: 'Ganar fuerza',
  endurance: 'Mejorar resistencia',
};

export const FITNESS_LABELS: Record<FitnessLevel, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

// ─── Sesión de entrenamiento ──────────────────────────────────────

export interface WorkoutSession {
  id: string;
  user_id: string;
  started_at: string;
  finished_at: string | null;
  duration_secs: number | null;
  notes: string | null;
  created_at: string;
}

export interface SessionExercise {
  id: string;
  session_id: string;
  user_id: string;
  exercise_id: string;
  exercise_name: string;
  category: string;
  order_index: number;
  created_at: string;
  // joined
  sets?: ExerciseSet[];
}

export interface ExerciseSet {
  id: string;
  session_exercise_id: string;
  user_id: string;
  set_number: number;
  reps: number | null;
  weight_kg: number | null;
  duration_secs: number | null;
  rest_secs: number | null;
  rpe: number | null;
  notes: string | null;
  created_at: string;
}

// ─── Estado activo del workout (Zustand) ─────────────────────────

export interface ActiveSet {
  setNumber: number;
  reps: number;
  weight_kg: number;
  rest_secs: number | null;
  completed: boolean;
}

export interface ActiveExercise {
  tempId: string;          // UUID local antes de guardar
  dbId?: string;           // ID real una vez guardado en DB
  exerciseId: string;
  exerciseName: string;
  category: string;
  sets: ActiveSet[];
  orderIndex: number;
}

export interface ActiveWorkout {
  sessionId: string | null;         // null si aún no se inició en DB
  startedAt: Date;
  exercises: ActiveExercise[];
  currentExerciseIndex: number;
  currentSetIndex: number;
  phase: WorkoutPhase;
}

export type WorkoutPhase =
  | 'idle'               // Sin workout activo
  | 'selecting_exercise' // Eligiendo ejercicio
  | 'executing_set'      // Ejecutando una serie
  | 'resting'            // Descansando (cronómetro corriendo)
  | 'exercise_done'      // Ejercicio terminado, decidir qué sigue
  | 'finished';          // Workout terminado, mostrando resumen

// ─── IA y resúmenes ──────────────────────────────────────────────

export interface SessionAISummary {
  id: string;
  session_id: string;
  user_id: string;
  summary_text: string | null;
  metrics_json: SessionMetrics | null;
  model_used: string;
  created_at: string;
}

export interface SessionMetrics {
  exercise_count: number;
  total_sets: number;
  total_reps: number;
  total_volume_kg: number;
  avg_rest_secs: number;
  duration_secs: number;
  personal_records?: PersonalRecord[];
}

export interface PersonalRecord {
  exercise_name: string;
  type: 'weight' | 'reps' | 'volume';
  value: number;
  previous_value: number | null;
}

// ─── Historial completo de sesión (joined) ───────────────────────

export interface SessionWithDetails extends WorkoutSession {
  exercises: SessionExerciseWithSets[];
  ai_summary?: SessionAISummary;
}

export interface SessionExerciseWithSets extends SessionExercise {
  sets: ExerciseSet[];
}

// ─── Peso corporal ────────────────────────────────────────────────

export interface BodyWeight {
  id: string;
  user_id: string;
  weight_kg: number;
  date: string;
  created_at: string;
}

// ─── Nutrición y Comida ──────────────────────────────────────────

export type MealType = 'desayuno' | 'almuerzo' | 'merienda' | 'cena' | 'snack' | 'otro';

export interface NutrientItem {
  name: string;
  portion: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface NutritionLog {
  id: string;
  user_id: string;
  date: string;
  meal_type: MealType;
  raw_text: string;
  parsed_items: NutrientItem[];
  total_calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  created_at: string;
}

export const MEAL_TYPE_LABELS: Record<MealType, { label: string; icon: string }> = {
  desayuno: { label: 'Desayuno', icon: '🍳' },
  almuerzo: { label: 'Almuerzo', icon: '🍲' },
  merienda: { label: 'Merienda', icon: '🥪' },
  cena: { label: 'Cena', icon: '🥗' },
  snack: { label: 'Snack', icon: '🍎' },
  otro: { label: 'Otro', icon: '🍴' },
};

// ─── Descanso y Sueño ───────────────────────────────────────────

export type SleepQuality = 'poor' | 'fair' | 'good' | 'excellent';

export interface SleepLog {
  id: string;
  user_id: string;
  date: string;
  sleep_hours: number;
  quality: SleepQuality;
  bed_time: string | null;
  wake_time: string | null;
  notes: string | null;
  created_at: string;
}

export const SLEEP_QUALITY_LABELS: Record<SleepQuality, { label: string; icon: string; color: string }> = {
  poor: { label: 'Mala', icon: '🥱', color: 'text-red-400' },
  fair: { label: 'Regular', icon: '😐', color: 'text-amber-400' },
  good: { label: 'Buena', icon: '😊', color: 'text-lime-400' },
  excellent: { label: 'Excelente', icon: '⚡', color: 'text-cyan-400' },
};

// ─── Feedback IA Bajo Demanda ───────────────────────────────────

export interface AIFeedbackLog {
  id: string;
  user_id: string;
  category: 'nutrition' | 'sleep' | 'general';
  feedback_text: string;
  created_at: string;
}

// ─── Exercise Library (existente, sin cambios) ───────────────────
export type { ExerciseInfo, MuscleGroup } from '../data/exercises';