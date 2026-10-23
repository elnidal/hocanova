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
-- insert into public.teachers (user_id) select id from auth.users where email = 'senin-epostan@ornek.com';
