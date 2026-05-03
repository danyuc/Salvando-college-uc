create table if not exists precalculo_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  modulo text,
  unidad text,
  subtema text,
  evaluacion text,
  dificultad text,
  tipo text,
  respuesta_usuario text,
  respuesta_correcta text,
  es_correcta boolean,
  tiempo_respuesta int,
  created_at timestamptz default now()
);
