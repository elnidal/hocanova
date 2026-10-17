-- Hikayenglish LGS: kalıcı ilerleme. Supabase → SQL Editor'de bir kez çalıştır.
-- Her öğrencinin tek satırı var; satır güvenliği (RLS) ile yalnız kendi satırına erişir.

create table if not exists public.progress (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  state      jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

create policy "kendi ilerlemesini okur" on public.progress
  for select using (auth.uid() = user_id);
create policy "kendi ilerlemesini ekler" on public.progress
  for insert with check (auth.uid() = user_id);
create policy "kendi ilerlemesini günceller" on public.progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
