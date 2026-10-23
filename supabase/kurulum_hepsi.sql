-- Hikayenglish: reports + öğretmen paneli + veli bağlantısı. Supabase → SQL Editor → New query → hepsini yapıştır → Run.
-- (Önce Authentication → Users → Add user ile kendi e-posta+şifreni oluştur; en alttaki satırdaki e-postayı değiştir.)

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


-- Öğretmen paneli (uygulamada adres sonuna #ogretmen). Supabase → SQL Editor'de bir kez çalıştır.
-- Öğrenci tablolarına geniş okuma izni VERMEZ: panel yalnız aşağıdaki 3 işlevi çağırır; işlevler çağıranın
-- `teachers` tablosunda olup olmadığına bakar. Öğrenciler (anonim oturumlar) çağırsa bile hata alır.
--
-- ADIMLAR
--  1) Authentication → Users → "Add user": kendi e-postan + şifre (Auto confirm işaretli). Şifreyi kimseyle paylaşma.
--  2) Bu dosyayı çalıştır.
--  3) En sonda yorumlu satırdaki e-postayı kendininkiyle değiştirip çalıştır (seni öğretmen yapar).

create table if not exists public.teachers (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.teachers enable row level security;           -- politika yok: API'den kimse okuyamaz/yazamaz
revoke all on public.teachers from anon, authenticated;

create or replace function public.is_teacher() returns boolean
language sql security definer set search_path = public as
$$ select exists (select 1 from public.teachers where user_id = auth.uid()) $$;
revoke all on function public.is_teacher() from public, anon;
grant execute on function public.is_teacher() to authenticated;

-- Öğrenci başına özet
create or replace function public.teacher_students()
returns table (takma_ad text, sinif text, seviye text, biten_ders int, cevap int, dogru_yuzde int, biliniyor int, kararsiz int,
               gun7 int, bugun int, son_islem timestamptz, anonim boolean)
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_teacher() then raise exception 'yetkisiz'; end if;
  return query
  select
    coalesce(p.state->'profile'->>'nick', '(takma ad yok)'),
    p.state->'profile'->>'group',
    p.state->'placement'->>'level',
    (select count(*)::int from jsonb_object_keys(coalesce(p.state->'doneDays', '{}'::jsonb))),
    coalesce(jsonb_array_length(p.state->'progress'->'log'), 0),
    (round(100.0 * (select count(*) from jsonb_array_elements(coalesce(p.state->'progress'->'log', '[]'::jsonb)) e where (e->>'ok')::boolean)
          / nullif(jsonb_array_length(p.state->'progress'->'log'), 0)))::int,
    (select count(*)::int from jsonb_each(coalesce(p.state->'progress'->'items', '{}'::jsonb)) i where i.value->>'status' = 'known'),
    (select count(*)::int from jsonb_each(coalesce(p.state->'progress'->'items', '{}'::jsonb)) i where i.value->>'status' = 'unc'),
    (select count(*)::int from jsonb_each(coalesce(p.state->'daily', '{}'::jsonb)) d
       where d.key >= to_char(current_date - 6, 'YYYY-MM-DD') and (d.value)::text::int > 0),
    coalesce((p.state->'daily'->>to_char(current_date, 'YYYY-MM-DD'))::int, 0),
    to_timestamp((p.state->>'savedAt')::bigint / 1000.0),
    u.is_anonymous
  from public.progress p join auth.users u on u.id = p.user_id;
end $$;
revoke all on function public.teacher_students() from public, anon;
grant execute on function public.teacher_students() to authenticated;

-- En çok yanlış yapılan ifadeler (tüm öğrenciler)
create or replace function public.teacher_words()
returns table (birim text, ogrenci int, dogru int, yanlis int, yanlis_yuzde int, biliniyor int)
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_teacher() then raise exception 'yetkisiz'; end if;
  return query
  select i.key, count(*)::int, sum((i.value->>'correct')::int)::int, sum((i.value->>'wrong')::int)::int,
         (round(100.0 * sum((i.value->>'wrong')::int) / nullif(sum((i.value->>'correct')::int) + sum((i.value->>'wrong')::int), 0)))::int,
         (count(*) filter (where i.value->>'status' = 'known'))::int
  from public.progress p cross join lateral jsonb_each(coalesce(p.state->'progress'->'items', '{}'::jsonb)) i
  group by i.key having sum((i.value->>'wrong')::int) > 0
  order by 5 desc, 4 desc limit 40;
end $$;
revoke all on function public.teacher_words() from public, anon;
grant execute on function public.teacher_words() to authenticated;

-- "Sorun bildir" kayıtları (reports.sql çalıştırılmış olmalı)
create or replace function public.teacher_reports()
returns table (qid text, kind text, adet int, notlar text, son timestamptz)
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_teacher() then raise exception 'yetkisiz'; end if;
  return query
  select r.qid, r.kind, count(*)::int, string_agg(distinct r.note, ' · ') filter (where r.note is not null), max(r.created_at)
  from public.reports r group by r.qid, r.kind order by 3 desc, 5 desc limit 60;
end $$;
revoke all on function public.teacher_reports() from public, anon;
grant execute on function public.teacher_reports() to authenticated;

-- 3. adım: kendini öğretmen yap (e-postayı değiştir)


-- Veli bağlantısı: öğrenci uygulamadan "Bağlantı oluştur" der; veli bağlantıyı kendi telefonunda açar (giriş gerekmez).
-- Supabase → SQL Editor'de bir kez çalıştır.
--
-- Güvenlik: bağlantıdaki kod rastgele ve tahmin edilemez (24 karakter). Veli YALNIZ aşağıdaki işlevi çağırabilir;
-- işlev ham ilerlemeyi değil, rapor için gereken özeti döndürür (takma ad, günlük sayılar, ifade durumları).
-- Öğrenci bağlantıyı istediği an kapatabilir (satır silinir).

create table if not exists public.parent_links (
  token      text primary key check (char_length(token) between 20 and 64),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.parent_links enable row level security;
create policy "kendi bağlantısını ekler"  on public.parent_links for insert with check (auth.uid() = user_id);
create policy "kendi bağlantısını görür"  on public.parent_links for select using (auth.uid() = user_id);
create policy "kendi bağlantısını siler"  on public.parent_links for delete using (auth.uid() = user_id);

create or replace function public.parent_report(p_token text) returns jsonb
language plpgsql security definer stable set search_path = public as $$
declare s jsonb;
begin
  select pr.state into s from public.parent_links l join public.progress pr on pr.user_id = l.user_id where l.token = p_token;
  if s is null then return null; end if;
  return jsonb_build_object(
    'nick', s->'profile'->>'nick',
    'group', s->'profile'->>'group',
    'daily', coalesce(s->'daily', '{}'::jsonb),
    'doneDays', coalesce(s->'doneDays', '{}'::jsonb),
    'unitQuiz', coalesce(s->'unitQuiz', '{}'::jsonb),
    'weekly', coalesce(s->'weekly', '{}'::jsonb),
    'items', (select coalesce(jsonb_object_agg(e.key, jsonb_build_object('status', e.value->>'status', 'wrong', coalesce((e.value->>'wrong')::int, 0))), '{}'::jsonb)
              from jsonb_each(coalesce(s->'progress'->'items', '{}'::jsonb)) e),
    'log', (select coalesce(jsonb_agg(jsonb_build_object('t', x->'t', 'ok', x->'ok')), '[]'::jsonb)
            from jsonb_array_elements(coalesce(s->'progress'->'log', '[]'::jsonb)) x
            where (x->>'t')::bigint >= (extract(epoch from now()) * 1000 - 8 * 86400000)),
    'savedAt', s->'savedAt'
  );
end $$;
revoke all on function public.parent_report(text) from public;
grant execute on function public.parent_report(text) to anon, authenticated;

-- SON ADIM: kendini öğretmen yap (e-postayı değiştir, bu satırın başındaki -- işaretlerini kaldır)
-- insert into public.teachers (user_id) select id from auth.users where email = 'senin-epostan@ornek.com';
