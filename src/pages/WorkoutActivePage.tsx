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
  Trash2,
  List,
} from 'lucide-react';
import { useWorkoutStore } from '../stores/workoutStore';
import { useTimerStore } from '../stores/timerStore';
import { useAuth } from '../contexts/AuthProvider';
import { fetchLastExercisePerformance } from '../services/workout.service';
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
    deleteSet,
  } = useWorkoutStore();

  const { seconds, start, pause, reset, syncElapsed } = useTimerStore();

  // Sincronizar y reanudar descanso ante recargas en móviles con poca RAM
  useEffect(() => {
    if (workout?.phase === 'resting') {
      syncElapsed();
      start();
    }
  }, [workout?.phase, syncElapsed, start]);
  const { user } = useAuth();
  const [lastPerformance, setLastPerformance] = useState<any>(null);
  const phase = workout?.phase ?? 'idle';

  useEffect(() => {
    if (phase === 'executing_set' && user) {
      const activeEx = getCurrentExercise();
      if (activeEx) {
        fetchLastExercisePerformance(user.id, activeEx.exerciseId).then(res => {
          setLastPerformance(res);
        });
      }
    } else if (phase !== 'resting') {
      setLastPerformance(null);
    }
  }, [phase, workout?.currentExerciseIndex, user, getCurrentExercise]);

  // Selection state
  const [selectedCategory, setSelectedCategory] = useState<MuscleGroup | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Set inputs for current set
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(0);
  const [unit, setUnit] = useState<'kg' | 'lb'>(() => (localStorage.getItem('fit-tracker-unit') as 'kg' | 'lb') || 'kg');

  const handleToggleUnit = () => {
    const newUnit = unit === 'kg' ? 'lb' : 'kg';
    setUnit(newUnit);
    localStorage.setItem('fit-tracker-unit', newUnit);
    if (newUnit === 'lb') {
      setWeight((w) => parseFloat((w * 2.20462).toFixed(2)));
    } else {
      setWeight((w) => parseFloat((w * 0.45359237).toFixed(2)));
    }
  };

  // Set editing state
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null);
  const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null);
  const [editReps, setEditReps] = useState(10);
  const [editWeight, setEditWeight] = useState(0);
  const [editRest, setEditRest] = useState<number | null>(null);

  // Modals state
  const [showSessionHistory, setShowSessionHistory] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

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
        setWeight(unit === 'lb' ? parseFloat((last.weight_kg * 2.20462).toFixed(2)) : last.weight_kg);
      }
    }
  }, [phase, getCurrentExercise, unit]);

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
  const handleOpenEditSet = (exerciseIndex: number, setIndex: number, s: ActiveSet) => {
    setEditingExerciseIndex(exerciseIndex);
    setEditingSetIndex(setIndex);
    setEditReps(s.reps);
    setEditWeight(unit === 'lb' ? parseFloat((s.weight_kg * 2.20462).toFixed(2)) : s.weight_kg);
    setEditRest(s.rest_secs);
  };

  const handleSaveEditedSet = () => {
    if (editingSetIndex !== null && editingExerciseIndex !== null) {
      const finalWeightKg = unit === 'lb' ? parseFloat((editWeight * 0.45359237).toFixed(2)) : editWeight;
      editSet(
        editingExerciseIndex,
        editingSetIndex,
        editReps,
        finalWeightKg,
        editRest
      );
      setEditingSetIndex(null);
      setEditingExerciseIndex(null);
    }
  };

  const renderEditModal = () => (
    <AnimatePresence>
      {editingSetIndex !== null && editingExerciseIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
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
                  {workout?.exercises[editingExerciseIndex]?.exerciseName}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingSetIndex(null);
                  setEditingExerciseIndex(null);
                }}
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
                  <button onClick={() => setEditReps((r) => Math.max(0, r - 1))} className="w-9 h-9 rounded-lg bg-zinc-700 text-white font-bold">−</button>
                  <input type="number" value={editReps} onChange={(e) => setEditReps(Math.max(0, parseInt(e.target.value) || 0))} className="w-full text-center bg-transparent font-mono text-xl font-bold text-lime-400 focus:outline-none" />
                  <button onClick={() => setEditReps((r) => r + 1)} className="w-9 h-9 rounded-lg bg-zinc-700 text-white font-bold">+</button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                  Peso ({unit.toUpperCase()})
                </label>
                <div className="flex items-center gap-1 bg-zinc-800 rounded-xl p-1">
                  <button onClick={() => setEditWeight((w) => Math.max(0, parseFloat((w - 2.5).toFixed(2))))} className="w-9 h-9 rounded-lg bg-zinc-700 text-white font-bold">−</button>
                  <input type="number" step="0.5" value={editWeight} onChange={(e) => setEditWeight(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full text-center bg-transparent font-mono text-xl font-bold text-lime-400 focus:outline-none" />
                  <button onClick={() => setEditWeight((w) => parseFloat((w + 2.5).toFixed(2)))} className="w-9 h-9 rounded-lg bg-zinc-700 text-white font-bold">+</button>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                Descanso tomado (segundos)
              </label>
              <div className="flex items-center gap-2">
                <input type="number" value={editRest ?? 0} onChange={(e) => setEditRest(Math.max(0, parseInt(e.target.value) || 0))} className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl py-2.5 px-3 text-sm font-mono text-white focus:outline-none focus:border-lime-400" placeholder="Segundos" />
                <button onClick={() => setEditRest((r) => Math.max(0, (r ?? 0) - 15))} className="px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-mono">-15s</button>
                <button onClick={() => setEditRest((r) => (r ?? 0) + 15)} className="px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-mono">+15s</button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  if (window.confirm("¿Seguro que deseas eliminar esta serie?")) {
                    deleteSet(editingExerciseIndex, editingSetIndex);
                    setEditingSetIndex(null);
                    setEditingExerciseIndex(null);
                  }
                }}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-3.5 rounded-xl transition-colors" title="Eliminar serie"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={() => { setEditingSetIndex(null); setEditingExerciseIndex(null); }} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-3.5 rounded-xl uppercase text-xs">
                Volver
              </button>
              <button onClick={handleSaveEditedSet} className="flex-1 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-black py-3.5 rounded-xl uppercase text-xs shadow-md shadow-lime-400/20">
                Guardar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const renderSessionHistoryModal = () => (
    <AnimatePresence>
      {showSessionHistory && workout?.exercises && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="bg-zinc-950 border-t md:border border-zinc-800 w-full h-[85vh] md:h-auto md:max-h-[85vh] max-w-2xl md:rounded-3xl flex flex-col shadow-2xl"
          >
            <div className="flex-shrink-0 flex items-center justify-between border-b border-zinc-800 p-4 md:p-6">
              <div>
                <h3 className="font-black text-white uppercase text-lg flex items-center gap-2">
                  <List className="w-5 h-5 text-lime-400" />
                  Ejercicios en Sesión
                </h3>
                <p className="text-xs text-zinc-500 font-mono mt-1">
                  Revisa o edita lo que has hecho hoy
                </p>
              </div>
              <button onClick={() => setShowSessionHistory(false)} className="p-2 text-zinc-500 hover:text-white bg-zinc-900 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {workout.exercises.length === 0 ? (
                <div className="text-center text-zinc-500 font-mono py-10">No has iniciado ningún ejercicio aún.</div>
              ) : (
                workout.exercises.map((ex, exIdx) => (
                  <div key={ex.tempId} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-white">{ex.exerciseName}</h4>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{ex.category}</span>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm("¿Seguro que deseas eliminar este ejercicio por completo?")) {
                            const { deleteExercise } = useWorkoutStore.getState();
                            deleteExercise(exIdx);
                          }
                        }}
                        className="text-red-400 hover:text-red-300 p-1 bg-red-400/10 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {ex.sets.length === 0 ? (
                      <p className="text-xs text-zinc-600 font-mono italic">Sin series registradas</p>
                    ) : (
                      <div className="space-y-1.5">
                        {ex.sets.map((s, setIdx) => (
                          <div
                            key={setIdx}
                            onClick={() => handleOpenEditSet(exIdx, setIdx, s)}
                            className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 cursor-pointer active:scale-[0.99] transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded bg-zinc-700 text-lime-400 font-mono font-bold text-[10px] flex items-center justify-center">
                                S{setIdx + 1}
                              </span>
                              <div className="font-mono text-xs">
                                <span className="text-white font-bold">{s.reps}</span> <span className="text-zinc-500">×</span> <span className="text-white font-bold">{s.weight_kg}kg</span>
                              </div>
                            </div>
                            <Pencil className="w-3.5 h-3.5 text-zinc-500" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const renderFinishConfirmModal = () => (
    <AnimatePresence>
      {showFinishConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl"
          >
            <div className="w-16 h-16 rounded-full bg-lime-400/10 border border-lime-400/30 flex items-center justify-center text-lime-400 mx-auto mb-4">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-xl font-black text-white uppercase mb-2">¿Finalizar Entrenamiento?</h3>
            <p className="text-sm text-zinc-400 mb-6">
              Has completado {workout?.exercises.length || 0} ejercicios en esta sesión. ¿Estás listo para ver tu resumen?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3.5 rounded-xl text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowFinishConfirm(false);
                  finishWorkout();
                }}
                className="flex-1 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-black py-3.5 rounded-xl uppercase text-sm shadow-lg shadow-lime-400/20 transition-all"
              >
                Finalizar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );



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
      <>
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
              <button
                onClick={() => setShowSessionHistory(true)}
                className="text-xs font-mono text-lime-400 bg-lime-400/10 border border-lime-400/30 px-3 py-1.5 rounded-full hover:bg-lime-400/20 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <List className="w-3.5 h-3.5" />
                {workout.exercises.length} en sesión
              </button>
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
                  onClick={() => setShowFinishConfirm(true)}
                  className="w-full bg-lime-400 border border-lime-500 hover:bg-lime-300 text-zinc-950 font-black py-4 rounded-2xl uppercase tracking-wider text-sm shadow-xl shadow-lime-400/20 transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5 stroke-[3]" />
                  Finalizar Sesión ({workout.exercises.length} ejercicios)
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      {renderSessionHistoryModal()}
      {renderEditModal()}
      {renderFinishConfirmModal()}
      </>
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
      <>
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

            {/* Progression Indicator: Last Session Data */}
            {lastPerformance && lastPerformance.exercise_sets?.length > 0 && (
              <div className="mt-4 p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-left">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <TimerIcon className="w-3.5 h-3.5" />
                    Entreno Anterior
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {new Date(lastPerformance.workout_sessions.started_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lastPerformance.exercise_sets.map((s: any, i: number) => (
                    <div key={i} className={`flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded-lg border ${currentSetNum === s.set_number ? 'border-lime-400/50 bg-lime-400/10 text-lime-400' : 'border-zinc-800 bg-zinc-800/50 text-zinc-300'}`}>
                      <span className="font-bold opacity-60">S{s.set_number}</span>
                      <span>{s.reps}×{s.weight_kg}kg</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center relative">
              <div className="flex items-center justify-between w-full mb-3">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Peso
                </span>
                <button
                  onClick={handleToggleUnit}
                  className="px-2 py-0.5 rounded-md bg-zinc-800 text-[10px] font-bold uppercase text-zinc-300 hover:text-lime-400 border border-zinc-700"
                >
                  {unit}
                </button>
              </div>
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
              <span className="text-[9px] text-zinc-600 font-mono mt-1">paso: ±2.5 {unit}</span>
            </div>
          </div>

          {/* Primary Action Button: Completar Serie & Iniciar Cronómetro */}
          <button
            onClick={() => {
              const finalWeightKg = unit === 'lb' ? parseFloat((weight * 0.45359237).toFixed(2)) : weight;
              completeSet(reps, finalWeightKg);
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
                    onClick={() => handleOpenEditSet(workout.currentExerciseIndex, idx, s)}
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
              onClick={() => {
                if (window.confirm("¿Deseas guardar la serie actual antes de terminar el ejercicio?")) {
                  const finalWeightKg = unit === 'lb' ? parseFloat((weight * 0.45359237).toFixed(2)) : weight;
                  completeSet(reps, finalWeightKg);
                }
                finishCurrentExercise();
              }}
              className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 font-bold py-3.5 rounded-xl uppercase text-xs tracking-wider transition-colors"
            >
              Terminar {activeEx.exerciseName} →
            </button>
          </div>

        </motion.div>
      </AnimatePresence>
      {renderSessionHistoryModal()}
      {renderEditModal()}
      {renderFinishConfirmModal()}
      </>
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
      <>
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
              onClick={() => setShowFinishConfirm(true)}
              className="w-full bg-lime-400 hover:bg-lime-300 text-zinc-950 font-black py-4 rounded-2xl uppercase tracking-wider text-sm flex items-center justify-center gap-2 shadow-lg shadow-lime-400/20 transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              Finalizar entrenamiento y ver resumen
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
      {renderFinishConfirmModal()}
      </>
    );
  }

  return null;
}
