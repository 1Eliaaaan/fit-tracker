-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create exercises table
create table exercises (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  sets jsonb not null, -- Stores array of objects with {reps: number, weight: number}
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create body_weights table
create table body_weights (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  weight decimal not null,
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Ensure one weight record per user per date
  unique(user_id, date)
);

-- Create indexes for better performance
create index exercises_user_id_idx on exercises(user_id);
create index exercises_date_idx on exercises(date);
create index body_weights_user_id_idx on body_weights(user_id);
create index body_weights_date_idx on body_weights(date);

-- Enable Row Level Security (RLS)
alter table exercises enable row level security;
alter table body_weights enable row level security;

-- Create RLS policies for exercises table
create policy "Users can view their own exercises"
  on exercises for select
  using (auth.uid() = user_id);

create policy "Users can insert their own exercises"
  on exercises for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own exercises"
  on exercises for update
  using (auth.uid() = user_id);

create policy "Users can delete their own exercises"
  on exercises for delete
  using (auth.uid() = user_id);

-- Create RLS policies for body_weights table
create policy "Users can view their own body weights"
  on body_weights for select
  using (auth.uid() = user_id);

create policy "Users can insert their own body weights"
  on body_weights for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own body weights"
  on body_weights for update
  using (auth.uid() = user_id);

create policy "Users can delete their own body weights"
  on body_weights for delete
  using (auth.uid() = user_id);

-- Optional: Create a view for exercise statistics
create or replace view exercise_stats as
select 
  user_id,
  name as exercise_name,
  date,
  count(*) as total_sets,
  sum((set->>'reps')::integer) as total_reps,
  max((set->>'weight')::decimal) as max_weight,
  sum((set->>'reps')::integer * (set->>'weight')::decimal) as total_volume
from exercises,
jsonb_array_elements(sets) as set
group by user_id, name, date;

-- Optional: Create a view for body weight progress
create or replace view body_weight_progress as
select 
  user_id,
  date,
  weight,
  lag(weight) over (partition by user_id order by date) as previous_weight,
  weight - lag(weight) over (partition by user_id order by date) as weight_change
from body_weights
order by user_id, date; 