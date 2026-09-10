import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Utensils,
  Moon,
  CalendarDays,
  BarChart2,
  UserCircle,
  Dumbbell,
} from 'lucide-react';
import { useWorkoutStore } from '../stores/workoutStore';

const tabs = [
  { path: '/dashboard', label: 'Inicio', Icon: Flame },
  { path: '/dashboard/food', label: 'Comida', Icon: Utensils },
  { path: '/dashboard/sleep', label: 'Sueño', Icon: Moon },
  { path: '/dashboard/history', label: 'Historial', Icon: CalendarDays },
  { path: '/dashboard/stats', label: 'Stats', Icon: BarChart2 },
  { path: '/dashboard/profile', label: 'Perfil', Icon: UserCircle },
];


export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const workout = useWorkoutStore((s) => s.workout);

  // Highlight workout tab if session active
  const isWorkoutActive =
    workout !== null && workout.phase !== 'idle' && workout.phase !== 'finished';

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100">
      {/* ── Desktop Sidebar ─────────────────────────────────── */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-60 flex-col bg-zinc-900 border-r border-zinc-800 z-40">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-zinc-800">
          <h1 className="text-xl font-black text-zinc-50 tracking-tight uppercase">
            Fit<span className="text-lime-400">Track</span>
          </h1>
          <p className="text-[11px] text-zinc-600 mt-0.5 font-mono uppercase tracking-widest">
            v2.0
          </p>
        </div>

        {/* Active Workout Banner */}
        <AnimatePresence>
          {isWorkoutActive && (
            <motion.button
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onClick={() => navigate('/workout/active')}
              className="mx-3 mt-3 flex items-center gap-2 px-4 py-3 rounded-xl bg-lime-400/10 border border-lime-400/30 text-lime-400 text-sm font-bold hover:bg-lime-400/20 transition-colors"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-400" />
              </span>
              Sesión activa
            </motion.button>
          )}
        </AnimatePresence>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {tabs.map(({ path, label, Icon }) => {
            const isActive =
              path === '/dashboard'
                ? location.pathname === '/dashboard'
                : location.pathname.startsWith(path);
            return (
              <NavLink
                key={path}
                to={path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-lime-400/10 text-lime-400'
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                <Icon
                  size={18}
                  className={isActive ? 'text-lime-400' : 'text-zinc-600 group-hover:text-zinc-400'}
                />
                {label}
                {isActive && (
                  <div className="ml-auto w-1 h-4 rounded-full bg-lime-400" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Workout button */}
        <div className="px-3 pb-6">
          <button
            onClick={() => {
              if (isWorkoutActive) {
                navigate('/workout/active');
              } else {
                navigate('/dashboard');
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 font-black text-sm transition-all uppercase tracking-wide shadow-lg shadow-lime-400/20"
          >
            <Dumbbell size={16} />
            {isWorkoutActive ? 'Continuar' : 'Entrenar'}
          </button>
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────────────── */}
      <main className="md:ml-60 pb-24 md:pb-8">
        <div className="max-w-2xl mx-auto px-4 pt-6 md:pt-8 md:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ── Mobile Active Workout FAB ────────────────────────── */}
      <AnimatePresence>
        {isWorkoutActive && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => navigate('/workout/active')}
            className="md:hidden fixed bottom-24 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-lime-400 text-zinc-950 font-black text-sm shadow-xl shadow-lime-400/40"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-950 opacity-50" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-950" />
            </span>
            En curso
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Mobile Bottom Tab Bar ───────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800">
        <div className="flex items-center justify-around px-2 py-3">
          {tabs.map(({ path, label, Icon }) => {
            const isActive =
              path === '/dashboard'
                ? location.pathname === '/dashboard'
                : location.pathname.startsWith(path);
            return (
              <NavLink
                key={path}
                to={path}
                className="flex flex-col items-center gap-1 py-0.5 px-3"
              >
                <Icon
                  size={22}
                  className={`transition-colors ${isActive ? 'text-lime-400' : 'text-zinc-600'}`}
                />
                <span
                  className={`text-[10px] font-semibold transition-colors uppercase tracking-wider ${
                    isActive ? 'text-lime-400' : 'text-zinc-600'
                  }`}
                >
                  {label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
