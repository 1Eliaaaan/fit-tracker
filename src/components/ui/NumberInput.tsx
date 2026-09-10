import { useCallback } from 'react';
import { Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type NumberInputProps = {
  value: number;
  onChange: (v: number) => void;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
};

export default function NumberInput({
  value,
  onChange,
  label,
  min = 0,
  max = Infinity,
  step = 1,
  unit,
}: NumberInputProps) {
  const handleMinus = useCallback(() => {
    onChange(Math.max(min, value - step));
  }, [value, onChange, min, step]);

  const handlePlus = useCallback(() => {
    onChange(Math.min(max, value + step));
  }, [value, onChange, max, step]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <span className="text-zinc-400 font-bold uppercase tracking-wider text-sm">{label}</span>
      <div className="flex items-center space-x-6">
        <button
          type="button"
          onClick={handleMinus}
          disabled={value <= min}
          className="w-14 h-14 flex items-center justify-center rounded-2xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none text-white"
        >
          <Minus size={28} />
        </button>

        <div className="flex flex-col items-center justify-center min-w-[5rem] overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={value}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="text-4xl font-mono font-bold text-lime-400"
            >
              {value}
            </motion.div>
          </AnimatePresence>
          {unit && <span className="text-sm text-zinc-500 mt-1">{unit}</span>}
        </div>

        <button
          type="button"
          onClick={handlePlus}
          disabled={value >= max}
          className="w-14 h-14 flex items-center justify-center rounded-2xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none text-white"
        >
          <Plus size={28} />
        </button>
      </div>
    </div>
  );
}
