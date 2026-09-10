import { motion } from 'framer-motion';

type SetCounterProps = {
  completed: number;
  total?: number;
};

export default function SetCounter({ completed, total }: SetCounterProps) {
  if (!total) {
    return (
      <div className="flex items-baseline space-x-1 text-zinc-400">
        <span className="text-lime-400 font-mono text-xl font-bold">{completed}</span>
        <span className="text-sm font-bold uppercase tracking-wider">series</span>
      </div>
    );
  }

  const dots = Array.from({ length: total }, (_, i) => i < completed);

  return (
    <div className="flex items-center space-x-2">
      {dots.map((isDone, i) => (
        <motion.div
          key={i}
          initial={false}
          animate={{
            scale: isDone ? 1 : 0.8,
            backgroundColor: isDone ? '#a3e635' : '#27272a',
          }}
          className="w-3 h-3 rounded-full"
        />
      ))}
    </div>
  );
}
