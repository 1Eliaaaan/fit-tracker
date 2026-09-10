import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Check,
  Timer as TimerIcon,
  Dumbbell,
  ArrowLeft,
  Pencil,
  X,
  Flame,
} from 'lucide-react';
import { useWorkoutStore } from '../stores/workoutStore';
import { useTimerStore } from '../stores/timerStore';
import {
  ALL_MUSCLE_GROUPS,
  MUSCLE_GROUP_ICONS,
  getExercisesByCategory,
  searchExercises
} from '../data/exercises';

import type { ExerciseInfo, MuscleGroup } from '../data/exercises';
import type { ActiveSet } from '../types';

const variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.15 } },
};

function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function WorkoutActivePage() {
  const navigate = useNavigate();
  const {
    workout,
    addExercise,
    completeSet,
    finishRest,
    finishCurrentExercise,
    finishWorkout,
    goToExerciseSelection,
    getCurrentExercise,
    editSet,
  } = useWorkoutStore();

  const { seconds, start, pause, reset, syncElapsed } = useTimerStore();

  // Sincronizar y reanudar descanso ante recargas en móviles con poca RAM
  useEffect(() => {
    if (workout?.phase === 'resting') {
      syncElapsed();
      start();
    }
  }, [workout?.phase, syncElapsed, start]);

  // Selection state
  const [selectedCategory, setSelectedCategory] = useState<MuscleGroup | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Set inputs for current set
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(0);

  // Set editing state
  const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null);
  const [editReps, setEditReps] = useState(10);
  const [editWeight, setEditWeight] = useState(0);
  const [editRest, setEditRest] = useState<number | null>(null);

  const phase = workout?.phase ?? 'idle';

  // Guard back navigation
  useEffect(() => {
    window.history.pushState(null, '', window.location.pathname);
    const handler = () => {
      if (window.confirm('¿Seguro que deseas salir del entrenamiento activo?')) {
        navigate('/dashboard', { replace: true });
      } else {
        window.history.pushState(null, '', window.location.pathname);
      }
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [navigate]);

  // Pre-fill reps & weight from last completed set
  useEffect(() => {
    if (phase === 'executing_set') {
      const ex = getCurrentExercise();
      if (ex && ex.sets.length > 0) {
        const last = ex.sets[ex.sets.length - 1];
        setReps(last.reps);
        setWeight(last.weight_kg);
      }
    }
  }, [phase, getCurrentExercise]);

  // Navigate to summary when finished
  useEffect(() => {
    if (phase === 'finished') {
      navigate('/workout/summary', { replace: true });
    }
  }, [phase, navigate]);

  if (!workout) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-6 gap-4">
        <Dumbbell className="w-12 h-12 text-zinc-600 animate-pulse" />
        <p className="text-zinc-500 font-mono uppercase text-sm">No hay entrenamiento en curso</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-lime-400 text-zinc-950 font-black px-6 py-3 rounded-xl uppercase tracking-wider"
        >
          Ir al Inicio
        </button>
      </div>
    );
  }

  // Open set editor
  const handleOpenEditSet = (index: number, s: ActiveSet) => {
    setEditingSetIndex(index);
    setEditReps(s.reps);
    setEditWeight(s.weight_kg);
    setEditRest(s.rest_secs);
  };

  const handleSaveEditedSet = () => {
    if (editingSetIndex !== null) {
      editSet(
        workout.currentExerciseIndex,
        editingSetIndex,
        editReps,
        editWeight,
        editRest
      );
      setEditingSetIndex(null);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 1. SELECTING EXERCISE (Category vs Specific search)
  // ─────────────────────────────────────────────────────────────
  if (phase === 'selecting_exercise') {
    let exercisesToShow: ExerciseInfo[] = [];
    if (searchQuery.trim()) {
      exercisesToShow = searchExercises(searchQuery);
    } else if (selectedCategory) {
      exercisesToShow = getExercisesByCategory(selectedCategory);
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="selecting"
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="min-h-screen bg-zinc-950 text-zinc-100 p-4 max-w-2xl mx-auto flex flex-col gap-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-lime-400" />
                ¿Qué entrenamos hoy?
              </h1>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                Selecciona por categoría o busca un ejercicio específico
              </p>
            </div>
            {workout.exercises.length > 0 && (
              <span className="text-xs font-mono text-lime-400 bg-lime-400/10 border border-lime-400/30 px-2.5 py-1 rounded-full">
                {workout.exercises.length} en sesión
              </span>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Escribe: press inclinado, sentadilla..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-10 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-lime-400/60 transition-colors"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value) setSelectedCategory(null);
              }}
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Content: If not searching and no category selected -> Category Grid */}
          {!searchQuery.trim() && !selectedCategory && (
            <div className="flex-1 overflow-y-auto pb-24">
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-3 px-1">
                Selecciona una Categoría Muscular
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                {ALL_MUSCLE_GROUPS.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-lime-400/50 hover:bg-zinc-850 active:scale-95 transition-all text-center group"
                  >
                    <span className="text-3xl mb-1.5 group-hover:scale-110 transition-transform">
                      {MUSCLE_GROUP_ICONS[cat] || '💪'}
                    </span>
                    <span className="text-xs font-bold text-zinc-200 uppercase tracking-wide">
                      {cat}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content: If category selected or searching -> Exercise List */}
          {(selectedCategory || searchQuery.trim()) && (
            <div className="flex-1 overflow-y-auto pb-28">
              {selectedCategory && !searchQuery.trim() && (
                <div className="flex items-center justify-between mb-3 px-1">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="flex items-center gap-1.5 text-xs text-lime-400 font-bold hover:underline"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Todas las categorías
                  </button>
                  <span className="text-xs font-mono text-zinc-500">
                    {MUSCLE_GROUP_ICONS[selectedCategory]} {selectedCategory} ({exercisesToShow.length})
                  </span>
                </div>
              )}

              {exercisesToShow.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 font-mono text-sm">
                  No se encontraron ejercicios coincidentes.
                </div>
              ) : (
                <div className="space-y-2">
                  {exercisesToShow.map((ex) => (
                    <button
                      key={ex.id}
                      onClick={() => addExercise(ex)}
                      className="w-full bg-zinc-900 border border-zinc-800 hover:border-lime-400/50 hover:bg-zinc-850 rounded-2xl p-4 flex items-center justify-between text-left transition-all active:scale-[0.99] group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{ex.icon || '🏋️'}</span>
                        <div>
                          <p className="font-bold text-zinc-100 text-sm group-hover:text-lime-400 transition-colors">
                            {ex.name}
                          </p>
                          <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2 pr-2">
                            {ex.description}
                          </p>
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-zinc-800 text-lime-400 group-hover:bg-lime-400 group-hover:text-zinc-950 transition-colors flex-shrink-0">
                        <Plus className="w-4 h-4" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bottom Bar: Terminar entrenamiento if at least 1 exercise is already logged */}
          {workout.exercises.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent">
              <div className="max-w-2xl mx-auto">
                <button
                  onClick={() => finishWorkout()}
                  className="w-full bg-zinc-800 border border-zinc-700 hover:bg-zinc-750 text-zinc-100 font-black py-3.5 rounded-2xl uppercase tracking-wider text-sm transition-all"
                >
                  Finalizar Sesión ({workout.exercises.length} ejercicios)
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. EXECUTING SET
  // ─────────────────────────────────────────────────────────────
  if (phase === 'executing_set') {
    const activeEx = getCurrentExercise();
    if (!activeEx) return null;
    const currentSetNum = activeEx.sets.length + 1;

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="executing"
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="min-h-screen bg-zinc-950 text-zinc-100 p-4 max-w-lg mx-auto flex flex-col gap-5 pb-12"
        >
          {/* Header */}
          <div className="pt-2 text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-lime-400 font-mono text-xs uppercase tracking-wider font-bold mb-2">
              {activeEx.category}
            </span>
            <h1 className="text-2xl font-black uppercase text-white tracking-tight leading-tight">
              {activeEx.exerciseName}
            </h1>

            {/* Set indicator */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="text-xs font-mono uppercase text-zinc-400 font-bold">
                Serie actual:
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-lime-400 text-zinc-950 font-mono font-black text-sm">
                #{currentSetNum}
              </span>
              {activeEx.sets.length > 0 && (
                <span className="text-xs font-mono text-zinc-600">
                  ({activeEx.sets.length} finiquitadas)
                </span>
              )}
            </div>
          </div>

          {/* Controls: Reps & Weight */}
          <div className="grid grid-cols-2 gap-3">
            {/* Reps */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
                Repeticiones
              </span>
              <div className="flex items-center gap-2 w-full justify-between">
                <button
                  onClick={() => setReps((r) => Math.max(0, r - 1))}
                  className="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-90 flex items-center justify-center font-bold text-xl text-zinc-200 transition-transform"
                >
                  −
                </button>
                <input
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-16 bg-transparent text-center text-3xl font-mono font-black text-lime-400 focus:outline-none"
                />
                <button
                  onClick={() => setReps((r) => r + 1)}
                  className="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-90 flex items-center justify-center font-bold text-xl text-zinc-200 transition-transform"
                >
                  +
                </button>
              </div>
            </div>

            {/* Weight */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
                Peso (KG)
              </span>
              <div className="flex items-center gap-2 w-full justify-between">
                <button
                  onClick={() => setWeight((w) => Math.max(0, parseFloat((w - 2.5).toFixed(2))))}
                  className="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-90 flex items-center justify-center font-bold text-xl text-zinc-200 transition-transform"
                >
                  −
                </button>
                <input
                  type="number"
                  step="0.5"
                  value={weight}
                  onChange={(e) => setWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-16 bg-transparent text-center text-3xl font-mono font-black text-lime-400 focus:outline-none"
                />
                <button
                  onClick={() => setWeight((w) => parseFloat((w + 2.5).toFixed(2)))}
                  className="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-90 flex items-center justify-center font-bold text-xl text-zinc-200 transition-transform"
                >
                  +
                </button>
              </div>
              <span className="text-[9px] text-zinc-600 font-mono mt-1">paso: ±2.5 kg</span>
            </div>
          </div>

          {/* Primary Action Button: Completar Serie & Iniciar Cronómetro */}
          <button
            onClick={() => {
              completeSet(reps, weight);
              reset();
              start();
            }}
            className="w-full bg-lime-400 hover:bg-lime-300 text-zinc-950 font-black text-lg py-5 rounded-2xl uppercase tracking-wider shadow-lg shadow-lime-400/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            Fin Serie #{currentSetNum} → Descanso
          </button>

          {/* Completed Sets Section with Editing */}
          {activeEx.sets.length > 0 && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Series finiquitadas ({activeEx.sets.length})
                </span>
                <span className="text-[10px] font-mono text-zinc-600">
                  Toca para editar
                </span>
              </div>

              <div className="space-y-1.5">
                {activeEx.sets.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleOpenEditSet(idx, s)}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 cursor-pointer active:scale-[0.99] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-zinc-800 text-lime-400 font-mono font-bold text-xs flex items-center justify-center">
                        S{idx + 1}
                      </span>
                      <div className="font-mono text-sm">
                        <span className="text-white font-bold">{s.reps} reps</span>
                        <span className="text-zinc-600 mx-1.5">×</span>
                        <span className="text-white font-bold">{s.weight_kg} kg</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {s.rest_secs != null && (
                        <span className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <TimerIcon className="w-3 h-3" />
                          {s.rest_secs}s
                        </span>
                      )}
                      <Pencil className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-200" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Finish Exercise Button */}
          <div className="pt-2">
            <button
              onClick={finishCurrentExercise}
              className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 font-bold py-3.5 rounded-xl uppercase text-xs tracking-wider transition-colors"
            >
              Terminar {activeEx.exerciseName} →
            </button>
          </div>

          {/* Modal to edit completed series */}
          <AnimatePresence>
            {editingSetIndex !== null && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40 }}
                  className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl p-6 space-y-5"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div>
                      <h3 className="font-black text-white uppercase text-base">
                        Editar Serie #{editingSetIndex + 1}
                      </h3>
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">
                        {activeEx.exerciseName}
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingSetIndex(null)}
                      className="p-1 text-zinc-500 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-amber-400/90 font-mono bg-amber-400/10 p-2.5 rounded-xl border border-amber-400/20">
                    Nota: Al editar una serie finalizada solo se corrigen valores registrados; el cronómetro permanece inactivo.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                        Reps
                      </label>
                      <div className="flex items-center gap-1 bg-zinc-800 rounded-xl p-1">
                        <button
                          onClick={() => setEditReps((r) => Math.max(0, r - 1))}
                          className="w-9 h-9 rounded-lg bg-zinc-700 text-white font-bold"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={editReps}
                          onChange={(e) => setEditReps(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full text-center bg-transparent font-mono text-xl font-bold text-lime-400 focus:outline-none"
                        />
                        <button
                          onClick={() => setEditReps((r) => r + 1)}
                          className="w-9 h-9 rounded-lg bg-zinc-700 text-white font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                        Peso (kg)
                      </label>
                      <div className="flex items-center gap-1 bg-zinc-800 rounded-xl p-1">
                        <button
                          onClick={() => setEditWeight((w) => Math.max(0, parseFloat((w - 2.5).toFixed(2))))}
                          className="w-9 h-9 rounded-lg bg-zinc-700 text-white font-bold"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          step="0.5"
                          value={editWeight}
                          onChange={(e) => setEditWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full text-center bg-transparent font-mono text-xl font-bold text-lime-400 focus:outline-none"
                        />
                        <button
                          onClick={() => setEditWeight((w) => parseFloat((w + 2.5).toFixed(2)))}
                          className="w-9 h-9 rounded-lg bg-zinc-700 text-white font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                      Descanso tomado (segundos)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editRest ?? 0}
                        onChange={(e) => setEditRest(Math.max(0, parseInt(e.target.value) || 0))}
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl py-2.5 px-3 text-sm font-mono text-white focus:outline-none focus:border-lime-400"
                        placeholder="Segundos"
                      />
                      <button
                        onClick={() => setEditRest((r) => Math.max(0, (r ?? 0) - 15))}
                        className="px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-mono"
                      >
                        -15s
                      </button>
                      <button
                        onClick={() => setEditRest((r) => (r ?? 0) + 15)}
                        className="px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-mono"
                      >
                        +15s
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setEditingSetIndex(null)}
                      className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-3.5 rounded-xl uppercase text-xs"
                    >
                      ← Volver a la serie actual
                    </button>
                    <button
                      onClick={handleSaveEditedSet}
                      className="flex-1 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-black py-3.5 rounded-xl uppercase text-xs shadow-md shadow-lime-400/20"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. RESTING PHASE (Cronómetro de descanso)
  // ─────────────────────────────────────────────────────────────
  if (phase === 'resting') {
    const activeEx = getCurrentExercise();
    const lastSet = activeEx?.sets[activeEx.sets.length - 1];

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="resting"
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="min-h-screen bg-zinc-950 text-zinc-100 p-4 max-w-lg mx-auto flex flex-col items-center justify-between pb-12"
        >
          {/* Top Info */}
          <div className="w-full pt-4 text-center">
            <span className="text-xs font-mono uppercase text-zinc-500 font-bold">
              {activeEx?.exerciseName}
            </span>
            {lastSet && (
              <div className="mt-2 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 font-mono text-xs">
                <span className="text-lime-400 font-bold">✓ Serie #{activeEx.sets.length} completada</span>
                <span className="text-zinc-600">·</span>
                <span className="text-zinc-300">{lastSet.reps} reps × {lastSet.weight_kg} kg</span>
              </div>
            )}
          </div>

          {/* Huge Timer Circle */}
          <div className="flex flex-col items-center justify-center my-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-4">
              Cronómetro de descanso
            </span>
            <div className="relative flex items-center justify-center">
              <div className="absolute w-56 h-56 rounded-full border-2 border-lime-400/25 animate-ping-slow" />
              <div className="w-52 h-52 rounded-full bg-zinc-900 border-2 border-lime-400/40 flex flex-col items-center justify-center shadow-2xl shadow-lime-400/10">
                <span className="text-6xl font-mono font-black text-lime-400 tabular tracking-tight">
                  {formatTime(seconds)}
                </span>
                <span className="text-[11px] font-mono text-zinc-500 uppercase mt-1">
                  transcurrido
                </span>
              </div>
            </div>
            <p className="text-xs text-zinc-500 font-mono mt-6 flex items-center gap-1.5">
              <TimerIcon className="w-3.5 h-3.5 text-cyan-400" />
              Al parar el cronómetro se pasa a la siguiente serie
            </p>
          </div>

          {/* Actions */}
          <div className="w-full space-y-3">
            <button
              onClick={() => {
                pause();
                finishRest(seconds);
              }}
              className="w-full bg-lime-400 hover:bg-lime-300 text-zinc-950 font-black text-lg py-5 rounded-2xl uppercase tracking-wider shadow-xl shadow-lime-400/25 active:scale-[0.98] transition-all"
            >
              ⏹ Parar descanso e iniciar Serie #{((activeEx?.sets.length ?? 0) + 1)}
            </button>

            <button
              onClick={() => {
                pause();
                finishRest(seconds);
                finishCurrentExercise();
              }}
              className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 font-bold py-3 rounded-xl uppercase text-xs tracking-wider transition-colors"
            >
              Terminar ejercicio ahora
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 4. EXERCISE DONE (Decidir siguiente o terminar)
  // ─────────────────────────────────────────────────────────────
  if (phase === 'exercise_done') {
    const activeEx = getCurrentExercise();

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="done"
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="min-h-screen bg-zinc-950 text-zinc-100 p-4 max-w-md mx-auto flex flex-col items-center justify-center gap-6"
        >
          <div className="w-20 h-20 rounded-full bg-lime-400/10 border border-lime-400/30 flex items-center justify-center text-lime-400 mb-1">
            <Check className="w-10 h-10 stroke-[3]" />
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-black uppercase text-white tracking-tight leading-tight">
              ¡Ejercicio Finiquitado!
            </h2>
            {activeEx && (
              <p className="text-zinc-400 text-sm mt-1">
                {activeEx.exerciseName} · <span className="font-mono text-lime-400">{activeEx.sets.length} series</span>
              </p>
            )}
          </div>

          <div className="w-full space-y-3 mt-4">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery('');
                goToExerciseSelection();
              }}
              className="w-full bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-white font-bold py-4 rounded-2xl uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4 text-lime-400" />
              Pasar al siguiente ejercicio
            </button>

            <button
              onClick={() => finishWorkout()}
              className="w-full bg-lime-400 hover:bg-lime-300 text-zinc-950 font-black py-4 rounded-2xl uppercase tracking-wider text-sm flex items-center justify-center gap-2 shadow-lg shadow-lime-400/20 transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              Finalizar entrenamiento y ver resumen
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return null;
}
