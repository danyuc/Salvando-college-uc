create table if not exists public.environmental_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Sesión ambiental Metro',
  source_file_name text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.environmental_points (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.environmental_sessions(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  sample_number integer,
  device_session text,
  raw_timestamp double precision,
  recorded_at timestamptz,
  lat double precision,
  lng double precision,
  battery double precision,
  pm25 double precision,
  humidity double precision,
  temperature double precision,
  valid_session boolean default true,
  cache_status text,
  created_at timestamptz not null default now()
);

create table if not exists public.decibel_samples (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.environmental_sessions(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  line text,
  station_origin text,
  station_destination text,
  segment_type text,
  db_exit double precision,
  db_mid double precision,
  db_arrival double precision,
  db_peak double precision,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.bacteria_samples (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.environmental_sessions(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  sample_code text,
  line text,
  station_origin text,
  station_destination text,
  segment_type text,
  sample_place text,
  exposure_minutes double precision,
  cfu_count double precision,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.metro_segments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.environmental_sessions(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  line text,
  station_origin text,
  station_destination text,
  segment_type text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.environmental_sessions enable row level security;
alter table public.environmental_points enable row level security;
alter table public.decibel_samples enable row level security;
alter table public.bacteria_samples enable row level security;
alter table public.metro_segments enable row level security;

drop policy if exists "research read sessions" on public.environmental_sessions;
drop policy if exists "research insert sessions" on public.environmental_sessions;
drop policy if exists "research update sessions" on public.environmental_sessions;
drop policy if exists "research delete sessions" on public.environmental_sessions;

create policy "research read sessions"
on public.environmental_sessions for select
to authenticated
using (
  owner_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and coalesce(p.is_research_member, false) = true
  )
);

create policy "research insert sessions"
on public.environmental_sessions for insert
to authenticated
with check (
  owner_id = auth.uid()
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and coalesce(p.is_research_member, false) = true
  )
);

create policy "research update sessions"
on public.environmental_sessions for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "research delete sessions"
on public.environmental_sessions for delete
to authenticated
using (owner_id = auth.uid());

drop policy if exists "research read points" on public.environmental_points;
drop policy if exists "research insert points" on public.environmental_points;
drop policy if exists "research update points" on public.environmental_points;
drop policy if exists "research delete points" on public.environmental_points;

create policy "research read points"
on public.environmental_points for select
to authenticated
using (
  owner_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and coalesce(p.is_research_member, false) = true
  )
);

create policy "research insert points"
on public.environmental_points for insert
to authenticated
with check (owner_id = auth.uid());

create policy "research update points"
on public.environmental_points for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "research delete points"
on public.environmental_points for delete
to authenticated
using (owner_id = auth.uid());

drop policy if exists "research read decibels" on public.decibel_samples;
drop policy if exists "research insert decibels" on public.decibel_samples;
drop policy if exists "research update decibels" on public.decibel_samples;
drop policy if exists "research delete decibels" on public.decibel_samples;

create policy "research read decibels"
on public.decibel_samples for select
to authenticated
using (
  owner_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and coalesce(p.is_research_member, false) = true
  )
);

create policy "research insert decibels"
on public.decibel_samples for insert
to authenticated
with check (owner_id = auth.uid());

create policy "research update decibels"
on public.decibel_samples for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "research delete decibels"
on public.decibel_samples for delete
to authenticated
using (owner_id = auth.uid());

drop policy if exists "research read bacteria" on public.bacteria_samples;
drop policy if exists "research insert bacteria" on public.bacteria_samples;
drop policy if exists "research update bacteria" on public.bacteria_samples;
drop policy if exists "research delete bacteria" on public.bacteria_samples;

create policy "research read bacteria"
on public.bacteria_samples for select
to authenticated
using (
  owner_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and coalesce(p.is_research_member, false) = true
  )
);

create policy "research insert bacteria"
on public.bacteria_samples for insert
to authenticated
with check (owner_id = auth.uid());

create policy "research update bacteria"
on public.bacteria_samples for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "research delete bacteria"
on public.bacteria_samples for delete
to authenticated
using (owner_id = auth.uid());

drop policy if exists "research read segments" on public.metro_segments;
drop policy if exists "research insert segments" on public.metro_segments;
drop policy if exists "research update segments" on public.metro_segments;
drop policy if exists "research delete segments" on public.metro_segments;

create policy "research read segments"
on public.metro_segments for select
to authenticated
using (
  owner_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and coalesce(p.is_research_member, false) = true
  )
);

create policy "research insert segments"
on public.metro_segments for insert
to authenticated
with check (owner_id = auth.uid());

create policy "research update segments"
on public.metro_segments for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "research delete segments"
on public.metro_segments for delete
to authenticated
using (owner_id = auth.uid());
