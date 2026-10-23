create table if not exists voice_samples (
  id bigserial primary key,
  lang text not null check (lang in ('en','vi')),
  surface text not null check (surface in ('hook','chartLine','answer')),
  text text not null,
  status text not null check (status in ('gold','bad')),
  note text,
  created_at timestamptz default now()
);
alter table voice_samples enable row level security;
-- no public access: only the service role and my logged-in admin user.
