-- Pilot özeti: öğrenci başına durum ve kelime zorluğu. Supabase → SQL Editor'de bir kez çalıştır, sonra
--   select * from analytics.student_summary order by son_islem desc;
--   select * from analytics.word_stats order by yanlis_yuzde desc, yanlis desc limit 30;
-- `analytics` şeması API'ye AÇIK DEĞİL: öğrenciler (anon/authenticated) bu görünümleri okuyamaz;
-- yalnız SQL Editor / service rolü (sen) görür. Bu yüzden görünümü public şemaya koyma.

create schema if not exists analytics;
revoke all on schema analytics from anon, authenticated;

create or replace view analytics.student_summary as
select
  coalesce(p.state->'profile'->>'nick', '(takma ad yok)')                         as takma_ad,
  p.state->'profile'->>'group'                                                    as sinif,
  p.state->'placement'->>'level'                                                  as seviye,
  (p.state->'placement'->>'tot')::int                                             as test_puani,
  (select count(*) from jsonb_object_keys(coalesce(p.state->'doneDays', '{}'::jsonb)))          as biten_ders,
  coalesce(jsonb_array_length(p.state->'progress'->'log'), 0)                     as cevap_sayisi,
  round(100.0 * (select count(*) from jsonb_array_elements(coalesce(p.state->'progress'->'log', '[]'::jsonb)) e where (e->>'ok')::boolean)
        / nullif(jsonb_array_length(p.state->'progress'->'log'), 0))              as dogru_yuzde,
  (select count(*) from jsonb_each(coalesce(p.state->'progress'->'items', '{}'::jsonb)) i where i.value->>'status' = 'known') as biliniyor,
  (select count(*) from jsonb_each(coalesce(p.state->'progress'->'items', '{}'::jsonb)) i where i.value->>'status' = 'unc')   as kararsiz,
  (select count(*) from jsonb_each(coalesce(p.state->'progress'->'items', '{}'::jsonb)) i where i.value->>'status' = 'new')   as yeni_gorulen,
  (p.state->'retentions'->'u1:day08'->>'ok')::int                                 as gun8_dogru,
  (p.state->'retentions'->'u1:day08'->>'n')::int                                  as gun8_soru,
  (p.state->'retentions'->'u1:day15'->>'ok')::int                                 as gun15_dogru,
  (p.state->'retentions'->'u1:day15'->>'n')::int                                  as gun15_soru,
  to_timestamp((p.state->>'savedAt')::bigint / 1000.0)                            as son_islem,
  u.is_anonymous                                                                  as anonim,
  u.email                                                                         as eposta,
  u.created_at                                                                    as ilk_giris
from public.progress p
join auth.users u on u.id = p.user_id;

-- Hangi kelimeler zorluyor? (tüm öğrenciler birleşik)
create or replace view analytics.word_stats as
select
  i.key                                                       as birim,
  count(*)                                                    as ogrenci,
  sum((i.value->>'correct')::int)                             as dogru,
  sum((i.value->>'wrong')::int)                               as yanlis,
  round(100.0 * sum((i.value->>'wrong')::int)
        / nullif(sum((i.value->>'correct')::int) + sum((i.value->>'wrong')::int), 0)) as yanlis_yuzde,
  count(*) filter (where i.value->>'status' = 'known')        as biliniyor
from public.progress p
cross join lateral jsonb_each(coalesce(p.state->'progress'->'items', '{}'::jsonb)) i
group by i.key;
