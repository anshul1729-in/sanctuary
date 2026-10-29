-- Sanctuary Schema Migration
-- Defines sections and entries with full Row Level Security (RLS)

-- 1. Create sections table
create table if not exists public.sections (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  name text,
  title text,
  subtitle text,
  description text,
  icon text,
  accent_color text default '#84A59D',
  is_primary boolean default false,
  tags jsonb default '[]'::jsonb,
  categories jsonb default '["DSA", "Systems", "Networking", "Operating Systems", "Databases"]'::jsonb,
  subtopics_map jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- 2. Create entries table
create table if not exists public.entries (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  section_id text references public.sections(id) on delete cascade,
  title text,
  content text,
  category text default 'DSA',
  subtopic text default 'General',
  subtopics jsonb default '[]'::jsonb,
  tags jsonb default '[]'::jsonb,
  date text,
  reading_time text,
  complexity jsonb,
  takeaway text,
  preview text,
  is_favorite boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Enable Row Level Security (RLS)
alter table public.sections enable row level security;
alter table public.entries enable row level security;

-- 4. Sections strict RLS policies (Only authenticated owner can manage their data)
create policy "Users can select own sections"
  on public.sections for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own sections"
  on public.sections for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own sections"
  on public.sections for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete own sections"
  on public.sections for delete
  to authenticated
  using (auth.uid() = user_id);

-- 5. Entries strict RLS policies (Only authenticated owner can manage their data)
create policy "Users can select own entries"
  on public.entries for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own entries"
  on public.entries for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own entries"
  on public.entries for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete own entries"
  on public.entries for delete
  to authenticated
  using (auth.uid() = user_id);
