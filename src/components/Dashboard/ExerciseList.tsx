import { motion } from 'framer-motion';
import { PencilIcon, TrashIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import type { Exercise } from '../../types';

interface ExerciseListProps {
  exercises: Exercise[];
  loading: boolean;
  handleEditExercise: (exercise: Exercise) => void;
  handleDeleteExercise: (id: string) => void;
  selectedDate: Date;
}

export default function ExerciseList({ exercises, loading, handleEditExercise, handleDeleteExercise, selectedDate }: ExerciseListProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 transition-all duration-200 hover:shadow-xl">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center mb-6">
        <ClipboardIcon className="h-6 w-6 mr-2 text-green-500" />
        Exercises for {selectedDate.toLocaleDateString()}
      </h2>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      ) : exercises.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No exercises recorded for this date.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Add your first exercise using the form.</p>
        </motion.div>
      ) : (
        <motion.div initial="hidden" animate="visible" exit="exit" className="space-y-4">
          {exercises.map((exercise) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 group"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-green-500 transition-colors duration-200">
                  {exercise.name}
                </h3>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEditExercise(exercise)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    title="Edit exercise"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteExercise(exercise.id)}
                    className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    title="Delete exercise"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>
              <div className="mt-2 space-y-2">
                {exercise.sets.map((set, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2"
                  >
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 dark:bg-green-800 text-green-500 dark:text-green-300 text-xs font-medium">
                      {index + 1}
                    </span>
                    <span>{set.reps} reps @ {set.weight.toFixed(2)}kg</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
} 