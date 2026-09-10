import { useQuery } from '@tanstack/react-query';
import { Trophy, TrendingUp, Activity, Dumbbell } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAuth } from '../contexts/AuthProvider';
import { fetchPersonalRecords, fetchBodyWeightHistory, fetchSessionHistory } from '../services/workout.service';

export default function StatsPage() {
  const { user } = useAuth();

  const { data: prs = [], isLoading: prsLoading } = useQuery({
    queryKey: ['personal-records', user?.id],
    queryFn: () => fetchPersonalRecords(user!.id),
    enabled: !!user?.id,
  });

  const { data: weights = [] } = useQuery({
    queryKey: ['stats-weights', user?.id],
    queryFn: () => fetchBodyWeightHistory(user!.id, 90),
    enabled: !!user?.id,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['stats-sessions', user?.id],
    queryFn: () => fetchSessionHistory(user!.id, 20),
    enabled: !!user?.id,
  });

  // Format real weight data for Recharts
  const weightChartData = weights.map((w) => ({
    date: new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit' }).format(new Date(w.date)),
    weight: w.weight_kg,
  }));

  // Format real session volume for Recharts
  const volumeChartData = [...sessions]
    .reverse()
    .map((s) => {
      const vol = (s.exercises ?? []).reduce(
        (acc: number, ex: any) =>
          acc + (ex.sets ?? []).reduce((sAcc: number, set: any) => sAcc + (set.reps ?? 0) * (set.weight_kg ?? 0), 0),
        0
      );
      const dateStr = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(new Date(s.started_at));
      return {
        session: dateStr,
        volume: vol,
      };
    });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-6 pb-24 font-sans max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-lime-400" />
          Estadísticas & Récords
        </h1>
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-wider mt-1">
          Métricas calculadas de tus sesiones
        </p>
      </header>

      {/* Personal Records */}
      <section className="mb-10">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-lime-400" /> Mejores Marcas Personales (PRs)
        </h2>
        {prsLoading ? (
          <div className="animate-pulse bg-zinc-900 h-32 rounded-2xl border border-zinc-800" />
        ) : prs.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center text-zinc-500 font-mono text-xs uppercase">
            Aún no hay récords registrados. Completa entrenamientos para ver tus PRs aquí.
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-950 text-zinc-500 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3">Ejercicio</th>
                  <th className="px-4 py-3 text-right">Max Peso</th>
                  <th className="px-4 py-3 text-right">Total Series</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 font-mono text-xs">
                {prs.slice(0, 10).map((pr: any, i: number) => (
                  <tr key={i} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3 font-sans font-bold text-zinc-100 uppercase">
                      {pr.exercise_name || pr.exercise_id}
                    </td>
                    <td className="px-4 py-3 text-right text-lime-400 font-black">
                      {pr.max_weight_kg ? `${pr.max_weight_kg} kg` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-400">
                      {pr.total_sets_ever || pr.total_sets || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Weight History Chart */}
      <section className="mb-10">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-lime-400" /> Historial de Peso Corporal
        </h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          {weightChartData.length < 2 ? (
            <div className="h-44 flex flex-col items-center justify-center text-zinc-500 font-mono text-xs text-center p-4">
              <Dumbbell className="w-6 h-6 mb-2 text-zinc-600" />
              Registra tu peso en al menos 2 días en tu Perfil para generar la curva de progreso.
            </div>
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightChartData}>
                  <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '0.75rem' }}
                    itemStyle={{ color: '#a3e635', fontWeight: 'bold' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#a3e635"
                    strokeWidth={2.5}
                    dot={{ fill: '#a3e635', strokeWidth: 2, r: 4 }}
                    name="Peso (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      {/* Volume History Chart */}
      <section className="mb-10">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-lime-400" /> Volumen por Sesión (Últimas 20)
        </h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          {volumeChartData.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-zinc-500 font-mono text-xs text-center p-4">
              <Dumbbell className="w-6 h-6 mb-2 text-zinc-600" />
              Completa sesiones de entrenamiento para visualizar el volumen acumulado por día.
            </div>
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeChartData}>
                  <XAxis dataKey="session" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: '#27272a' }}
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '0.75rem' }}
                    itemStyle={{ color: '#a3e635', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="volume" fill="#27272a" radius={[6, 6, 0, 0]} activeBar={{ fill: '#a3e635' }} name="Volumen (kg)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
