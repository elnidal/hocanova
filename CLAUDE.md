# Hikayenglish LGS Kelime Koçu — Claude Code rehberi

Bu repo, 8. sınıf öğrencileri için LGS İngilizce kelime ve sınav programının **içeriğini, araçlarını ve sosyal medya üretim hattını** tutar. Proje sahibi **Murat** (İngilizce öğretmeni). Uygulamanın kodunu Murat yazıyor; içerik burada YAML olarak üretiliyor. Proje geçmişi, yol haritası ve açık sorular için önce **HANDOFF.md**'yi oku.

İletişim dili Türkçe. İçerikteki İngilizce **İngiliz yazımı** (colour, favourite, apologise).

## Yöntem: "sezdirme"

Kelime ezberletilmez. Öğrenci Türkçe bir hikâye okur; hedef kelimeler hikâyenin içinde İngilizce geçer ve öğrenci anlamı **bağlamdan kendisi çıkarır**. Sonra her kelime için 3 soru gelir: **Sezdir** (anlamı ne?), **Kullan** (İngilizce boşluk doldurma), **Sına** (LGS biçiminde soru). Aralıklı tekrar içerik dosyalarına işlenmiştir. Koç karakteri **Hoca Nova**: sıcak, esprili, asla utandırmaz.

## Klasörler

```
lgs-pilot/                 # ders içeriği ("pilot" adı tarihsel; asıl içerik klasörü bu)
  content/unit_XX_items.yaml   # 10 ünite, 633 öğretim birimi (ID: U3-012)
  content/days/uXX_day_YY.yaml # Ünite 1–6 günlük dersler (74 gün)
  content/story_bible*.md      # ünite ünite gün planı
  content/exam_course/         # Sınav Dili ek dersi: 24 ders, 177 soru
  content/tests/               # seviye testi, ünite giriş kontrolü, kalıcılık
  content/coach.yaml           # Hoca Nova mesaj havuzu
  schema/                      # JSON Schema (YAML yazımıyla)
  tools/                       # doğrulayıcılar
lgs-kaynak/                # uygulamadan bağımsız bilgi katmanı
  units/unit_XX_kaynak.yaml/.md  # müfredat, dilbilgisi, tuzaklar, LGS odağı, phrase_bank
  engine/                      # hikâye motoru: world, rules (R01–R53), season, şablonlar, MOTOR.md
  exam/sinav_dili.yaml         # 14 soru kökü (S01–S14), taktikler
  exam/sosyal_medya_postlar.yaml  # 509 post verisi
prototype/                 # tek dosyalık tıklanabilir web prototipi (Ü1–6)
reels/                     # Reels video üretim hattı (HTML animasyon → MP4)
sosyal_medya/              # post havuzu üreticisi + çıktı xlsx
havuz_xlsx/                # ünite havuz çalışma kitapları (insan okuması için)
docs/                      # üretim yöntemi, ilk plan, ekran görüntüleri
```

## Komutlar

```bash
pip install pyyaml jsonschema openpyxl playwright   # Chromium + ffmpeg de gerekli (Reels için)
python3 lgs-pilot/tools/lgs_validate.py           # günlük dersler → beklenen: 0 ENGEL, 0 UYARI
python3 lgs-pilot/tools/exam_course_validate.py   # ek ders → 0 ENGEL
python3 lgs-pilot/tools/exam_course_md.py         # ek dersin okunur .md'si
python3 lgs-kaynak/tools/kaynak_tool.py           # kaynak dosyalarını doğrular + .md üretir (--check: yalnız doğrula)
python3 prototype/build_prototype.py              # YAML → prototype/prototip_lgs.html
python3 reels/render.py çıktı.mp4                 # reels/data.json'daki 3 kelimeyle 26 sn'lik Reel
python3 sosyal_medya/posts.py                     # post havuzunu yeniden üretir
```

Herhangi bir içerik dosyasını değiştirdikten sonra ilgili doğrulayıcıyı çalıştır; ENGEL bırakma.

## Değişmez içerik kuralları (doğrulayıcı çoğunu denetler)

- **Çeviri yasağı:** bir kelimenin Türkçe karşılığı, o kelimenin öğretildiği gün hikâyede, başlıkta, koç girişinde ve bildirimlerde yazılmaz. Items dosyasında `meaning_ban` (düz kökler) ya da `ban_tr` (regex) listeleri var.
- **"İngilizce kelime + etmek/yapmak" yasak** ("WORK OUT yaptı" yazılmaz; fiil İngilizce konuşmanın içine konur).
- Her yeni kelime hikâyede **en az 3 farklı satırda** geçer.
- **Doğru cevap her zaman `options[0]`, `answer: 0`**; uygulama karıştırır. 3–4 şık, savunulabilir tek cevap.
- **Belirteçler:** kelime `{U3-012}` ya da `{U3-012|görünen biçim}`; İngilizce konuşma `<en>…</en>`; altı çizili `<u>…</u>`.
- **Soru kimlikleri:** `uXdYY-NNN-z|k|s` (sezdir/kullan/sına), tekrar soruları `-rNN`. Ünite 1'de eski biçim `dYY-…` duruyor (bilinen tutarsızlık).
- LGS biçimli sorularda `stem_id` (S01–S14) kullan.
- **Aralıklı tekrar:** d+1 hatırlama, d+3 yeni bağlamda geçiş, d+7 en az 3 ve d+14 en az 2 LGS tarzı soru; ünitenin 1. günü önceki üniteden 5 soru; her hikâyede önceki ünitelerden 2–4 kelime.
- **Present Perfect yok** (8. sınıf programında yok); "Have you ever been to…?" yalnız sabit kalıp.
- **Ton:** durum komedisi evet; zorbalık, aşağılama, karakterler arası romantizm, tehlikeli davranış, gerçek marka ya da ünlü yok.
- **Özgünlük:** geçmiş LGS sorularını ve ders kitabı metinlerini kopyalama; sorular özgün yazılır.
- **Kanon:** karakter bilgileri `lgs-kaynak/engine/world.yaml`'da. Örnek: Bora'nın kedisi YOK (bahaneydi); Duru'nun köpeği Fıstık (erkek), Elif'in köpeği Pamuk (dişi); grup adı Wrong Number.

## Öğretim birimi sınıfları

ÇEKİRDEK, KALIP / İŞLEV, TUZAK öğretilir. BİLİNEN (A1) sayılmaz, TANIMA öğretilmez, ÖNCEKİ ÜNİTE tekrar edilir. Öncelik: en az 2 bağımsız kaynakta geçmek ya da kalıp olmak. Murat **sıkı liste** ister: gereksiz kelime ekleme.

## Çalışma alışkanlıkları

- YAML dosyaları büyük. Tamamını okumak yerine `grep` ya da küçük Python sorgularıyla gerekeni çek (token tasarrufu Murat için önemli).
- Alt ajanları yalnız paralel yazım işlerinde kullan; az ve iyi talimatlı ajan tercih et.
- `.md` dosyaları araçla üretilir (`*_kaynak.md`, `SINAV_DILI_DERSLERI.md`); elle düzenleme, YAML'ı değiştirip yeniden üret.
- Sosyal medyaya **paylaşım yapmak** Murat'ın onayıyla olur; şifre ya da token'ı koda veya repoya yazma (`.env`, git'e girmez).
