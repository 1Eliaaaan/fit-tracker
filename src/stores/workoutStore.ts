import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ActiveWorkout, ActiveExercise, ActiveSet, WorkoutPhase } from '../types';
import type { ExerciseInfo } from '../data/exercises';

interface WorkoutStore {
  workout: ActiveWorkout | null;

  // Acciones principales
  startWorkout: () => void;
  finishWorkout: () => void;
  cancelWorkout: () => void;

  // Gestión de ejercicios
  addExercise: (exercise: ExerciseInfo) => void;
  finishCurrentExercise: () => void;

  // Gestión de series
  completeSet: (reps: number, weight_kg: number) => void;
  finishRest: (rest_secs: number) => void;
  editSet: (exerciseIndex: number, setIndex: number, reps: number, weight_kg: number, rest_secs?: number | null) => void;

  // Navegación de fase
  setPhase: (phase: WorkoutPhase) => void;
  goToExerciseSelection: () => void;

  // Utilidades
  getCurrentExercise: () => ActiveExercise | null;
  getCurrentSet: () => ActiveSet | null;
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      workout: null,

      startWorkout: () => {
        set({
          workout: {
            sessionId: null,
            startedAt: new Date(),
            exercises: [],
            currentExerciseIndex: 0,
            currentSetIndex: 0,
            phase: 'selecting_exercise',
          },
        });
      },

      finishWorkout: () => {
        set((state) => ({
          workout: state.workout
            ? { ...state.workout, phase: 'finished' }
            : null,
        }));
      },

      cancelWorkout: () => {
        set({ workout: null });
      },

      addExercise: (exercise: ExerciseInfo) => {
        set((state) => {
          if (!state.workout) return state;
          const newExercise: ActiveExercise = {
            tempId: crypto.randomUUID(),
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            category: exercise.category,
            sets: [],
            orderIndex: state.workout.exercises.length,
          };
          const exercises = [...state.workout.exercises, newExercise];
          return {
            workout: {
              ...state.workout,
              exercises,
              currentExerciseIndex: exercises.length - 1,
              currentSetIndex: 0,
              phase: 'executing_set',
            },
          };
        });
      },

      finishCurrentExercise: () => {
        set((state) => {
          if (!state.workout) return state;
          return {
            workout: {
              ...state.workout,
              phase: 'exercise_done',
            },
          };
        });
      },

      completeSet: (reps: number, weight_kg: number) => {
        set((state) => {
          if (!state.workout) return state;
          const { exercises, currentExerciseIndex, currentSetIndex } = state.workout;
          const exercise = exercises[currentExerciseIndex];
          if (!exercise) return state;

          const newSet: ActiveSet = {
            setNumber: currentSetIndex + 1,
            reps,
            weight_kg,
            rest_secs: null,
            completed: true,
          };

          const updatedSets = [...exercise.sets];
          updatedSets[currentSetIndex] = newSet;

          const updatedExercises = [...exercises];
          updatedExercises[currentExerciseIndex] = { ...exercise, sets: updatedSets };

          return {
            workout: {
              ...state.workout,
              exercises: updatedExercises,
              phase: 'resting',
            },
          };
        });
      },

      finishRest: (rest_secs: number) => {
        set((state) => {
          if (!state.workout) return state;
          const { exercises, currentExerciseIndex, currentSetIndex } = state.workout;
          const exercise = exercises[currentExerciseIndex];
          if (!exercise) return state;

          // Guarda el descanso en la serie actual
          const updatedSets = [...exercise.sets];
          if (updatedSets[currentSetIndex]) {
            updatedSets[currentSetIndex] = { ...updatedSets[currentSetIndex], rest_secs };
          }

          const updatedExercises = [...exercises];
          updatedExercises[currentExerciseIndex] = { ...exercise, sets: updatedSets };

          return {
            workout: {
              ...state.workout,
              exercises: updatedExercises,
              currentSetIndex: currentSetIndex + 1,
              phase: 'executing_set',
            },
          };
        });
      },

      editSet: (exerciseIndex: number, setIndex: number, reps: number, weight_kg: number, rest_secs?: number | null) => {
        set((state) => {
          if (!state.workout) return state;
          const exercises = [...state.workout.exercises];
          const exercise = exercises[exerciseIndex];
          if (!exercise) return state;

          const updatedSets = [...exercise.sets];
          if (updatedSets[setIndex]) {
            updatedSets[setIndex] = {
              ...updatedSets[setIndex],
              reps,
              weight_kg,
              ...(rest_secs !== undefined ? { rest_secs } : {}),
            };
          }
          exercises[exerciseIndex] = { ...exercise, sets: updatedSets };

          return { workout: { ...state.workout, exercises } };
        });
      },


      setPhase: (phase: WorkoutPhase) => {
        set((state) => ({
          workout: state.workout ? { ...state.workout, phase } : null,
        }));
      },

      goToExerciseSelection: () => {
        set((state) => ({
          workout: state.workout
            ? { ...state.workout, phase: 'selecting_exercise' }
            : null,
        }));
      },

      getCurrentExercise: () => {
        const { workout } = get();
        if (!workout) return null;
        return workout.exercises[workout.currentExerciseIndex] ?? null;
      },

      getCurrentSet: () => {
        const { workout } = get();
        if (!workout) return null;
        const ex = workout.exercises[workout.currentExerciseIndex];
        if (!ex) return null;
        return ex.sets[workout.currentSetIndex] ?? null;
      },
    }),
    {
      name: 'fittrack-active-workout',
      // Solo persistimos el workout activo (por si el usuario cierra accidentalmente)
      partialize: (state) => ({ workout: state.workout }),
    }
  )
);
