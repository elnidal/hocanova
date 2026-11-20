-- Akşam hatırlatması (web push). Supabase → SQL Editor'de bir kez çalıştır. Yalnız ekler; mevcut tablolara dokunmaz.
-- Öğrenci yalnız kendi aboneliğini ekler/siler. Gönderici (Cloudflare Worker, app/worker.js) push_targets'ı
-- gizli bir anahtarla çağırır; veritabanında anahtarın kendisi değil yalnız SHA-256 özeti durur.
-- Bildirim içerik taşımaz (adres yok, ad yok); metni telefondaki uygulama kendisi yazar.

create table if not exists public.push_subs (
  user_id    uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  endpoint   text not null check (char_length(endpoint) <= 1000 and endpoint like 'https://%'),
  updated_at timestamptz not null default now()
);
alter table public.push_subs enable row level security;
drop policy if exists "kendi aboneliğini görür" on public.push_subs;
drop policy if exists "kendi aboneliğini ekler" on public.push_subs;
drop policy if exists "kendi aboneliğini günceller" on public.push_subs;
drop policy if exists "kendi aboneliğini siler" on public.push_subs;
create policy "kendi aboneliğini görür" on public.push_subs for select using (auth.uid() = user_id);
create policy "kendi aboneliğini ekler" on public.push_subs for insert with check (auth.uid() = user_id);
create policy "kendi aboneliğini günceller" on public.push_subs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "kendi aboneliğini siler" on public.push_subs for delete using (auth.uid() = user_id);

create table if not exists public.push_config (id int primary key default 1 check (id = 1), secret_hash text not null);
alter table public.push_config enable row level security;   -- politika yok: API'den okunamaz
revoke all on public.push_config from anon, authenticated;
insert into public.push_config (id, secret_hash) values (1, '90cfd7107caf9dc61adad3f668125e3e2a0d98dd4f08ad6fc10ab759817fdac3')
  on conflict (id) do update set secret_hash = excluded.secret_hash;

create or replace function public.push_secret_ok(p_secret text) returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.push_config where secret_hash = encode(sha256(convert_to(coalesce(p_secret, ''), 'UTF8')), 'hex')) $$;
revoke all on function public.push_secret_ok(text) from public, anon, authenticated;

-- Hatırlatma gidecek abonelikler: bugün (İstanbul) hiç soru çözmemiş, son 14 günde çalışmış öğrenciler.
-- p_all: deneme gönderimi için filtreyi kaldırır.
create or replace function public.push_targets(p_secret text, p_all boolean default false)
returns table (endpoint text)
language plpgsql security definer set search_path = public as $$
declare today text := to_char((now() at time zone 'Europe/Istanbul')::date, 'YYYY-MM-DD');
        since text := to_char((now() at time zone 'Europe/Istanbul')::date - 14, 'YYYY-MM-DD');
begin
  if not public.push_secret_ok(p_secret) then raise exception 'yetkisiz'; end if;
  return query
  select s.endpoint from public.push_subs s left join public.progress p on p.user_id = s.user_id
  where p_all or (
    coalesce((p.state->'daily'->>today)::int, 0) = 0
    and exists (select 1 from jsonb_object_keys(coalesce(p.state->'daily', '{}'::jsonb)) k where k >= since)
  );
end $$;
revoke all on function public.push_targets(text, boolean) from public;
grant execute on function public.push_targets(text, boolean) to anon;

-- Süresi dolmuş aboneliği siler (gönderici 404/410 alınca çağırır).
create or replace function public.push_prune(p_secret text, p_endpoint text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.push_secret_ok(p_secret) then raise exception 'yetkisiz'; end if;
  delete from public.push_subs where endpoint = p_endpoint;
end $$;
revoke all on function public.push_prune(text, text) from public;
grant execute on function public.push_prune(text, text) to anon;
