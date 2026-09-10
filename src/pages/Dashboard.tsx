import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Play, Activity, Flame, Weight } from 'lucide-react';
import { useAuth } from '../contexts/AuthProvider';
import { fetchSessionHistory } from '../services/workout.service';
import { useWorkoutStore } from '../stores/workoutStore';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { workout, startWorkout } = useWorkoutStore();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions', user?.id],
    queryFn: () => fetchSessionHistory(user!.id, 5),
    enabled: !!user?.id,
  });

  const isActive = workout !== null && workout.phase !== 'idle';

  const handleStart = () => {
    if (!isActive) {
      startWorkout();
    }
    navigate('/workout/active');
  };

  const streak = useMemo(() => {
    if (!sessions.length) return 0;
    return sessions.length; // Simplified streak
  }, [sessions]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-6 pb-24 font-sans">
      <header className="mb-8">
        <h1 className="text-2xl font-bold uppercase tracking-tight text-zinc-100">
          HOLA, {user?.email?.split('@')[0].toUpperCase()}
        </h1>
        <p className="text-zinc-400 font-mono text-sm mt-1">
          {new Intl.DateTimeFormat('es-ES', { dateStyle: 'full' }).format(new Date()).toUpperCase()}
        </p>
      </header>

      <section className="mb-10">
        <button
          onClick={handleStart}
          className="w-full flex items-center justify-center gap-3 bg-lime-400 hover:bg-lime-500 text-zinc-950 font-black text-xl py-6 rounded-2xl shadow-[0_0_20px_rgba(163,230,53,0.3)] transition-transform active:scale-95 uppercase tracking-wide"
        >
          {isActive ? (
            <>
              <Play className="w-7 h-7 fill-current" />
              Continuar Entrenamiento
            </>
          ) : (
            <>
              <Flame className="w-7 h-7 fill-current" />
              Iniciar Entrenamiento
            </>
          )}
        </button>
      </section>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-center items-center">
          <div className="flex items-center gap-2 text-lime-400 mb-2">
            <Flame className="w-5 h-5" />
            <span className="font-bold uppercase text-xs tracking-wider">Racha</span>
          </div>
          <span className="font-mono text-3xl font-black">{streak}</span>
          <span className="text-zinc-500 text-xs uppercase mt-1">Días</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-center items-center">
          <div className="flex items-center gap-2 text-zinc-300 mb-2">
            <Weight className="w-5 h-5" />
            <span className="font-bold uppercase text-xs tracking-wider">Peso</span>
          </div>
          <span className="font-mono text-3xl font-black text-zinc-100">--</span>
          <span className="text-zinc-500 text-xs uppercase mt-1">KG</span>
        </div>
      </div>

      <section>
        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">
          Sesiones Recientes
        </h2>
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-zinc-900 h-20 rounded-xl border border-zinc-800"></div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-xl p-8 text-center text-zinc-500 font-mono text-sm">
            NO HAY SESIONES REGISTRADAS
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const exCount = session.exercises?.length ?? 0;
              const volume = session.exercises?.reduce(
                (acc: number, ex: any) =>
                  acc + (ex.sets ?? []).reduce((s: number, set: any) => s + (set.reps ?? 0) * (set.weight_kg ?? 0), 0),
                0
              ) ?? 0;
              return (
                <div key={session.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-zinc-100 uppercase tracking-tight">
                      {new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(session.started_at)).toUpperCase()}
                    </h3>
                    <p className="text-zinc-500 text-sm mt-1 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      <span>{exCount} Ejercicios</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="block font-mono text-lg font-black text-lime-400">
                      {volume.toLocaleString()}
                    </span>
                    <span className="text-xs text-zinc-500 font-bold uppercase">KG Vol</span>
                  </div>
                </div>
              );
            })}

          </div>
        )}
      </section>
    </div>
  );
}