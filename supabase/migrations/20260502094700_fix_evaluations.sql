create table if not exists public.evaluations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  subject text not null,
  title text not null,
  type text default 'evaluacion',
  topic text,
  grade numeric,
  weight_percent numeric default 0,
  notes text,
  date date,
  created_at timestamptz not null default now()
);

create index if not exists evaluations_user_id_idx
on public.evaluations(user_id);

create index if not exists evaluations_subject_idx
on public.evaluations(subject);

alter table public.evaluations enable row level security;

drop policy if exists "Users can read own evaluations" on public.evaluations;
drop policy if exists "Users can insert own evaluations" on public.evaluations;
drop policy if exists "Users can update own evaluations" on public.evaluations;
drop policy if exists "Users can delete own evaluations" on public.evaluations;

create policy "Users can read own evaluations"
on public.evaluations
for select
using (auth.uid() = user_id);

create policy "Users can insert own evaluations"
on public.evaluations
for insert
with check (auth.uid() = user_id);

create policy "Users can update own evaluations"
on public.evaluations
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own evaluations"
on public.evaluations
for delete
using (auth.uid() = user_id);
