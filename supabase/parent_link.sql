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
