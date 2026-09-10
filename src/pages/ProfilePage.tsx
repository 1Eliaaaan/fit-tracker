import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LogOut, User as UserIcon, Scale, Calendar, Target, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthProvider';
import { fetchProfile, upsertProfile, upsertBodyWeight, fetchBodyWeightHistory } from '../services/workout.service';
import { GOAL_LABELS, FITNESS_LABELS } from '../types';

function calculateAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user?.id,
  });

  const { data: weights = [] } = useQuery({
    queryKey: ['body-weights', user?.id],
    queryFn: () => fetchBodyWeightHistory(user!.id, 30),
    enabled: !!user?.id,
  });

  const [currentLogWeight, setCurrentLogWeight] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const updateProfileMutation = useMutation({
    mutationFn: (updates: any) => upsertProfile(user!.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const logWeightMutation = useMutation({
    mutationFn: (w: number) => upsertBodyWeight(user!.id, w, new Date().toISOString().split('T')[0]),
    onSuccess: (data) => {
      setCurrentLogWeight('');
      queryClient.invalidateQueries({ queryKey: ['body-weights', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      // update current_weight in profile
      updateProfileMutation.mutate({ current_weight: data.weight_kg });
    },
  });

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const updates = Object.fromEntries(fd.entries());
    updateProfileMutation.mutate({
      ...updates,
      height_cm: updates.height_cm ? Number(updates.height_cm) : null,
      initial_weight: updates.initial_weight ? Number(updates.initial_weight) : null,
      current_weight: updates.current_weight ? Number(updates.current_weight) : null,
      birth_date: updates.birth_date ? String(updates.birth_date) : null,
    });
  };

  const handleLogWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(currentLogWeight);
    if (!isNaN(w) && w > 0) {
      logWeightMutation.mutate(w);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-zinc-500 font-mono text-sm">
        Cargando perfil...
      </div>
    );
  }

  const age = calculateAge(profile?.birth_date ?? null);
  const latestLoggedWeight = weights.length > 0 ? weights[weights.length - 1].weight_kg : profile?.current_weight;
  const initialWeight = profile?.initial_weight;
  const weightChange = latestLoggedWeight && initialWeight ? (latestLoggedWeight - initialWeight).toFixed(1) : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-6 pb-24 font-sans max-w-2xl mx-auto">
      {/* Profile Header */}
      <header className="mb-6 flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
        <div className="w-16 h-16 bg-lime-400 rounded-2xl flex items-center justify-center text-zinc-950 font-black text-2xl uppercase shadow-lg shadow-lime-400/20 flex-shrink-0">
          {profile?.display_name ? profile.display_name[0] : (user?.email?.[0] || <UserIcon />)}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-black uppercase tracking-tight text-white truncate">
            {profile?.display_name || user?.email?.split('@')[0]}
          </h1>
          <p className="text-zinc-500 font-mono text-xs truncate mt-0.5">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            {age !== null && (
              <span className="text-[11px] font-mono text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded-md">
                {age} años
              </span>
            )}
            {profile?.fitness_level && (
              <span className="text-[11px] font-mono text-lime-400 bg-lime-400/10 border border-lime-400/30 px-2 py-0.5 rounded-md">
                {FITNESS_LABELS[profile.fitness_level]}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Progress Cards: Peso Inicial vs Actual */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 text-center">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
            Peso Inicial
          </span>
          <span className="font-mono text-xl font-black text-zinc-200">
            {initialWeight ? `${initialWeight}kg` : '—'}
          </span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 text-center">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
            Peso Actual
          </span>
          <span className="font-mono text-xl font-black text-lime-400">
            {latestLoggedWeight ? `${latestLoggedWeight}kg` : '—'}
          </span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 text-center">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
            Evolución
          </span>
          <span className={`font-mono text-xl font-black ${
            weightChange && parseFloat(weightChange) > 0 ? 'text-amber-400' : 'text-cyan-400'
          }`}>
            {weightChange ? `${parseFloat(weightChange) > 0 ? '+' : ''}${weightChange}kg` : '—'}
          </span>
        </div>
      </div>

      {/* Fast Daily Weight Log */}
      <section className="mb-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Scale className="w-4 h-4 text-lime-400" /> Registrar Peso de Hoy
        </h2>
        <form onSubmit={handleLogWeight} className="flex gap-2">
          <input
            type="number"
            step="0.1"
            value={currentLogWeight}
            onChange={(e) => setCurrentLogWeight(e.target.value)}
            placeholder="Ej: 78.5"
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 font-mono text-sm focus:outline-none focus:border-lime-400/50"
          />
          <button
            type="submit"
            disabled={logWeightMutation.isPending || !currentLogWeight}
            className="bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-zinc-950 font-black px-5 py-3 rounded-xl uppercase text-xs tracking-wider transition-colors"
          >
            {logWeightMutation.isPending ? 'Guardando...' : 'Registrar'}
          </button>
        </form>
      </section>

      {/* Complete Profile Form */}
      <section className="mb-8 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-6">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-5 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-lime-400" /> Información Personal y Objetivos
          </span>
          {saveSuccess && (
            <span className="text-xs text-lime-400 font-mono">✓ Guardado</span>
          )}
        </h2>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
              Nombre / Apodo
            </label>
            <input
              name="display_name"
              defaultValue={profile?.display_name || ''}
              placeholder="Tu nombre"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-lime-400/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-zinc-500" /> Fecha de Nacimiento
              </label>
              <input
                type="date"
                name="birth_date"
                defaultValue={profile?.birth_date || ''}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 font-mono text-sm focus:outline-none focus:border-lime-400/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                Altura (cm)
              </label>
              <input
                type="number"
                name="height_cm"
                defaultValue={profile?.height_cm || ''}
                placeholder="175"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 font-mono text-sm focus:outline-none focus:border-lime-400/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                Peso Inicial (kg)
              </label>
              <input
                type="number"
                step="0.1"
                name="initial_weight"
                defaultValue={profile?.initial_weight || ''}
                placeholder="75.0"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 font-mono text-sm focus:outline-none focus:border-lime-400/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                Peso Objetivo o Actual (kg)
              </label>
              <input
                type="number"
                step="0.1"
                name="current_weight"
                defaultValue={latestLoggedWeight || profile?.current_weight || ''}
                placeholder="80.0"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 font-mono text-sm focus:outline-none focus:border-lime-400/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <Target className="w-3 h-3 text-zinc-500" /> Objetivo Principal
              </label>
              <select
                name="goal"
                defaultValue={profile?.goal || 'gain_muscle'}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-lime-400/50"
              >
                {Object.entries(GOAL_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <Award className="w-3 h-3 text-zinc-500" /> Nivel de Experiencia
              </label>
              <select
                name="fitness_level"
                defaultValue={profile?.fitness_level || 'intermediate'}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-lime-400/50"
              >
                {Object.entries(FITNESS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="w-full bg-zinc-800 hover:bg-zinc-750 text-white font-black py-4 rounded-2xl uppercase tracking-wider text-xs transition-colors mt-2 border border-zinc-700"
          >
            {updateProfileMutation.isPending ? 'Guardando datos...' : 'Actualizar Información de Perfil'}
          </button>
        </form>
      </section>

      {/* Sign Out */}
      <button
        onClick={() => signOut()}
        className="w-full flex items-center justify-center gap-2 text-red-400 font-bold uppercase py-4 border border-red-500/20 rounded-2xl hover:bg-red-500/10 text-xs tracking-wider transition-colors"
      >
        <LogOut className="w-4 h-4" /> Cerrar Sesión
      </button>
    </div>
  );
}
