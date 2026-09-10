-- ═══════════════════════════════════════════════════════════════
--  FitTrack v2 — Schema Migration (Idempotente / Seguro)
--  Copia y pega este script completo en el SQL Editor de Supabase
-- ═══════════════════════════════════════════════════════════════

-- Habilitar extensiones necesarias
create extension if not exists "uuid-ossp";
create extension if not exists vector; -- pgvector para embeddings de OpenAI

-- ─────────────────────────────────────────────────────────────
-- 1. PROFILES — datos del usuario
-- ─────────────────────────────────────────────────────────────
create table if not exists profiles (
  id              uuid references auth.users on delete cascade primary key,
  display_name    text,
  birth_date      date,
  height_cm       decimal(5,2),
  initial_weight  decimal(5,2),
  current_weight  decimal(5,2),
  goal            text check (goal in ('lose_weight','gain_muscle','maintain','strength','endurance')),
  fitness_level   text check (fitness_level in ('beginner','intermediate','advanced')),
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null
);

-- Si la tabla profiles ya existía con menos columnas, agregarlas de forma segura:
alter table profiles add column if not exists display_name text;
alter table profiles add column if not exists birth_date date;
alter table profiles add column if not exists height_cm decimal(5,2);
alter table profiles add column if not exists initial_weight decimal(5,2);
alter table profiles add column if not exists current_weight decimal(5,2);
alter table profiles add column if not exists goal text;
alter table profiles add column if not exists fitness_level text;

-- Función y trigger para crear perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Políticas RLS para profiles
alter table profiles enable row level security;
drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────
-- 2. WORKOUT SESSIONS — cada sesión de entrenamiento
-- ─────────────────────────────────────────────────────────────
create table if not exists workout_sessions (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references auth.users on delete cascade not null,
  started_at      timestamptz not null default now(),
  finished_at     timestamptz,
  duration_secs   integer,
  notes           text,
  created_at      timestamptz default now() not null
);

create index if not exists workout_sessions_user_id_idx on workout_sessions(user_id);
create index if not exists workout_sessions_started_at_idx on workout_sessions(started_at desc);

alter table workout_sessions enable row level security;
drop policy if exists "Users can view own sessions" on workout_sessions;
create policy "Users can view own sessions" on workout_sessions for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own sessions" on workout_sessions;
create policy "Users can insert own sessions" on workout_sessions for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own sessions" on workout_sessions;
create policy "Users can update own sessions" on workout_sessions for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own sessions" on workout_sessions;
create policy "Users can delete own sessions" on workout_sessions for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 3. SESSION_EXERCISES — ejercicios dentro de una sesión
-- ─────────────────────────────────────────────────────────────
create table if not exists session_exercises (
  id              uuid default gen_random_uuid() primary key,
  session_id      uuid references workout_sessions on delete cascade not null,
  user_id         uuid references auth.users on delete cascade not null,
  exercise_id     text not null,
  exercise_name   text not null,
  category        text not null,
  order_index     integer not null default 0,
  created_at      timestamptz default now() not null
);

create index if not exists session_exercises_session_id_idx on session_exercises(session_id);
create index if not exists session_exercises_user_id_idx on session_exercises(user_id);

alter table session_exercises enable row level security;
drop policy if exists "Users can view own session_exercises" on session_exercises;
create policy "Users can view own session_exercises" on session_exercises for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own session_exercises" on session_exercises;
create policy "Users can insert own session_exercises" on session_exercises for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own session_exercises" on session_exercises;
create policy "Users can update own session_exercises" on session_exercises for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own session_exercises" on session_exercises;
create policy "Users can delete own session_exercises" on session_exercises for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 4. EXERCISE_SETS — series individuales (1 fila = 1 serie)
-- ─────────────────────────────────────────────────────────────
create table if not exists exercise_sets (
  id                  uuid default gen_random_uuid() primary key,
  session_exercise_id uuid references session_exercises on delete cascade not null,
  user_id             uuid references auth.users on delete cascade not null,
  set_number          integer not null,
  reps                integer,
  weight_kg           decimal(6,2),
  duration_secs       integer,
  rest_secs           integer,
  rpe                 integer check (rpe between 1 and 10),
  notes               text,
  created_at          timestamptz default now() not null
);

create index if not exists exercise_sets_session_exercise_id_idx on exercise_sets(session_exercise_id);
create index if not exists exercise_sets_user_id_idx on exercise_sets(user_id);

