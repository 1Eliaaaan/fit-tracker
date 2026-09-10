import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, TrendingUp, Clock, Activity, Dumbbell, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthProvider';
import { useWorkoutStore } from '../stores/workoutStore';
import { persistActiveWorkout, fetchSessionById, fetchProfile } from '../services/workout.service';
import { generateWorkoutSummary } from '../services/openai.service';
import type { SessionAISummary } from '../types';

export default function WorkoutSummaryPage() {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { workout, cancelWorkout } = useWorkoutStore();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<SessionAISummary | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isPersisting, setIsPersisting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const persisted = useRef(false);

  // Duration calculation
  const durationSecs = workout
    ? Math.floor((Date.now() - new Date(workout.startedAt).getTime()) / 1000)
    : 0;

  // Quick local metrics from store (shown immediately while persisting)
  const localExerciseCount = workout?.exercises.length ?? 0;
  const localTotalSets = workout?.exercises.reduce((acc, ex) => acc + ex.sets.length, 0) ?? 0;
  const localTotalVolume = workout?.exercises.reduce(
    (acc, ex) =>
      acc + ex.sets.reduce((sAcc, s) => sAcc + s.reps * s.weight_kg, 0),
    0
  ) ?? 0;

  useEffect(() => {
    if (!workout || !user || persisted.current) return;
    persisted.current = true;

    (async () => {
      try {
        const sid = await persistActiveWorkout(user.id, workout, durationSecs);
        setSessionId(sid);
        setIsPersisting(false);

        // Now generate AI summary
        setIsAiLoading(true);
        const [savedSession, userProfile] = await Promise.all([
          fetchSessionById(sid),
          fetchProfile(user.id).catch(() => null),
        ]);

        const result = await generateWorkoutSummary({
          session: savedSession,
          profile: userProfile,
          previousBests: {},
          anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
          accessToken: session?.access_token ?? '',
        });


        setAiSummary({
          id: '',
          session_id: sid,
          user_id: user.id,
          summary_text: result.summary_text,
          metrics_json: result.metrics,
          model_used: 'gpt-4o-mini',
          created_at: new Date().toISOString(),
        });
      } catch (err: any) {
        console.error('Summary error:', err);
        setError('No se pudo generar el análisis de IA. Los datos del entrenamiento sí se guardaron.');
      } finally {
        setIsAiLoading(false);
        setIsPersisting(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoHome = () => {
    cancelWorkout();
    navigate('/dashboard', { replace: true });
  };

  if (!workout) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-6 gap-4">
        <p className="text-zinc-500 font-mono text-sm uppercase">Sesión no encontrada</p>
        <button
          onClick={handleGoHome}
          className="bg-lime-400 text-zinc-950 font-black px-6 py-3 rounded-xl uppercase"
        >
          Ir al Inicio
        </button>
      </div>
    );
  }

  const durationMins = Math.floor(durationSecs / 60);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 pb-12 font-sans">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <div className="bg-lime-400/10 border border-lime-400/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-lime-400" />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight leading-tight">
          Entrenamiento<br />Completado
        </h1>
        <p className="text-zinc-500 font-mono text-xs mt-2 uppercase tracking-widest">
          {isPersisting ? 'Guardando...' : sessionId ? '✓ Guardado' : ''}
        </p>
      </motion.header>

      {/* Quick metrics */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 gap-3 mb-6"
      >
        {[
          { icon: <Clock className="w-4 h-4" />, value: `${durationMins}`, unit: 'MIN', label: 'Duración' },
          { icon: <Activity className="w-4 h-4" />, value: localTotalVolume.toLocaleString(), unit: 'KG', label: 'Volumen' },
          { icon: <Dumbbell className="w-4 h-4" />, value: String(localExerciseCount), unit: '', label: 'Ejercicios' },
          { icon: <TrendingUp className="w-4 h-4" />, value: String(localTotalSets), unit: '', label: 'Series' },
        ].map(({ icon, value, unit, label }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-zinc-500 mb-2 text-xs">
              {icon}
              <span className="font-bold uppercase tracking-wider">{label}</span>
            </div>
            <p className="font-mono text-2xl font-black text-zinc-100">
              {value}
              {unit && <span className="text-xs font-sans text-zinc-500 ml-1">{unit}</span>}
            </p>
          </div>
        ))}
      </motion.div>

      {/* AI Summary */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
      >
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-lime-400" /> Análisis IA
        </h2>
        {isAiLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-3 bg-zinc-800 rounded w-3/4" />
            <div className="h-3 bg-zinc-800 rounded w-full" />
            <div className="h-3 bg-zinc-800 rounded w-5/6" />
            <div className="h-3 bg-zinc-800 rounded w-4/5" />
          </div>
        ) : error ? (
          <p className="text-zinc-600 text-xs font-mono italic">{error}</p>
        ) : aiSummary?.summary_text ? (
          <p className="text-zinc-300 leading-relaxed text-sm border-l-2 border-lime-400/40 pl-3">
            {aiSummary.summary_text}
          </p>
        ) : (
          <p className="text-zinc-600 text-xs font-mono italic">
            Análisis no disponible. Verifica que la Edge Function esté desplegada.
          </p>
        )}
      </motion.section>

      {/* Exercise breakdown */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mb-8"
      >
        <h2 className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-3">
          Ejercicios
        </h2>
        <div className="space-y-2">
          {workout.exercises.map((ex, idx) => (
            <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <h3 className="font-bold text-zinc-100 uppercase text-sm mb-2">
                {ex.exerciseName}
              </h3>
              <div className="space-y-1">
                {ex.sets.map((s, sIdx) => (
                  <div key={sIdx} className="flex justify-between text-xs font-mono text-zinc-500">
                    <span>Serie {sIdx + 1}</span>
                    <span className="text-zinc-300">
                      {s.reps} reps × {s.weight_kg} kg
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* CTA */}
      <button
        onClick={handleGoHome}
        className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 font-black text-base py-5 rounded-2xl uppercase tracking-wide transition-colors flex items-center justify-center gap-2"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver al Inicio
      </button>
    </div>
  );
}
