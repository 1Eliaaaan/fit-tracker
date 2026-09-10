import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Utensils,
  Send,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Flame,
  X,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthProvider';
import { fetchProfile } from '../services/workout.service';
import {
  logMealWithAI,
  fetchMealsByDate,
  fetchRecentMeals,
  deleteMealLog,
  requestNutritionFeedback,
} from '../services/nutrition.service';
import { MEAL_TYPE_LABELS } from '../types';
import type { NutritionLog } from '../types';


export default function FoodPage() {
  const { user, session } = useAuth();
  const queryClient = useQueryClient();

  // Date selection (default today YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [mealInput, setMealInput] = useState('');
  const [isAiAdvising, setIsAiAdvising] = useState(false);
  const [aiFeedbackText, setAiFeedbackText] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Queries
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user?.id,
  });

  const { data: meals = [], isLoading: mealsLoading } = useQuery({
    queryKey: ['meals', user?.id, selectedDate],
    queryFn: () => fetchMealsByDate(user!.id, selectedDate),
    enabled: !!user?.id,
  });

  // Mutation to add meal with natural language AI parsing
  const addMealMutation = useMutation({
    mutationFn: async (text: string) => {
      return logMealWithAI({
        rawText: text,
        userId: user!.id,
        date: selectedDate,
        accessToken: session?.access_token ?? '',
      });
    },
    onSuccess: () => {
      setMealInput('');
      queryClient.invalidateQueries({ queryKey: ['meals', user?.id, selectedDate] });
    },
  });

  // Mutation to delete meal
  const deleteMealMutation = useMutation({
    mutationFn: (id: string) => deleteMealLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals', user?.id, selectedDate] });
    },
  });

  const handleSendMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealInput.trim() || addMealMutation.isPending) return;
    addMealMutation.mutate(mealInput.trim());
  };

  const handleRequestFeedback = async () => {
    if (!user || !session) return;
    setIsAiAdvising(true);
    setFeedbackError(null);
    try {
      const recent = await fetchRecentMeals(user.id, 7);
      if (recent.length === 0) {
        setFeedbackError('Registra al menos una comida para que la IA pueda analizar tu nutrición.');
        setIsAiAdvising(false);
        return;
      }
      const feedback = await requestNutritionFeedback({
        userId: user.id,
        profile: profile ?? null,
        recentMeals: recent,
        accessToken: session.access_token,
      });
      setAiFeedbackText(feedback);
    } catch (err: any) {
      console.error(err);
      setFeedbackError('No se pudo obtener el análisis. Verifica tu conexión y la Edge Function.');
    } finally {
      setIsAiAdvising(false);
    }
  };

  // Daily totals
  const totalCalories = meals.reduce((acc, m) => acc + (m.total_calories || 0), 0);
  const totalProtein = meals.reduce((acc, m) => acc + Number(m.protein_g || 0), 0);
  const totalCarbs = meals.reduce((acc, m) => acc + Number(m.carbs_g || 0), 0);
  const totalFat = meals.reduce((acc, m) => acc + Number(m.fat_g || 0), 0);

  // Date Navigation Helpers
  const handlePrevDay = () => {
    const d = new Date(`${selectedDate}T12:00:00`);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(`${selectedDate}T12:00:00`);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-6 pb-24 font-sans max-w-2xl mx-auto">
      {/* Header */}
      <header className="mb-6 flex flex-col sm:flex-row justify-between sm:items-end gap-3">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Utensils className="w-6 h-6 text-lime-400" />
            Nutrición & Comida
          </h1>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-wider mt-1">
            Registro libre conversacional con IA
          </p>
        </div>

        <button
          onClick={handleRequestFeedback}
          disabled={isAiAdvising}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-lime-400 to-lime-500 text-zinc-950 font-black px-4 py-2.5 rounded-xl uppercase text-xs tracking-wider shadow-lg shadow-lime-400/20 active:scale-95 transition-all disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {isAiAdvising ? 'Analizando...' : 'Pedir Análisis IA'}
        </button>
      </header>

      {/* Date Navigator */}
      <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl p-3 mb-6">
        <button
          onClick={handlePrevDay}
          className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <span className="text-sm font-black uppercase text-white tracking-wide block">
            {isToday
              ? 'Hoy'
              : new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'short' }).format(
                  new Date(`${selectedDate}T12:00:00`)
                )}
          </span>
          <span className="text-[10px] font-mono text-zinc-500">{selectedDate}</span>
        </div>

        <button
          onClick={handleNextDay}
          className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Macros & Calories Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-lime-400" /> Totales del Día
          </span>
          <span className="font-mono text-2xl font-black text-lime-400">
            {totalCalories} <span className="text-xs font-sans text-zinc-500 font-bold">KCAL</span>
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-2.5">
            <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Proteína</span>
            <span className="font-mono text-lg font-black text-cyan-400">{totalProtein.toFixed(0)}g</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-2.5">
            <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Carbos</span>
            <span className="font-mono text-lg font-black text-amber-400">{totalCarbs.toFixed(0)}g</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-2.5">
            <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Grasas</span>
            <span className="font-mono text-lg font-black text-purple-400">{totalFat.toFixed(0)}g</span>
          </div>
        </div>
      </div>

      {/* Free-form Conversational Input */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 md:p-5 mb-8 shadow-xl">
        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Bot className="w-4 h-4 text-lime-400" /> ¿Qué comiste? Cuéntale a la app:
        </label>
        <form onSubmit={handleSendMeal} className="space-y-3">
          <textarea
            value={mealInput}
            onChange={(e) => setMealInput(e.target.value)}
            placeholder="Ej: Hoy de almuerzo comí 200g de arroz, 150g de carne asada, ensalada verde con aguacate y jugo de maracuyá..."
            rows={3}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-lime-400/60 transition-colors resize-none"
          />

          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-zinc-500">
              La IA detecta automáticamente la comida, calorías y macros.
            </span>
            <button
              type="submit"
              disabled={!mealInput.trim() || addMealMutation.isPending}
              className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 disabled:opacity-40 text-zinc-950 font-black px-5 py-2.5 rounded-xl uppercase text-xs tracking-wider transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              {addMealMutation.isPending ? 'Estructurando con IA...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>

      {/* Logged Meals List */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">
          Comidas Registradas ({meals.length})
        </h2>

        {mealsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 bg-zinc-900/60 border border-zinc-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : meals.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-3xl p-8 text-center text-zinc-500 font-mono text-xs">
            No has registrado comidas para este día. Usa el cuadro de arriba para escribir lo que comiste.
          </div>
        ) : (
          meals.map((meal: NutritionLog) => {
            const typeInfo = MEAL_TYPE_LABELS[meal.meal_type] || MEAL_TYPE_LABELS.otro;
            return (
              <div
                key={meal.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-5 flex flex-col gap-3 relative group"
              >
                {/* Meal Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{typeInfo.icon}</span>
                    <span className="font-black text-sm uppercase text-white tracking-wide">
                      {typeInfo.label}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {new Date(meal.created_at).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-black text-lime-400">
                      {meal.total_calories} kcal
                    </span>
                    <button
                      onClick={() => deleteMealMutation.mutate(meal.id)}
                      className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors"
                      title="Eliminar registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Raw Text Quote */}
                <p className="text-xs text-zinc-400 italic bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/60">
                  "{meal.raw_text}"
                </p>

                {/* Structured Breakdown Items */}
                {meal.parsed_items && meal.parsed_items.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {meal.parsed_items.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-mono bg-zinc-800/80 text-zinc-300 px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                      >
                        <span className="font-bold text-white">{item.name}</span>
                        {item.portion && <span className="text-zinc-500">({item.portion})</span>}
                        <span className="text-lime-400 font-bold">~{item.calories}kcal</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Macros Breakdown Pills */}
                <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500 pt-1 border-t border-zinc-800/60">
                  <span>P: <strong className="text-cyan-400">{meal.protein_g}g</strong></span>
                  <span>C: <strong className="text-amber-400">{meal.carbs_g}g</strong></span>
                  <span>G: <strong className="text-purple-400">{meal.fat_g}g</strong></span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal for On-Demand AI Feedback */}
      <AnimatePresence>
        {(aiFeedbackText || feedbackError) && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-lime-400/10 text-lime-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-white uppercase text-base">
                      Análisis Nutricional IA
                    </h3>
                    <p className="text-xs text-zinc-500 font-mono">
                      Feedback personalizado bajo demanda
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setAiFeedbackText(null);
                    setFeedbackError(null);
                  }}
                  className="p-1 text-zinc-500 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {feedbackError ? (
                <p className="text-xs font-mono text-amber-400 bg-amber-400/10 p-3 rounded-xl border border-amber-400/20">
                  {feedbackError}
                </p>
              ) : (
                <div className="text-sm text-zinc-300 leading-relaxed space-y-2 max-h-80 overflow-y-auto pr-1">
                  <p className="whitespace-pre-line border-l-2 border-lime-400/40 pl-3">
                    {aiFeedbackText}
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  setAiFeedbackText(null);
                  setFeedbackError(null);
                }}
                className="w-full bg-lime-400 hover:bg-lime-300 text-zinc-950 font-black py-3.5 rounded-xl uppercase text-xs tracking-wider transition-colors"
              >
                Entendido
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
