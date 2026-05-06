alter table public.environmental_points
add column if not exists segment_id text;

alter table public.decibel_samples
add column if not exists segment_id text;

alter table public.bacteria_samples
add column if not exists segment_id text;

alter table public.metro_segments
add column if not exists segment_id text;

alter table public.environmental_points
add column if not exists direction text;

alter table public.decibel_samples
add column if not exists direction text;

alter table public.bacteria_samples
add column if not exists direction text;

alter table public.metro_segments
add column if not exists direction text;
