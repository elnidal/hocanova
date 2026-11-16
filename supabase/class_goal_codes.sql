-- Sınıf kodu güvenliği. class_goal.sql çalıştıktan SONRA, Supabase SQL Editor'de bir kez.
-- Yinelenebilir: işlevleri değiştirir, tabloyu ve mevcut satırları silmez.
--
-- Sorun: '8A' gibi kısa kodlar tahmin edilir, iki okulun kodu çakışır, herhangi bir öğrenci
-- kodu yazınca o sınıfın ilk 3 takma adını görür. teacher_classes() bütün sınıfları listeler.
-- teacher_class_save() çakışınca başka öğretmenin adını ve hedefini ezer.
--
-- Bundan sonra:
--   * Yeni kod sunucuda üretilir: etiket + 4 karakter (ör. 8A-K7QX). 0/O, 1/I/L yok.
--   * Öğretmen yalnız kendi sınıflarını görür ve değiştirir (owner = auth.uid()).
--   * teacher_class_save artık EKLEMEZ. Başka öğretmenin satırına yazarsa hata verir, ezmez.
--
-- Mevcut kodların yolu:
--   * '8A' gibi eski satırlar DURUR. Öğrencilerin profilindeki kod çalışmaya devam eder; kimse kopmaz.
--   * Sahibi panelde kodu "tahmin edilebilir" görür. "Yeni kod" eski kodu kapatır ve yenisini verir.
--   * Eski kodu yazan öğrenci, yenisini profiline yazana kadar sınıf hedefini görmez.
--   * Bu dosyayı uygulamadan uygulama da açılır: kodu tarayıcıda üretir ve bunu söyler.
--     Dosyadan sonra oluşturma teacher_class_create ile olur.
--
-- Bu dosyayı uyguladıktan sonra class_goal.sql içindeki teacher_classes / teacher_class_save
-- tanımlarını tekrar çalıştırma; eski (güvensiz) hali geri gelir.

create or replace function public.class_code_prefix(p_name text) returns text
language sql immutable as $$
  select coalesce(
    nullif(left(upper(regexp_replace(coalesce(p_name, ''), '[^0-9A-Za-z]', '', 'g')), 4), ''),
    'SINIF'
  )
$$;

-- 31 karakter, 4 uzunluk. Öğrenci kodu deneyemez: class_week yalnız kendi profilindeki koda bakar.
create or replace function public.class_code_suffix() returns text
language plpgsql volatile as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  out text := '';
  i int;
  n int;
begin
  for i in 1..4 loop
    n := floor(random() * length(alphabet))::int;
    out := out || substr(alphabet, n + 1, 1);
  end loop;
  return out;
end $$;

revoke all on function public.class_code_prefix(text) from public, anon, authenticated;
revoke all on function public.class_code_suffix() from public, anon, authenticated;

-- Yeni sınıf. Kodu sunucu üretir ve döndürür. İstemci kod seçemez.
create or replace function public.teacher_class_create(p_name text, p_goal int)
returns text
language plpgsql security definer set search_path = public as $$
declare
  v_name text := btrim(coalesce(p_name, ''));
  v_goal int := coalesce(p_goal, 1000);
  v_code text;
  tries int := 0;
begin
  if not public.is_teacher() then raise exception 'yetkisiz'; end if;
  if char_length(v_name) < 1 or char_length(v_name) > 40 then
    raise exception 'sınıf adı 1-40 karakter olmalı';
  end if;
  if v_goal < 50 or v_goal > 100000 then
    raise exception 'hedef 50 ile 100000 arasında olmalı';
  end if;
  loop
    tries := tries + 1;
    v_code := public.class_code_prefix(v_name) || '-' || public.class_code_suffix();
    exit when not exists (select 1 from public.class_codes where code = v_code);
    if tries > 8 then raise exception 'kod üretilemedi'; end if;
  end loop;
  insert into public.class_codes (code, name, weekly_goal, owner)
  values (v_code, v_name, v_goal, auth.uid());
  return v_code;
end $$;
revoke all on function public.teacher_class_create(text, int) from public, anon;
grant execute on function public.teacher_class_create(text, int) to authenticated;

-- Yalnız kendi sınıfının adını ve hedefini günceller. Yeni kod eklemez, başkasını ezmez.
create or replace function public.teacher_class_save(p_code text, p_name text, p_goal int)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_name text := btrim(coalesce(p_name, ''));
  n int;
begin
  if not public.is_teacher() then raise exception 'yetkisiz'; end if;
  if char_length(v_name) < 1 or char_length(v_name) > 40 then
    raise exception 'sınıf adı 1-40 karakter olmalı';
  end if;
  if p_goal is null or p_goal < 50 or p_goal > 100000 then
    raise exception 'hedef 50 ile 100000 arasında olmalı';
  end if;
  update public.class_codes
     set name = v_name, weekly_goal = p_goal
   where code = upper(btrim(coalesce(p_code, ''))) and owner = auth.uid();
  get diagnostics n = row_count;
  if n = 0 then raise exception 'bu kod senin sınıfın değil'; end if;
end $$;

-- Kendi sınıfına yeni kod verir. Eski kod bir daha eşleşmez; satır silinmez, öğrenciler kopmadan
-- yeni kodu yazana kadar bu sınıfın haftalık özetini görmez.
create or replace function public.teacher_class_rotate(p_code text)
returns text
language plpgsql security definer set search_path = public as $$
declare
  old text := upper(btrim(coalesce(p_code, '')));
  v_name text;
  v_code text;
  tries int := 0;
  n int;
begin
  if not public.is_teacher() then raise exception 'yetkisiz'; end if;
  select name into v_name from public.class_codes where code = old and owner = auth.uid();
  if not found then raise exception 'bu kod senin sınıfın değil'; end if;
  loop
    tries := tries + 1;
    v_code := public.class_code_prefix(v_name) || '-' || public.class_code_suffix();
    exit when v_code <> old and not exists (select 1 from public.class_codes where code = v_code);
    if tries > 8 then raise exception 'kod üretilemedi'; end if;
  end loop;
  update public.class_codes set code = v_code where code = old and owner = auth.uid();
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'kod güncellenemedi'; end if;
  return v_code;
end $$;
revoke all on function public.teacher_class_rotate(text) from public, anon;
grant execute on function public.teacher_class_rotate(text) to authenticated;

-- Liste: yalnız bu öğretmenin sınıfları.
create or replace function public.teacher_classes()
returns table (code text, name text, weekly_goal int, ogrenci int, bu_hafta int)
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_teacher() then raise exception 'yetkisiz'; end if;
  return query
  select c.code, c.name, c.weekly_goal,
         (select count(*)::int from public.progress p where upper(p.state->'profile'->>'group') = c.code),
         (select coalesce(sum(public.week_answers(p.state)), 0)::int from public.progress p where upper(p.state->'profile'->>'group') = c.code)
  from public.class_codes c
  where c.owner = auth.uid()
  order by c.created_at;
end $$;
