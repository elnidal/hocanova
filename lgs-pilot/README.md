# Hikayenglish LGS · Ünite 1 (Friendship, 17 gün, 100 birim) + Ünite 2 (Teen Life, 16 gün, 92 birim) + Ünite 3 (In the Kitchen, 11 gün, 63 birim) + Ünite 4 (On the Phone, 10 gün, 55 birim) + Ünite 5 (The Internet, 10 gün, 61 birim) + Ünite 6 (Adventures, 10 gün, 57 birim)

Durum: **TASLAK**. Editör kontrolü (sezdirme yeterliliği, Türkçe doğallığı) bekliyor.

## İçerik

```
lgs-pilot/
├── schema/lgs_day.schema.yaml        # günlük ders dosyası şeması
├── content/
│   ├── unit_01_items.yaml            # onaylı 100 birim (U1-001 … U1-100); 30'unda pilot_day var
│   ├── days/u01_day_01 … 17.yaml     # 17 günlük ders (1–5 pilot, 6–17 ünitenin kalanı)
│   ├── story_bible.md                # karakterler, olmuş olaylar, gün gün olay örgüsü (Ünite 1)
│   ├── unit_02_items.yaml            # Ünite 2: 92 birim (U2-001 … U2-092)
│   ├── days/u02_day_01 … 16.yaml     # Ünite 2: 16 günlük ders
│   ├── story_bible_u02.md            # Ünite 2 çerçevesi (Teen Life anketi) ve olay örgüsü
│   ├── unit_03_items.yaml            # Ünite 3: 63 birim (U3-001 … U3-063); meaning_ban = çeviri yasağı kökleri
│   ├── days/u03_day_01 … 11.yaml     # Ünite 3: 11 günlük ders (Junior Chef yarışması)
│   ├── story_bible_u03.md            # Ünite 3 çerçevesi ve olay örgüsü
│   ├── unit_04_items.yaml            # Ünite 4: 55 birim (U4-001 … U4-055)
│   ├── days/u04_day_01 … 10.yaml     # Ünite 4: 10 günlük ders (yarıyıl tatili, ilk konser)
│   ├── story_bible_u04.md            # Ünite 4 çerçevesi ve olay örgüsü
│   ├── unit_05_items.yaml            # Ünite 5: 61 birim (U5-001 … U5-061)
│   ├── days/u05_day_01 … 10.yaml     # Ünite 5: 10 günlük ders (Safer Internet Week, grubun kanalı)
│   ├── story_bible_u05.md            # Ünite 5 çerçevesi ve olay örgüsü
│   ├── unit_06_items.yaml · days/u06_day_01 … 10.yaml · story_bible_u06.md   # Ünite 6 (bahar kampı)
│   ├── tests/placement.yaml          # başlangıç testi (18 soru, 3 boyut)
│   ├── tests/unit_check.yaml         # ünite giriş kontrolü (evet/hayır + doğrulama)
│   ├── tests/retention_checks.yaml   # Gün 8 ve Gün 15 kalıcılık kontrolleri
│   └── coach.yaml                    # koçun genel mesaj havuzu
└── tools/lgs_validate.py             # doğrulayıcı
```

## Pilot akışı

| Gün | Ne olur |
|---|---|
| 1 (başı) | Başlangıç testi (4 dk) → seviye: başlangıç / orta / ileri · Ünite giriş kontrolü (2 dk) → birim durumları |
| 1–5 | Ders: hikâye (Sezdir) → İngilizce sahne → her birim için Sezdir · Kullan · Sına → tekrar → hap bilgi → koç |
| 8 | Kalıcılık kontrolü 1 (10 soru, 4 dk) |
| 15 | Kalıcılık kontrolü 2 (10 soru, 4 dk) |

Hikâye: Ece'nin doğum günü partisi haftası. Kadro: Ece (düzenleyen), Kaan (hep acelesi var, dışa dönük), Bora (bahane ustası, sonunda sözünü tutuyor), Duru (kafası rahat), Selin (güvenilir, dürüst), Ege (kuzen, kaba), Elif (komşu).

