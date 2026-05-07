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

-- Uso personal sin auth: deshabilitar RLS
alter table vinilos  disable row level security;
alter table camaras  disable row level security;
alter table autosf1  disable row level security;
alter table monedas  disable row level security;
