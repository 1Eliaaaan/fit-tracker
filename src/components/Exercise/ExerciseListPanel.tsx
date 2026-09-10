import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
// @ts-ignore
import { getExercisesByCategory, searchExercises } from '../../data/exercises';
// @ts-ignore
import type { ExerciseInfo, MuscleGroup } from '../../types';

type ExerciseListPanelProps = {
  category: MuscleGroup | null;
  searchQuery: string;
  onSelect: (exercise: ExerciseInfo) => void;
};

export default function ExerciseListPanel({ category, searchQuery, onSelect }: ExerciseListPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // @ts-ignore
  let exercises: ExerciseInfo[] = [];
  if (searchQuery) {
    exercises = searchExercises(searchQuery);
  } else if (category) {
    exercises = getExercisesByCategory(category);
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col space-y-2 p-4"
    >
      {exercises.length === 0 && (
        <div className="text-center text-zinc-500 py-8 font-bold">
          No se encontraron ejercicios.
        </div>
      )}
      {exercises.map((exercise) => (
        <motion.div key={exercise.id} variants={item} className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
          <div 
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-800/50 transition-colors"
            onClick={() => setExpandedId(expandedId === exercise.id ? null : exercise.id)}
          >
            <div className="flex flex-col">
              <span className="text-white font-bold">{exercise.name}</span>
              <span className="text-xs text-lime-400 mt-1 uppercase tracking-wider">{exercise.category}</span>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSelect(exercise);
              }}
              className="p-2 bg-zinc-800 rounded-full text-white hover:bg-lime-400 hover:text-black transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <AnimatePresence>
            {expandedId === exercise.id && exercise.description && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-4 pb-4 text-sm text-zinc-400"
              >
                {exercise.description}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </motion.div>
  );
}