alter table exercise_sets enable row level security;
drop policy if exists "Users can view own exercise_sets" on exercise_sets;
create policy "Users can view own exercise_sets" on exercise_sets for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own exercise_sets" on exercise_sets;
create policy "Users can insert own exercise_sets" on exercise_sets for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own exercise_sets" on exercise_sets;
create policy "Users can update own exercise_sets" on exercise_sets for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own exercise_sets" on exercise_sets;
create policy "Users can delete own exercise_sets" on exercise_sets for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 5. SESSION_AI_SUMMARY — resumen con embeddings de OpenAI
-- ─────────────────────────────────────────────────────────────
create table if not exists session_ai_summary (
  id              uuid default gen_random_uuid() primary key,
  session_id      uuid references workout_sessions on delete cascade not null unique,
  user_id         uuid references auth.users on delete cascade not null,
  summary_text    text,
  metrics_json    jsonb,
  embedding       vector(1536),   -- dimensión de text-embedding-3-small
  model_used      text default 'gpt-4o-mini',
  created_at      timestamptz default now() not null
);

create index if not exists session_ai_summary_user_id_idx on session_ai_summary(user_id);
create index if not exists session_ai_summary_embedding_idx on session_ai_summary
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);

alter table session_ai_summary enable row level security;
drop policy if exists "Users can view own ai summaries" on session_ai_summary;
create policy "Users can view own ai summaries" on session_ai_summary for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own ai summaries" on session_ai_summary;
create policy "Users can insert own ai summaries" on session_ai_summary for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own ai summaries" on session_ai_summary;
create policy "Users can update own ai summaries" on session_ai_summary for update using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 6. BODY_WEIGHTS — peso corporal histórico
-- ─────────────────────────────────────────────────────────────
create table if not exists body_weights (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references auth.users on delete cascade not null,
  weight_kg       decimal(5,2) not null,
  date            date not null,
  created_at      timestamptz default now() not null,
  unique(user_id, date)
);

-- Si la tabla venía del schema v1 con columna 'weight', renombrar a 'weight_kg'
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'body_weights' and column_name = 'weight'
  ) and not exists (
    select 1 from information_schema.columns
    where table_name = 'body_weights' and column_name = 'weight_kg'
  ) then
    alter table body_weights rename column weight to weight_kg;
  end if;
end $$;

-- Asegurar índices de body_weights con IF NOT EXISTS
create index if not exists body_weights_user_id_idx on body_weights(user_id);
create index if not exists body_weights_date_idx on body_weights(date desc);

alter table body_weights enable row level security;
drop policy if exists "Users can view own body_weights" on body_weights;
drop policy if exists "Users can view their own body weights" on body_weights;
create policy "Users can view own body_weights" on body_weights for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own body_weights" on body_weights;
drop policy if exists "Users can insert their own body weights" on body_weights;
create policy "Users can insert own body_weights" on body_weights for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own body_weights" on body_weights;
drop policy if exists "Users can update their own body weights" on body_weights;
create policy "Users can update own body_weights" on body_weights for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own body_weights" on body_weights;
drop policy if exists "Users can delete their own body weights" on body_weights;
create policy "Users can delete own body_weights" on body_weights for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 7. VISTAS
-- ─────────────────────────────────────────────────────────────

-- Resumen de sesión con métricas calculadas
create or replace view session_metrics as
select
  ws.id as session_id,
  ws.user_id,
  ws.started_at,
  ws.finished_at,
  ws.duration_secs,
  count(distinct se.id)  as exercise_count,
  count(es.id)           as total_sets,
  sum(es.reps)           as total_reps,
  sum(es.reps * es.weight_kg) as total_volume_kg,
  avg(es.rest_secs)      as avg_rest_secs
from workout_sessions ws
left join session_exercises se on se.session_id = ws.id
left join exercise_sets es on es.session_exercise_id = se.id
group by ws.id, ws.user_id, ws.started_at, ws.finished_at, ws.duration_secs;

-- Mejor marca por ejercicio por usuario (Personal Records)
create or replace view exercise_personal_records as
select
  se.user_id,
  se.exercise_id,
  se.exercise_name,
  se.category,
  max(es.weight_kg) as max_weight_kg,
  max(es.reps)      as max_reps,
  max(es.reps * es.weight_kg) as max_set_volume,
  count(es.id)      as total_sets_ever,
  max(ws.started_at) as last_performed_at
from session_exercises se
join exercise_sets es on es.session_exercise_id = se.id
join workout_sessions ws on ws.id = se.session_id
group by se.user_id, se.exercise_id, se.exercise_name, se.category;
