import { useState, useCallback, useEffect, useRef } from 'react';
import { Minus, Plus, X, Check } from 'lucide-react';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  const handleMinus = useCallback(() => {
    onChange(Math.max(min, value - step));
  }, [value, onChange, min, step]);

  const handlePlus = useCallback(() => {
    onChange(Math.min(max, value + step));
  }, [value, onChange, max, step]);

  // Open modal and initialize temp value
  const openModal = () => {
    setTempValue(value.toString());
    setIsModalOpen(true);
  };

  // Focus input when modal opens
  useEffect(() => {
    if (isModalOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isModalOpen]);

  const saveModalValue = () => {
    let parsed = parseFloat(tempValue);
    if (isNaN(parsed)) parsed = min;
    parsed = Math.max(min, Math.min(max, parsed));
    onChange(parsed);
    setIsModalOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveModalValue();
    }
  };

  // Quick values based on unit
  const quickValues = unit === 'kg' 
    ? [5, 10, 15, 20, 25, 30, 40, 50, 60, 80, 100] 
    : [1, 5, 8, 10, 12, 15, 20, 25, 30];

  return (
    <>
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

          <div 
            className="flex flex-col items-center justify-center min-w-[5rem] overflow-hidden cursor-pointer group"
            onClick={openModal}
            title="Presiona para editar manualmente"
          >
            <AnimatePresence mode="popLayout">
              <motion.div
                key={value}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="text-4xl font-mono font-bold text-lime-400 group-hover:text-lime-300 transition-colors"
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

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-black uppercase tracking-wider">
                  Ingresar {label}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="relative mb-8">
                <input
                  ref={inputRef}
                  type="number"
                  inputMode="decimal"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl py-4 text-center text-4xl font-mono font-black text-lime-400 focus:outline-none focus:border-lime-400/50"
                />
                {unit && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold uppercase">
                    {unit}
                  </span>
                )}
              </div>

              <div className="mb-6">
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-3 block">
                  Accesos Rápidos
                </span>
                <div className="flex flex-wrap gap-2">
                  {quickValues.map((qv) => (
                    <button
                      key={qv}
                      onClick={() => setTempValue(qv.toString())}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 rounded-xl text-zinc-300 font-mono font-bold transition-colors"
                    >
                      {qv}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={saveModalValue}
                className="w-full bg-lime-400 hover:bg-lime-300 text-zinc-950 font-black uppercase tracking-wider py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                Confirmar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
