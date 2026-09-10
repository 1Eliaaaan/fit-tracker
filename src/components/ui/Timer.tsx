import { motion } from 'framer-motion';

type TimerProps = {
  seconds: number;
  isRunning: boolean;
  variant?: 'rest' | 'workout';
};

export default function Timer({ seconds, isRunning, variant = 'workout' }: TimerProps) {
  const isRest = variant === 'rest';
  
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const formatted = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  
  const colorClass = isRest ? 'text-cyan-400' : 'text-zinc-400';
  const label = isRest ? 'descansando' : 'entrenando';

  return (
    <div className="flex flex-col items-center justify-center relative p-8">
      {isRunning && isRest && (
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-cyan-400/20"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <div className={`text-6xl font-mono font-bold ${colorClass}`}>
        {formatted}
      </div>
      <span className="text-zinc-500 uppercase tracking-widest text-xs mt-2 font-bold">
        {label}
      </span>
    </div>
  );
}
