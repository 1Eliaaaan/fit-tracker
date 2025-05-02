import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Set, Exercise } from '../../types';

export default function ExerciseForm({
  isCustomExercise,
  setIsCustomExercise,
  exerciseSets,
  handleAddSet,
  handleRemoveSet,
  handleSetChange,
  handleAddExercise,
  handleUpdateExercise,
  handleCancelEdit,
  isSubmitting,
  editingExercise,
  PRESET_EXERCISES,
}: {
  isCustomExercise: boolean;
  setIsCustomExercise: (b: boolean) => void;
  exerciseSets: Set[];
  handleAddSet: () => void;
  handleRemoveSet: (index: number) => void;
  handleSetChange: (index: number, field: 'reps' | 'weight', value: string) => void;
  handleAddExercise: (e: React.FormEvent<HTMLFormElement>) => void;
  handleUpdateExercise: (e: React.FormEvent<HTMLFormElement>) => void;
  handleCancelEdit: () => void;
  isSubmitting: boolean;
  editingExercise: Exercise | null;
  PRESET_EXERCISES: string[];
}) {
  return (
    <form onSubmit={editingExercise ? handleUpdateExercise : handleAddExercise} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Exercise Name
        </label>
        <div className="mt-1 flex flex-col sm:flex-row items-start sm:items-center gap-2">
          {isCustomExercise ? (
            <input
              type="text"
              name="name"
              id="name"
              required
              placeholder="e.g. Cable Tricep Pushdown"
              className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
            />
          ) : (
            <select
              name="name"
              id="name"
              required
              className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
            >
              <option value="">Select an exercise</option>
              {PRESET_EXERCISES.map((exercise) => (
                <option key={exercise} value={exercise}>
                  {exercise}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={() => setIsCustomExercise(!isCustomExercise)}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 border border-green-600 dark:border-green-400 rounded-lg"
          >
            {isCustomExercise ? "Use preset" : "Custom"}
          </button>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Sets</h4>
          <button
            type="button"
            onClick={handleAddSet}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-lg text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Set
          </button>
        </div>
        {exerciseSets.map((set, index) => (
          <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex-shrink-0">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 text-sm font-medium">
                {index + 1}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 flex-grow w-full">
              <div>
                <label htmlFor={`reps-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reps
                </label>
                <input
                  type="number"
                  id={`reps-${index}`}
                  value={set.reps || ''}
                  onChange={(e) => handleSetChange(index, 'reps', e.target.value)}
                  min="0"
                  placeholder="Reps"
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
                />
              </div>
              <div>
                <label htmlFor={`weight-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  id={`weight-${index}`}
                  value={set.weight || ''}
                  onChange={(e) => handleSetChange(index, 'weight', e.target.value)}
                  step="any"
                  min="0"
                  placeholder="Weight"
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
                />
              </div>
            </div>
            {exerciseSets.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveSet(index)}
                className="flex-shrink-0 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-2"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </div>
          ) : (
            <span>{editingExercise ? 'Update Exercise' : 'Add Exercise'}</span>
          )}
        </button>
        {editingExercise && (
          <button
            type="button"
            onClick={handleCancelEdit}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
} 