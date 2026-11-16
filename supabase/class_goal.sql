-- Sınıf hedefi: öğretmenin oluşturduğu sınıf kodu + haftalık ortak soru hedefi. Supabase → SQL Editor'de bir kez çalıştır.
-- GÜVENLİK: bu dosyadaki teacher_classes bütün sınıfları listeler, teacher_class_save çakışınca
-- başka öğretmenin adını ve hedefini ezer. Canlıda ardından supabase/class_goal_codes.sql çalıştır.
-- O dosyadan SONRA bu iki işlevi tekrar çalıştırma; güvensiz tanım geri gelir.
-- teacher.sql önceden çalıştırılmış olmalı (is_teacher işlevi). Yalnız ekleme yapar; mevcut tablolara dokunmaz.
--
-- Gizlilik: öğrenci yalnız KENDİ profilindeki koda ait özeti görebilir (başka kodu deneyemez).
-- Özette yalnız takma adlar ve haftalık soru sayıları var; ilk 3 kişi ve öğrencinin kendi sırası. Sonuncu gösterilmez.

create table if not exists public.class_codes (
  code        text primary key check (code ~ '^[A-Z0-9-]{3,12}$'),
  name        text not null check (char_length(name) between 1 and 40),
  weekly_goal int  not null default 1000 check (weekly_goal between 50 and 100000),
  owner       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);
alter table public.class_codes enable row level security;          -- politika yok: yalnız aşağıdaki işlevlerle erişilir
revoke all on public.class_codes from anon, authenticated;

-- Haftanın başı (pazartesi 00.00, İstanbul) milisaniye olarak
create or replace function public.week_start_ms() returns bigint
language sql stable as
$$ select (extract(epoch from (date_trunc('week', now() at time zone 'Europe/Istanbul') at time zone 'Europe/Istanbul')) * 1000)::bigint $$;

-- Bir öğrencinin bu haftaki cevap sayısı (kart turu hariç)
create or replace function public.week_answers(st jsonb) returns int
language sql stable as $$
  select count(*)::int from jsonb_array_elements(coalesce(st->'progress'->'log', '[]'::jsonb)) e
  where (e->>'t')::bigint >= public.week_start_ms() and coalesce(e->>'kind', '') <> 'flash' and e ? 'qid'
$$;

-- Öğretmen: sınıf kodlarını listeler
create or replace function public.teacher_classes()
returns table (code text, name text, weekly_goal int, ogrenci int, bu_hafta int)
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_teacher() then raise exception 'yetkisiz'; end if;
  return query
  select c.code, c.name, c.weekly_goal,
         (select count(*)::int from public.progress p where upper(p.state->'profile'->>'group') = c.code),
         (select coalesce(sum(public.week_answers(p.state)), 0)::int from public.progress p where upper(p.state->'profile'->>'group') = c.code)
  from public.class_codes c order by c.created_at;
end $$;
revoke all on function public.teacher_classes() from public, anon;
grant execute on function public.teacher_classes() to authenticated;

-- Öğretmen: sınıf kodu ekler ya da adını/hedefini günceller
create or replace function public.teacher_class_save(p_code text, p_name text, p_goal int)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_teacher() then raise exception 'yetkisiz'; end if;
  insert into public.class_codes (code, name, weekly_goal, owner) values (upper(p_code), p_name, p_goal, auth.uid())
  on conflict (code) do update set name = excluded.name, weekly_goal = excluded.weekly_goal;
end $$;
revoke all on function public.teacher_class_save(text, text, int) from public, anon;
grant execute on function public.teacher_class_save(text, text, int) to authenticated;

-- Öğrenci: kendi sınıfının bu haftaki özeti (kod profilde kayıtlı değilse ya da kod yoksa null)
create or replace function public.class_week()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  my_code text;
  cls public.class_codes;
  res jsonb;
begin
  select upper(p.state->'profile'->>'group') into my_code from public.progress p where p.user_id = auth.uid();
  if my_code is null or my_code = '' then return null; end if;
  select * into cls from public.class_codes where code = my_code;
  if not found then return null; end if;
  with m as (
    select p.user_id, coalesce(nullif(p.state->'profile'->>'nick', ''), 'Bir öğrenci') as nick, public.week_answers(p.state) as n
    from public.progress p where upper(p.state->'profile'->>'group') = my_code
  ), r as (select *, rank() over (order by n desc) as rk from m)
  select jsonb_build_object(
    'code', cls.code, 'name', cls.name, 'goal', cls.weekly_goal,
    'total', coalesce((select sum(n) from m), 0), 'members', (select count(*) from m),
    'top', coalesce((select jsonb_agg(jsonb_build_object('nick', nick, 'n', n) order by n desc) from (select nick, n from r where n > 0 order by n desc limit 3) t), '[]'::jsonb),
    'me', (select jsonb_build_object('rank', rk, 'n', n) from r where user_id = auth.uid())
  ) into res;
  return res;
end $$;
revoke all on function public.class_week() from public, anon;
grant execute on function public.class_week() to authenticated;
