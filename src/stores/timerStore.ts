import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TimerStore {
  seconds: number;
  isRunning: boolean;
  restStartedAt: number | null; // Timestamp en milisegundos

  start: () => void;
  pause: () => void;
  reset: () => void;
  syncElapsed: () => number;
  getElapsed: () => number;
}

let activeInterval: ReturnType<typeof setInterval> | null = null;

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      seconds: 0,
      isRunning: false,
      restStartedAt: null,

      start: () => {
        const state = get();
        let startTime = state.restStartedAt;

        // Si no se había iniciado, marcar el timestamp actual
        if (!startTime || !state.isRunning) {
          startTime = Date.now() - (state.seconds * 1000);
          set({ restStartedAt: startTime, isRunning: true });
        }

        if (activeInterval) clearInterval(activeInterval);

        // Actualizar cada segundo basándose en la diferencia de tiempo real
        activeInterval = setInterval(() => {
          const currentStartTime = get().restStartedAt;
          if (currentStartTime) {
            const elapsed = Math.max(0, Math.floor((Date.now() - currentStartTime) / 1000));
            set({ seconds: elapsed });
          }
        }, 1000);
      },

      pause: () => {
        if (activeInterval) {
          clearInterval(activeInterval);
          activeInterval = null;
        }
        const state = get();
        if (state.restStartedAt) {
          const elapsed = Math.max(0, Math.floor((Date.now() - state.restStartedAt) / 1000));
          set({ isRunning: false, seconds: elapsed });
        } else {
          set({ isRunning: false });
        }
      },

      reset: () => {
        if (activeInterval) {
          clearInterval(activeInterval);
          activeInterval = null;
        }
        set({ seconds: 0, isRunning: false, restStartedAt: null });
      },

      // Sincroniza los segundos transcurridos si el navegador se reinició o estuvo en segundo plano
      syncElapsed: () => {
        const state = get();
        if (state.isRunning && state.restStartedAt) {
          const elapsed = Math.max(0, Math.floor((Date.now() - state.restStartedAt) / 1000));
          set({ seconds: elapsed });
          return elapsed;
        }
        return state.seconds;
      },

      getElapsed: () => get().seconds,
    }),
    {
      name: 'fittrack-active-timer',
      partialize: (state) => ({
        seconds: state.seconds,
        isRunning: state.isRunning,
        restStartedAt: state.restStartedAt,
      }),
      onRehydrateStorage: () => (state) => {
        // Al recargar la página en móviles con poca RAM, reanudar el cronómetro si estaba activo
        if (state && state.isRunning && state.restStartedAt) {
          const elapsed = Math.max(0, Math.floor((Date.now() - state.restStartedAt) / 1000));
          state.seconds = elapsed;
          state.start();
        }
      },
    }
  )
);
