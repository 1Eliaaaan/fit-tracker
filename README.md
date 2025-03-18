# FitTrack

A modern fitness tracking application built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- User authentication (login/register)
- Calendar-based workout tracking
- Exercise logging with sets, reps, and weight
- Body weight tracking
- Progress visualization with charts
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account and project

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up your Supabase database tables:

```sql
-- Create exercises table
create table exercises (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  sets integer not null,
  reps integer not null,
  weight numeric not null,
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create body_weights table
create table body_weights (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  weight numeric not null,
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

-- Set up row level security
alter table exercises enable row level security;
alter table body_weights enable row level security;

-- Create policies
create policy "Users can insert their own exercises"
  on exercises for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own exercises"
  on exercises for select
  using (auth.uid() = user_id);

create policy "Users can insert their own body weights"
  on body_weights for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own body weights"
  on body_weights for update
  using (auth.uid() = user_id);

create policy "Users can view their own body weights"
  on body_weights for select
  using (auth.uid() = user_id);
```

5. Start the development server:
```bash
npm run dev
```

## Development

The application is built with:
- React + TypeScript
- Tailwind CSS for styling
- React Router for navigation
- React Calendar for the calendar component
- Recharts for data visualization
- Supabase for backend and authentication

## License

MIT
