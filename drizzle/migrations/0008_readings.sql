alter table perfumes add column if not exists smell_words text[] default '{}';

create table if not exists readings (
  id bigserial primary key,
  planet text not null,
  sign text not null,
  house int not null,
  language text not null check (language in ('en','vi')),
  perfume_id text not null,
  truth text not null,
  cost text not null,
  scent text not null,
  model text,
  created_at timestamptz default now(),
  unique (planet, sign, house, language, perfume_id)
);

grant select on public.readings to anon, authenticated;
grant all on public.readings to service_role;
grant usage, select on sequence public.readings_id_seq to service_role;

alter table readings enable row level security;

create policy "public read readings" on readings for select using (true);