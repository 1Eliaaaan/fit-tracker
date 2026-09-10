import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar as CalendarIcon,
  Clock,
  Activity,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Bot,
  Dumbbell,
  ListFilter,
  ChevronLeft,
  ChevronRight,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthProvider';
import { fetchSessionHistory } from '../services/workout.service';

export default function HistoryPage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  // Calendar State
  const [currentCalendarDate, setCurrentCalendarDate] = useState(() => new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string | null>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const { data: sessions = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['sessions-history', user?.id],
    queryFn: () => fetchSessionHistory(user!.id, 100),
    enabled: !!user?.id,
  });

  // Group by week for list view
  const groupedSessions = useMemo(() => {
    return sessions.reduce((acc, session) => {
      const rawDate = session.started_at || session.created_at;
      const date = rawDate ? new Date(rawDate) : new Date();
      const validDate = isNaN(date.getTime()) ? new Date() : date;
      const now = new Date();
      const diffDays = Math.ceil(Math.abs(now.getTime() - validDate.getTime()) / (1000 * 60 * 60 * 24));

      let group = 'Más antiguo';
      if (diffDays <= 7) group = 'Esta semana';
      else if (diffDays <= 14) group = 'Semana pasada';

      if (!acc[group]) acc[group] = [];
      acc[group].push(session);
      return acc;
    }, {} as Record<string, any[]>);
  }, [sessions]);

  // Map of date string (YYYY-MM-DD) -> sessions[]
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, any[]>();
    sessions.forEach((s) => {
      const raw = s.started_at || s.created_at;
      if (raw) {
        const dStr = new Date(raw).toISOString().split('T')[0];
        if (!map.has(dStr)) map.set(dStr, []);
        map.get(dStr)!.push(s);
      }
    });
    return map;
  }, [sessions]);

  // Calendar month calculation
  const calendarYear = currentCalendarDate.getFullYear();
  const calendarMonth = currentCalendarDate.getMonth();

  const daysInMonth = useMemo(() => {
    return new Date(calendarYear, calendarMonth + 1, 0).getDate();
  }, [calendarYear, calendarMonth]);

  // Day of week of the 1st of month (0 = Sun, 1 = Mon ... adjust to Mon = 0)
  const firstDayOfWeek = useMemo(() => {
    const d = new Date(calendarYear, calendarMonth, 1).getDay();
    return d === 0 ? 6 : d - 1; // 0 for Monday, 6 for Sunday
  }, [calendarYear, calendarMonth]);

  const monthName = useMemo(() => {
    return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(currentCalendarDate);
  }, [currentCalendarDate]);

  const handlePrevMonth = () => {
    setCurrentCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const selectedDaySessions = selectedCalendarDay ? (sessionsByDate.get(selectedCalendarDay) ?? []) : [];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-6 pb-24 font-sans max-w-2xl mx-auto">
      {/* Header */}
      <header className="mb-6 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-lime-400" />
            Historial de Sesiones
          </h1>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-wider mt-1">
            Registro cronológico y calendario de entrenamientos
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                viewMode === 'list'
                  ? 'bg-zinc-800 text-lime-400 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              Lista
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                viewMode === 'calendar'
                  ? 'bg-zinc-800 text-lime-400 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Calendario
            </button>
          </div>

          {/* Refresh button */}
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-lime-400 active:scale-95 transition-all"
            title="Recargar historial"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin text-lime-400' : ''}`} />
          </button>
        </div>
      </header>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-zinc-900/60 rounded-2xl border border-zinc-800/80 animate-pulse" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-3xl p-10 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 flex items-center justify-center text-zinc-600 mb-4">
            <Dumbbell className="w-8 h-8" />
          </div>
          <h3 className="font-black text-zinc-200 uppercase text-base mb-1">Aún no hay entrenamientos</h3>
          <p className="text-xs text-zinc-500 max-w-xs font-mono">
            Inicia tu primer entrenamiento desde la pantalla de Inicio para que tus métricas y análisis de IA aparezcan aquí.
          </p>
        </div>
      ) : viewMode === 'calendar' ? (
        // ─────────────────────────────────────────────────────────────
        // CALENDAR VIEW
        // ─────────────────────────────────────────────────────────────
        <div className="space-y-6">
          {/* Month Navigator */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <h2 className="text-base font-black uppercase text-white tracking-wide capitalize">
                {monthName}
              </h2>

              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Day of Week Headers (Mon - Sun) */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => (
                <span key={i} className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                  {d}
                </span>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Empty leading cells */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-12 md:h-14" />
              ))}

              {/* Days of month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const hasSession = sessionsByDate.has(dateStr);
                const isSelected = selectedCalendarDay === dateStr;
                const isToday = dateStr === new Date().toISOString().split('T')[0];

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedCalendarDay(dateStr)}
                    className={`h-12 md:h-14 rounded-2xl flex flex-col items-center justify-center relative transition-all border ${
                      isSelected
                        ? 'border-lime-400 bg-lime-400/20 text-lime-400 font-black'
                        : hasSession
                        ? 'border-lime-400/40 bg-zinc-800/90 text-white hover:border-lime-400'
                        : 'border-transparent bg-zinc-950/40 text-zinc-500 hover:bg-zinc-800/40 hover:text-zinc-300'
                    }`}
                  >
                    <span className={`text-xs font-mono font-bold ${isToday ? 'underline decoration-lime-400 underline-offset-2' : ''}`}>
                      {dayNum}
                    </span>

                    {/* Workout Indicator Flame / Dot */}
                    {hasSession && (
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <Flame className="w-3 h-3 text-lime-400 fill-lime-400" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Details */}
          {selectedCalendarDay && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-lime-400" />
                  {new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(
                    new Date(`${selectedCalendarDay}T12:00:00`)
                  )}
                </h3>
                <span className="text-[11px] font-mono text-zinc-500">
                  {selectedDaySessions.length} {selectedDaySessions.length === 1 ? 'sesión' : 'sesiones'}
                </span>
              </div>

              {selectedDaySessions.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center text-zinc-500 font-mono text-xs">
                  No hay entrenamientos registrados en esta fecha.
                </div>
              ) : (
                selectedDaySessions.map((session: any) => renderSessionCard(session, expandedSessionId, setExpandedSessionId))
              )}
            </div>
          )}
        </div>
      ) : (
        // ─────────────────────────────────────────────────────────────
        // LIST VIEW (Semanal)
        // ─────────────────────────────────────────────────────────────
        <div className="space-y-8">
          {Object.entries(groupedSessions).map(([group, groupSessions]) => (
            <div key={group}>
              <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3 px-1">
                {group}
              </h2>
              <div className="space-y-3">
                {groupSessions.map((session: any) => renderSessionCard(session, expandedSessionId, setExpandedSessionId))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Reusable Session Card with Accordion & Details
// ─────────────────────────────────────────────────────────────
function renderSessionCard(
  session: any,
  expandedId: string | null,
  setExpandedId: (id: string | null) => void
) {
  const rawDate = session.started_at || session.created_at;
  const date = rawDate ? new Date(rawDate) : new Date();
  const validDate = isNaN(date.getTime()) ? new Date() : date;
  const isExpanded = expandedId === session.id;

  const exercisesList = session.session_exercises ?? session.exercises ?? [];
  const totalVolume = exercisesList.reduce(
    (acc: number, ex: any) =>
      acc +
      (ex.exercise_sets ?? ex.sets ?? []).reduce(
        (sAcc: number, set: any) => sAcc + (set.reps ?? 0) * (set.weight_kg ?? 0),
        0
      ),
    0
  );
  const totalSets = exercisesList.reduce(
    (acc: number, ex: any) => acc + (ex.exercise_sets ?? ex.sets ?? []).length,
    0
  );
  const durationMins = Math.max(1, Math.round((session.duration_secs ?? 0) / 60));

  const aiSummary = Array.isArray(session.session_ai_summary)
    ? session.session_ai_summary[0]
    : session.session_ai_summary;

  return (
    <div
      key={session.id}
      className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 rounded-2xl p-4 md:p-5 transition-all"
    >
      {/* Card Header */}
      <div
        onClick={() => setExpandedId(isExpanded ? null : session.id)}
        className="flex justify-between items-start cursor-pointer select-none"
      >
        <div className="flex-1 min-w-0 pr-3">
          <h3 className="font-black text-zinc-100 uppercase tracking-tight text-sm md:text-base capitalize">
            {new Intl.DateTimeFormat('es-ES', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }).format(validDate)}
          </h3>
          <div className="flex items-center gap-3 text-zinc-500 text-xs font-mono mt-1.5 flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-zinc-400" /> {durationMins}m
            </span>
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-zinc-400" /> {exercisesList.length} ej.
            </span>
            <span className="text-zinc-600">·</span>
            <span>{totalSets} series</span>
          </div>
        </div>

        <div className="text-right flex items-center gap-3">
          <div>
            <span className="block font-mono text-xl font-black text-lime-400">
              {totalVolume.toLocaleString()}
            </span>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
              KG VOL
            </span>
          </div>
          <div className="p-1 text-zinc-500">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Exercise names tags */}
      {exercisesList.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-zinc-800/80">
          {exercisesList.map((ex: any, idx: number) => (
            <span
              key={idx}
              className="text-[11px] font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md"
            >
              {ex.exercise_name}
            </span>
          ))}
        </div>
      )}

      {/* AI Summary Snippet (if exists) */}
      {aiSummary?.summary_text && (
        <div className="mt-3 p-3 rounded-xl bg-lime-400/5 border border-lime-400/20 text-xs text-zinc-300 flex items-start gap-2">
          <Bot className="w-4 h-4 text-lime-400 flex-shrink-0 mt-0.5" />
          <p className="line-clamp-2 italic leading-relaxed">
            "{aiSummary.summary_text}"
          </p>
        </div>
      )}

      {/* Expanded Sets Breakdown */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 pt-3 border-t border-zinc-800 space-y-3 overflow-hidden"
          >
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
              Detalle del entrenamiento:
            </span>
            {exercisesList.map((ex: any, exIdx: number) => {
              const sets = ex.exercise_sets ?? ex.sets ?? [];
              return (
                <div key={exIdx} className="bg-zinc-950/80 rounded-xl p-3 border border-zinc-800/60">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-xs text-white uppercase">{ex.exercise_name}</span>
                    <span className="text-[10px] font-mono text-lime-400 bg-lime-400/10 px-1.5 py-0.5 rounded">
                      {ex.category}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {sets.map((s: any, sIdx: number) => (
                      <div key={sIdx} className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2 py-1 rounded">
                        <span className="text-zinc-600 mr-1">#{s.set_number || sIdx + 1}</span>
                        <span className="text-zinc-200 font-bold">{s.reps}r</span> × <span className="text-zinc-200 font-bold">{s.weight_kg}kg</span>
                        {s.rest_secs != null && (
                          <span className="text-cyan-400/80 text-[10px] block">⏱ {s.rest_secs}s</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
