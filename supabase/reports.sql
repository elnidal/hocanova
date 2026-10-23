-- "Sorun bildir": öğrencilerin soru/içerik hataları. Supabase → SQL Editor'de bir kez çalıştır.
-- Öğrenci yalnız EKLER (okuyamaz, değiştiremez); sen SQL Editor'den okursun:
--   select created_at, kind, qid, item_id, note, screen from public.reports order by created_at desc;
--   select qid, count(*) from public.reports group by qid order by 2 desc;   -- en çok bildirilen sorular

create table if not exists public.reports (
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  qid        text not null check (char_length(qid) <= 64),
  item_id    text check (char_length(item_id) <= 32),
  kind       text not null check (kind in ('wrong', 'unclear', 'other')),
  note       text check (char_length(note) <= 300),
  screen     text check (char_length(screen) <= 32),
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

create policy "kendi bildirimini ekler" on public.reports
  for insert with check (auth.uid() = user_id);
