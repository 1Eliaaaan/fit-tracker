import { Check, Edit2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

type SetRowProps = {
  setNumber: number;
  reps: number;
  weight_kg: number;
  rest_secs: number | null;
  onEdit: () => void;
  isEditing: boolean;
};

export default function SetRow({
  setNumber,
  reps,
  weight_kg,
  rest_secs,
  onEdit,
  isEditing,
}: SetRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group flex items-center justify-between p-4 rounded-2xl transition-colors ${
        isEditing ? 'border-2 border-lime-400 bg-zinc-900' : 'bg-zinc-800 border-2 border-transparent'
      }`}
    >
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">
          S{setNumber}
        </div>
        
        <div className="flex items-baseline space-x-1">
          <span className="text-xl font-mono font-bold text-white">{reps}</span>
          <span className="text-zinc-500 text-sm">reps</span>
        </div>
        
        <span className="text-zinc-600 font-bold">×</span>
        
        <div className="flex items-baseline space-x-1">
          <span className="text-xl font-mono font-bold text-white">{weight_kg}</span>
          <span className="text-zinc-500 text-sm">kg</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {rest_secs !== null && (
          <div className="flex items-center space-x-1 text-cyan-400/80 bg-cyan-400/10 px-2 py-1 rounded-md text-xs font-mono">
            <Clock size={12} />
            <span>{rest_secs}s</span>
          </div>
        )}
        
        <Check size={20} className="text-lime-400" />
        
        <button
          onClick={onEdit}
          className="md:opacity-0 group-hover:opacity-100 transition-opacity p-2 text-zinc-400 hover:text-white"
        >
          <Edit2 size={16} />
        </button>
      </div>
    </motion.div>
  );
}
