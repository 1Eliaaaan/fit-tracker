import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Moon,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Clock,
  BatteryCharging,
  X,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthProvider';
import { fetchProfile } from '../services/workout.service';
import {
  upsertSleepLog,
  fetchSleepHistory,
  requestSleepFeedback,
} from '../services/sleep.service';
import { SLEEP_QUALITY_LABELS } from '../types';
import type { SleepQuality, SleepLog } from '../types';

export default function SleepPage() {
  const { user, session } = useAuth();
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [sleepHours, setSleepHours] = useState(7.5);
  const [quality, setQuality] = useState<SleepQuality>('good');
  const [bedTime, setBedTime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('06:30');
  const [notes, setNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // On-demand AI state
  const [isAiAdvising, setIsAiAdvising] = useState(false);
  const [aiFeedbackText, setAiFeedbackText] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Queries
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user?.id,
  });

  const { data: sleepHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ['sleep-history', user?.id],
    queryFn: () => fetchSleepHistory(user!.id, 30),
    enabled: !!user?.id,
  });

  // Check if selected date already has a log
  const existingLog = sleepHistory.find((s) => s.date === selectedDate);

  useEffect(() => {
    if (existingLog) {
      setSleepHours(existingLog.sleep_hours);
      setQuality(existingLog.quality);
      setBedTime(existingLog.bed_time || '23:00');
      setWakeTime(existingLog.wake_time || '06:30');
      setNotes(existingLog.notes || '');
    } else {
      setSleepHours(7.5);
      setQuality('good');
      setNotes('');
    }
  }, [existingLog, selectedDate]);

  // Mutation
  const saveSleepMutation = useMutation({
    mutationFn: async () => {
      return upsertSleepLog({
        userId: user!.id,
        date: selectedDate,
        sleepHours,
        quality,
        bedTime,
        wakeTime,
        notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sleep-history', user?.id] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const handleRequestFeedback = async () => {
    if (!user || !session) return;
    setIsAiAdvising(true);
    setFeedbackError(null);
    try {
      if (sleepHistory.length === 0) {
        setFeedbackError('Registra al menos una noche de sueño para que la IA pueda evaluar tu descanso.');
        setIsAiAdvising(false);
        return;
      }
      const feedback = await requestSleepFeedback({
        userId: user.id,
        profile: profile ?? null,
        recentSleep: sleepHistory.slice(-7),
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

  // Average calculation
  const last7Days = sleepHistory.slice(-7);
  const avgSleep = last7Days.length > 0
    ? (last7Days.reduce((acc, s) => acc + Number(s.sleep_hours), 0) / last7Days.length).toFixed(1)
    : null;

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
            <Moon className="w-6 h-6 text-lime-400" />
            Descanso & Sueño
          </h1>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-wider mt-1">
            Horas de descanso, recuperación y calidad de sueño
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

      {/* Average Banner */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-lime-400" /> Promedio 7 días
          </span>
          <span className="font-mono text-3xl font-black text-lime-400 mt-2">
            {avgSleep ? `${avgSleep}h` : '—'}
          </span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1">
            <BatteryCharging className="w-3.5 h-3.5 text-cyan-400" /> Estado del Día
          </span>
          <span className="font-mono text-xl font-bold text-zinc-200 mt-2">
            {existingLog ? '✓ Registrado' : 'Pendiente'}
          </span>
        </div>
      </div>

      {/* Sleep Logger Form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-6 mb-8 shadow-xl">
        <div className="flex items-center justify-between mb-5 border-b border-zinc-800 pb-3">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <Moon className="w-4 h-4 text-lime-400" /> Registro de Noche ({selectedDate})
          </h2>
          {saveSuccess && <span className="text-xs text-lime-400 font-mono">✓ Guardado</span>}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveSleepMutation.mutate();
          }}
          className="space-y-5"
        >
          {/* Hours Stepper */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 text-center">
              Horas de sueño totales
            </label>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setSleepHours((h) => Math.max(0, parseFloat((h - 0.5).toFixed(1))))}
                className="w-12 h-12 rounded-2xl bg-zinc-800 hover:bg-zinc-700 active:scale-90 font-bold text-xl text-white transition-all"
              >
                −
              </button>
              <div className="flex items-baseline gap-1 min-w-[5rem] justify-center">
                <span className="text-4xl font-mono font-black text-lime-400">{sleepHours}</span>
                <span className="text-sm font-bold text-zinc-500">HRS</span>
              </div>
              <button
                type="button"
                onClick={() => setSleepHours((h) => Math.min(24, parseFloat((h + 0.5).toFixed(1))))}
                className="w-12 h-12 rounded-2xl bg-zinc-800 hover:bg-zinc-700 active:scale-90 font-bold text-xl text-white transition-all"
              >
                +
              </button>
            </div>
          </div>

          {/* Sleep Quality Selector */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 text-center">
              Calidad del Descanso
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(SLEEP_QUALITY_LABELS) as SleepQuality[]).map((qKey) => {
                const info = SLEEP_QUALITY_LABELS[qKey];
                const isSelected = quality === qKey;
                return (
                  <button
                    key={qKey}
                    type="button"
                    onClick={() => setQuality(qKey)}
                    className={`py-3 px-2 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${
                      isSelected
                        ? 'border-lime-400 bg-lime-400/10 text-lime-400 shadow-md'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-2xl">{info.icon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bedtime & Wake Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                Hora de acostarse
              </label>
              <input
                type="time"
                value={bedTime}
                onChange={(e) => setBedTime(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 font-mono text-sm focus:outline-none focus:border-lime-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                Hora de despertar
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 font-mono text-sm focus:outline-none focus:border-lime-400"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
              Notas adicionales (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Me desperté 1 vez, tomé magnesio antes de dormir..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-lime-400"
            />
          </div>

          <button
            type="submit"
            disabled={saveSleepMutation.isPending}
            className="w-full bg-lime-400 hover:bg-lime-300 text-zinc-950 font-black py-4 rounded-2xl uppercase tracking-wider text-xs transition-colors shadow-lg shadow-lime-400/20 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            {saveSleepMutation.isPending ? 'Guardando...' : 'Guardar Registro de Sueño'}
          </button>
        </form>
      </div>

      {/* Sleep History List */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">
          Historial de Descanso Reciente
        </h2>

        {historyLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-zinc-900/60 rounded-2xl border border-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : sleepHistory.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-3xl p-8 text-center text-zinc-500 font-mono text-xs">
            Aún no has registrado noches de sueño. Guarda la de hoy para comenzar.
          </div>
        ) : (
          [...sleepHistory].reverse().slice(0, 14).map((log: SleepLog) => {
            const qualityInfo = SLEEP_QUALITY_LABELS[log.quality] || SLEEP_QUALITY_LABELS.good;
            const logDate = new Date(`${log.date}T12:00:00`);
            return (
              <div
                key={log.id}
                onClick={() => setSelectedDate(log.date)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedDate === log.date
                    ? 'border-lime-400 bg-lime-400/5'
                    : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{qualityInfo.icon}</span>
                  <div>
                    <span className="font-bold text-xs uppercase text-white block">
                      {new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).format(logDate)}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      Calidad: {qualityInfo.label}
                      {log.notes && ` · "${log.notes}"`}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-xl font-black text-lime-400">{log.sleep_hours}</span>
                  <span className="text-xs font-sans text-zinc-500 font-bold ml-1">HRS</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal for On-Demand AI Sleep Recovery Feedback */}
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
                      Análisis de Recuperación IA
                    </h3>
                    <p className="text-xs text-zinc-500 font-mono">
                      Feedback de descanso bajo demanda
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
