import { Dumbbell, Layers, Weight, Timer } from 'lucide-react';
import type { SessionMetrics } from '../../types';

type MetricsGridProps = {
  metrics: SessionMetrics;
};

export default function MetricsGrid({ metrics }: MetricsGridProps) {
  const formatRest = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const cards = [
    {
      icon: <Dumbbell size={22} />,
      color: 'text-lime-400',
      value: metrics.exercise_count ?? 0,
      label: 'Ejercicios',
      suffix: '',
    },
    {
      icon: <Layers size={22} />,
      color: 'text-cyan-400',
      value: metrics.total_sets ?? 0,
      label: 'Series',
      suffix: '',
    },
    {
      icon: <Weight size={22} />,
      color: 'text-purple-400',
      value: (Number(metrics.total_volume_kg ?? 0)).toLocaleString(),
      label: 'Volumen total',
      suffix: 'kg',
    },
    {
      icon: <Timer size={22} />,
      color: 'text-amber-400',
      value: formatRest(metrics.avg_rest_secs ?? 0),
      label: 'Descanso prom.',
      suffix: '',
      isString: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map(({ icon, color, value, label, suffix, isString }) => (
        <div
          key={label}
          className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 flex flex-col gap-2"
        >
          <div className={color}>{icon}</div>
          <span className={`${isString ? 'text-xl' : 'text-3xl'} font-mono font-bold text-white`}>
            {value}
            {suffix && <span className="text-sm text-zinc-500 ml-1">{suffix}</span>}
          </span>
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
