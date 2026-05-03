alter table public.evaluations
add column if not exists number numeric,
add column if not exists start_date date,
add column if not exists end_date date,
add column if not exists difficulty text default 'media',
add column if not exists date date,
add column if not exists notes text,
add column if not exists topic text,
add column if not exists type text default 'evaluacion',
add column if not exists weight_percent numeric default 0,
add column if not exists grade numeric;

update public.evaluations
set start_date = coalesce(start_date, date),
    end_date = coalesce(end_date, start_date, date)
where start_date is null or end_date is null;