| Gün | Tema | Birimler |
|---|---|---|
| 1 | Davet ve kabul | Would you like to…? · How about…? · invite · invitation · accept · I'd love to |
| 2 | Red ve özür | refuse · Sorry, I can't · excuse · apologise · Why not? · Sounds + SIFAT! |
| 3 | Güven | trust · count on · rely on · reliable · honest · loyal |
| 4 | Söz, sır, destek | keep a promise · break a promise · keep a secret · back up · supportive · caring |
| 5 | Kişilik ve tuzaklar | laid-back · outgoing · mean · fair · full · stuffed + 2 pilot finali sorusu |
| 6 | Parti albümü | buddy · close friend · friendship · mate · true friend · You're fun to be with |
| 7 | Yeni öğrenci | chat · get on well (with) · have a lot in common · interested in · introduce · same opinion |
| 8 | Hafta sonu planı | Do you want to…? · I would like to… · It doesn't matter · prefer · That would be great · What about…? |
| 9 | Bilim fuarı haftası | attend · busy · I have nothing to do · join · miss · reply |
| 10 | Kavga | argue · feel alone · feeling · relationship · strong bond · text |
| 11 | Yalan | dishonesty · lie · promise · secret · tell lie · tell secret to others |
| 12 | Barışma | give advice · always there for me · share · spend time · support · support each other |
| 13 | İkili proje | come over · depend on · mutual respect · respect · unreliable · respectful |
| 14 | Dergideki test | calm · like (What is he like?) · patient · personal trait · personality · understanding |
| 15 | Kuzen Ege geri döndü | generous · helpful · jealous · loyalty · self-centered · stubborn |
| 16 | Gezi formu | offer · fashionable · funny · always in a hurry · self-disciplined · as soon as possible |
| 17 | Lunapark ve ünite finali | boring · exciting · fun · thrilling + 4 ünite finali sorusu |

## Tekrar takvimi (dosyalara işlendi)

- Gün d+1: hatırlama sorusu (`review`, Türkçe yok)
- Gün d+3: aynı birim yeni hikâyede geçer (Gün 4 hikâyesinde Gün 1 birimleri, Gün 5'te Gün 2 birimleri)
- Gün d+7 (≥3 soru) ve d+14 (≥2 soru): LGS biçiminde tekrar sorusu
- Pilot kalıcılık kontrolleri: Gün 8 / 15
- Yanlış yapılan birimler kod tarafında daha erken tekrar kuyruğuna alınır

## Kodda dikkat

- **Doğru cevap içerikte her zaman ilk şıktır (`answer: 0`).** Uygulama şıkları karıştırmalı ve hangi yanlış şıkkın seçildiğini kaydetmeli.
- Belirteçler: `{U1-013}` / `{U1-013|invited}` → dokununca ses; `new_items` içindeyse "yeni", değilse "tekrar" rengi. `<en>…</en>` → İngilizce, dinleme düğmesi.
- `coach.end_mixed` içindeki `{weak}` = o derste ilk denemede yanlış yapılan birimler.
- Ünite giriş kontrolünde "evet" denen birim, o birimin `sina` sorusuyla doğrulanır.
- Seviye etkisi (başlangıç / ileri): pilotta içerik aynı; seviye yalnız tempo ve tekrar aralığını değiştirir.

## Ölçülecekler (pilot başarı ölçütleri)

| Ölçüt | Hedef |
|---|---|
| 5 günü tamamlama | %80+ |
| Ders süresi | ≤ 10 dk |
| Gün 8 / Gün 15 doğru oranı | %70+ |
| Giriş kontrolünde "biliyor" sayılıp sonra yanlış yapılan birim oranı | düşük |
| Öğrenci anketi | eğlenceli / komik / sıkıcı |

## Doğrulama

```
pip install pyyaml jsonschema
python3 tools/lgs_validate.py
```

Denetlenenler: şema · her yeni birim hikâyede ≥3 satırda · Türkçe karşılık hikâyede, başlıkta, koç girişinde ve bildirimlerde geçmiyor · öğretilmemiş birim belirteci yok · tekrar takvimi · soru tutarlılığı · bildirim ≤ 90 karakter.

## Ünite 3 notları

- `meaning_ban` (items): yaygın Türkçe kelimelerde (tatlı, önce/sonra, tava…) çeviri yasağı bu köklerle denetlenir; doğrulayıcı `ban_tr` (regex) alanını da destekler.
- `stem_id` (sorular): Sınav Dili modülündeki soru kökü (lgs-kaynak/exam/sinav_dili.yaml). Ünite 3 S07 (tarif sırası) sorularının evidir.
- Gün 11'de 4 ünite finali sorusu (r11–r14): tarif sırası, menü tablosu, diyalog, metin.

- S12 (altı çizili kelime) sorularında hedef kelime `<u>…</u>` ile işaretlenir; uygulama altı çizili gösterir.

## LGS Sınav Dili ek dersi (content/exam_course/)

24 kısa sınav odaklı ders, kelime programından bağımsız ama ona bağlı (`unlock_after`):
- **Modül A — Soru kökleri (A01–A08):** diyalog tamamlama, kim katılıyor, metinde var/yok, doğru olan, başlık, tablo, sıralama, amaç / altı çizili kelime.
- **Modül B — İşleve göre kalıplar (B01–B10):** davet, ret/özür, tercih, sıklık, tarif, telefon, açıklama/öneri, karşılaştırma, zorunluluk, neden–sonuç/tahmin.
- **Modül C — Atölye (C01–C06):** diyalog, tablo, metin, çeldirici avı, 2 mini deneme.

Şema `schema/exam_lesson.schema.yaml` · doğrulama `python3 tools/exam_course_validate.py` · okunur hali `python3 tools/exam_course_md.py` → `content/exam_course/SINAV_DILI_DERSLERI.md`.
