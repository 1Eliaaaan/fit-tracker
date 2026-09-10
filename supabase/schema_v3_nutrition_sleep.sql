-- ═══════════════════════════════════════════════════════════════
--  FitTrack v2 — Módulo Nutrición (Comida) y Descanso (Sueño)
--  Ejecuta este script en el SQL Editor de Supabase
-- ═══════════════════════════════════════════════════════════════

create extension if not exists vector;

-- ─────────────────────────────────────────────────────────────
-- 1. NUTRITION_LOGS (Registro libre de comidas con IA + Embeddings)
-- ─────────────────────────────────────────────────────────────
create table if not exists nutrition_logs (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references auth.users on delete cascade not null,
  date            date not null default current_date,
  meal_type       text not null check (meal_type in ('desayuno', 'almuerzo', 'merienda', 'cena', 'snack', 'otro')),
  raw_text        text not null,
  parsed_items    jsonb not null default '[]'::jsonb,
  total_calories  integer default 0,
  protein_g       decimal(6,1) default 0,
  carbs_g         decimal(6,1) default 0,
  fat_g           decimal(6,1) default 0,
  embedding       vector(1536), -- embedding semántico text-embedding-3-small
  created_at      timestamptz default now() not null
);

create index if not exists nutrition_logs_user_id_idx on nutrition_logs(user_id);
create index if not exists nutrition_logs_date_idx on nutrition_logs(date desc);
create index if not exists nutrition_logs_embedding_idx on nutrition_logs
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);

alter table nutrition_logs enable row level security;
drop policy if exists "Users can view own nutrition" on nutrition_logs;
create policy "Users can view own nutrition" on nutrition_logs for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own nutrition" on nutrition_logs;
create policy "Users can insert own nutrition" on nutrition_logs for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own nutrition" on nutrition_logs;
create policy "Users can update own nutrition" on nutrition_logs for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own nutrition" on nutrition_logs;
create policy "Users can delete own nutrition" on nutrition_logs for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 2. SLEEP_LOGS (Registro diario de descanso y horas de sueño)
-- ─────────────────────────────────────────────────────────────
create table if not exists sleep_logs (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references auth.users on delete cascade not null,
  date            date not null default current_date,
  sleep_hours     decimal(4,2) not null check (sleep_hours >= 0 and sleep_hours <= 24),
  quality         text not null check (quality in ('poor', 'fair', 'good', 'excellent')),
  bed_time        text,
  wake_time       text,
  notes           text,
  created_at      timestamptz default now() not null,
  unique (user_id, date)
);

create index if not exists sleep_logs_user_id_idx on sleep_logs(user_id);
create index if not exists sleep_logs_date_idx on sleep_logs(date desc);

alter table sleep_logs enable row level security;
drop policy if exists "Users can view own sleep" on sleep_logs;
create policy "Users can view own sleep" on sleep_logs for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own sleep" on sleep_logs;
create policy "Users can insert own sleep" on sleep_logs for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own sleep" on sleep_logs;
create policy "Users can update own sleep" on sleep_logs for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own sleep" on sleep_logs;
create policy "Users can delete own sleep" on sleep_logs for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 3. AI_FEEDBACK_LOGS (Historial de feedback de IA bajo demanda)
-- ─────────────────────────────────────────────────────────────
create table if not exists ai_feedback_logs (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references auth.users on delete cascade not null,
  category        text not null check (category in ('nutrition', 'sleep', 'general')),
  feedback_text   text not null,
  created_at      timestamptz default now() not null
);

create index if not exists ai_feedback_logs_user_id_idx on ai_feedback_logs(user_id);

alter table ai_feedback_logs enable row level security;
drop policy if exists "Users can view own ai feedback" on ai_feedback_logs;
create policy "Users can view own ai feedback" on ai_feedback_logs for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own ai feedback" on ai_feedback_logs;
create policy "Users can insert own ai feedback" on ai_feedback_logs for insert with check (auth.uid() = user_id);
