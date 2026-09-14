-- HobbyCount — Ejecutar en Supabase SQL Editor
-- https://supabase.com/dashboard → SQL Editor → New query

create table if not exists vinilos (
  id          uuid primary key default gen_random_uuid(),
  artist      text,
  album       text,
  year        integer,
  genre       text,
  country     text,
  label       text,
  format      text,
  condition   text,
  notes       text,
  wishlist    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz
);

create table if not exists camaras (
  id          uuid primary key default gen_random_uuid(),
  brand       text,
  model       text,
  year        integer,
  type        text,
  film        text,
  country     text,
  condition   text,
  working     text,
  notes       text,
  wishlist    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz
);

create table if not exists autosf1 (
  id          uuid primary key default gen_random_uuid(),
  team        text,
  driver      text,
  year        integer,
  scale       text,
  brand       text,
  gp          text,
  condition   text,
  limited     text,
  notes       text,
  wishlist    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz
);

create table if not exists monedas (
  id          uuid primary key default gen_random_uuid(),
  country     text,
  year        integer,
  denomination text,
  currency    text,
  material    text,
  era         text,
  condition   text,
  commemorative text,
  notes       text,
  wishlist    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz
);

-- Solo usuarios logueados pueden leer y escribir.
-- Antes de correr esto:
--   1. Authentication → Sign In / Providers → desactivar "Allow new users to sign up"
--   2. Authentication → Users → crear a mano las cuentas de Franco y Ayelen
alter table vinilos  enable row level security;
alter table camaras  enable row level security;
alter table autosf1  enable row level security;
alter table monedas  enable row level security;

drop policy if exists "solo logueados" on vinilos;
drop policy if exists "solo logueados" on camaras;
drop policy if exists "solo logueados" on autosf1;
drop policy if exists "solo logueados" on monedas;

create policy "solo logueados" on vinilos for all to authenticated using (true) with check (true);
create policy "solo logueados" on camaras for all to authenticated using (true) with check (true);
create policy "solo logueados" on autosf1 for all to authenticated using (true) with check (true);
create policy "solo logueados" on monedas for all to authenticated using (true) with check (true);
