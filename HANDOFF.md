# Devir notu: Cowork → Claude Code

*Hazırlayan: Claude (Cowork oturumu), Murat ile birlikte · 17 Ekim 2026*

Merhaba. Bu projeyi Murat'la birlikte Cowork'te birkaç hafta boyunca yürüttük. Bundan sonra sen devralıyorsun: kodla birlikte ve Murat'ın bilgisayarındaki dosyalara erişerek. Bu not, projeye en az benim kadar hâkim olman için yazıldı. Çalışma kuralları ve komutlar **CLAUDE.md**'de; burada hikâyenin tamamı, durum, yol haritası ve önerilerim var.

**İlk işin:** bu notu ve CLAUDE.md'yi oku, doğrulayıcıları çalıştır (hepsi 0 hata vermeli), sonra en alttaki "Murat'a sorulacaklar" listesini Murat'la konuş. Hemen büyük işe girişme; Murat yavaş ve adım adım ilerlemeyi seviyor.

---

## 1. Proje ve Murat

- **Hikayenglish**, Türkçe konuşanlara hikâyeyle İngilizce kelime öğreten bir ürün fikri. Bu repo onun **LGS paketi**: 8. sınıf, 10 ünite, LGS İngilizce bölümü (10 soru).
- **Murat** İngilizce öğretmeni. Öğrencileriyle sahada; içerik kararlarında son söz onun. Ünite kaynaklarını (ders kitabı listeleri, "sınavda çıkmış kelimeler" tabloları, kalıp cümle listeleri) o gönderdi.
- Uygulamanın kodunu Murat yazacak (henüz konuşmadık: hangi teknoloji, repo nerede; sor).
- Murat'ın **@lgsingilizce** adında bir Instagram hesabı var (Ekim 2026'da yaklaşık 2.900 takipçi; "her gün 1 çözümlü soru" karuselleri). İlk Reels'imizi 16–17 Ekim'de yükledi.
- **Takvim:** LGS Haziran 2027. 8. sınıf programı 2027-28'de Maarif Modeli'ne geçecek; içerik temalara göre etiketlendi, ileride yeniden eşlenebilir.
- Murat'ın hassas olduğu konular: **token maliyeti** (gereksiz okuma ve çok ajan istemiyor), **sıkı listeler**, Türkçe ve sade anlatım.

## 2. Yöntem (neden böyle?)

**Sezdirme:** Öğrenci kelimenin anlamını hikâyeden kendisi çıkarır. Gerekçe: çıkarım yapılarak öğrenilen kelime daha kalıcı, ve LGS soruları zaten bağlamdan anlam çıkarmayı ölçüyor. Murat bu konuda zaman zaman kararsız: "yarı Türkçe yarı İngilizce hikâye iyi bir fikir, ama sezdirme her kelimede işe yaramayabilir" diyor. Bizim vardığımız orta yol fikri: **ilk karşılaşmada sezdir, takıldığında dokun-göster** (anlam gizli, öğrenci isterse görür). Bu, uygulama tasarımında açık bir karar; Murat'la konuşun.

**Bir günlük ders (5–10 dk):** koç girişi → 18–28 satırlık Türkçe hikâye (hedef kelimeler İngilizce, tıklanabilir) → 3–5 satırlık tamamen İngilizce sahne (mesajlaşma/diyalog) → her kelime için Sezdir / Kullan / Sına → tekrar soruları → hap bilgiler → koç kapanışı ve 3 bildirim (≤90 karakter).

**Kişiselleştirme:** 18 soruluk seviye testi (kelime tanıma, bağlam, sınav kullanımı); ünite girişinde "biliyor musun?" listesi (4 sahte kelimeyle, her "evet" bir soruyla doğrulanır); kelime durumları yeni → kararsız → biliniyor. Testler tek denemelik ve geri bildirimsiz (Murat'ın isteği: ölçüm bozulmasın); derslerde yanlış cevapta açıklama gösterilir ve soru ders sonunda bir kez yeniden sorulur.

**Hikâye dünyası:** İzmir'de bir ortaokulun 8. sınıfı ve WhatsApp grubu. Ece (düzenleyici), Kaan (hep acele, basketbol), Bora (bahaneci → güvenilir, davulcu), Duru (rahat, gitar, köpeği Fıstık), Selin (dakik, dürüst), Elif (yeni gelen, vokal, köpeği Pamuk), İngilizce öğretmeni Murat Bey. Sezon okul yılını izler: Ü1 parti, Ü2 Teen Life anketi, Ü3 Junior Chef, Ü4 telefonla kurulan ilk konser (grup adı Wrong Number), Ü5 Safer Internet Week, Ü6 doğa kampı; Ü7–10 için plan var (İzmir turu, ev işleri haftası, bilim şenliği, afet hazırlık haftası), hikâyesi yazılmadı.

## 3. Yapılanlar

| Ünite | Birim | Durum |
|---|---|---|
| 1 Friendship | 100 | hikâyeli, 17 gün |
| 2 Teen Life | 92 | hikâyeli, 16 gün |
| 3 In the Kitchen | 63 | hikâyeli, 11 gün |
| 4 On the Phone | 55 | hikâyeli, 10 gün |
| 5 The Internet | 61 | hikâyeli, 10 gün |
| 6 Adventures | 57 | hikâyeli, 10 gün |
| 7 Tourism | 61 | yalnız havuz |
| 8 Chores | 50 | yalnız havuz |
| 9 Science | 46 | yalnız havuz |
| 10 Natural Forces | 48 | yalnız havuz |
| **Toplam** | **633** | **74 gün** |

- **Kelime havuzları:** her ünitede kaynaklar birleştirildi, "satır" değil "öğretim birimi" sayıldı (eşanlamlılar ve kelime aileleri tek birim), kaynak listelerindeki yanlış Türkçe karşılıklar düzeltildi ("terrific = korkunç", "saucepan = sos tavası", "hang on = asmak" gibi). `exam` alanı: 2013–2020 TEOG ve 2018–2020 LGS'de kaç kez çıktığı (Ü6 ve Ü10'un tablosu eksik).
- **Ünite kaynak dosyaları** (`lgs-kaynak/units/`): müfredat işlevleri, dilbilgisi ve Türk öğrencinin yaygın hataları, tuzaklar, LGS odağı, kalıp cümle havuzu (`phrase_bank`), hap bilgiler. Her üründe (uygulama, post, video, deneme) buradan beslen.
- **Günlük dersler** (Ü1–6): yazar ajanları + editör ajanları + doğrulayıcı ile üretildi. Doğrulayıcı 0 hata veriyor. **Durum: TASLAK**, öğretmen okuması yapılmadı. Items dosyalarındaki `pilot_day` alanı "bu kelime ünitenin kaçıncı ders gününde öğretiliyor" demek (adı tarihsel).
- **Sınav Dili ek dersi:** 24 kısa ders, 177 özgün soru. Modül A soru kökleri, B işleve göre kalıplar, C atölyeler ve 2 mini deneme. Her dersin `unlock_after` alanı var.
- **Prototip:** tek HTML dosyası; Ü1–6'nın bütün günleri, testler, ilerleme ekranı ve bildirim önizlemesi çalışıyor. `prototype/build_prototype.py` YAML'dan yeniden üretir (bu oturumda yeniden yazıldı ve denendi).
- **Sosyal medya post havuzu:** 509 post (tuzak, hap bilgi, sınavda çıktı, 30 saniyede LGS sorusu, soru kökü taktiği, Hoca Nova taktiği) ve 60 günlük plan. Haftalık ritim: Pzt tuzak, Sal çıkmış, Çar soru, Per hap, Cum soru kökü, Cmt soru, Paz taktik.
- **Reels hattı:** `reels/`. Bir HTML animasyon şablonu ("3 saniyede bil": kelime, 4 şık, 3-2-1 sayaç, doğru şık yeşil, hikâyeden örnek cümle, Hoca Nova balonu, kapanışta "Kaç tanesini bildin?"), Playwright ile kare kare çekilip ffmpeg ile MP4'e çevriliyor (1080×1920, 30 fps, ~26 sn, sayaç tıkırtısı + "ding" sesi). Renkler hesabın logosundan (turkuaz, kırmızı, sarı). Bir video yaklaşık 1 dakikada çıkıyor. İlk örnek (share / refuse / count on) yayımlandı.

## 4. Yol haritası (önerim)

Sıra Murat'ın kararı; benim önerim şu:

1. **Repo düzeni (1. gün):** bu klasörü Murat'ın bilgisayarında git reposu yap, ilk commit. `.gitignore` (frames/, *.mp4 çıktıları, .env). Bir `Makefile` ya da `tasks.py` ile tek komutluk işler: `validate`, `build`, `reels`, `posts`.
2. **Reels motorunu genelleştir (1. hafta):** haftalık otomatik üretim (bkz. bölüm 5). Hesap büyüdükçe uygulama için hazır kitle oluşur; bu yüzden uygulamadan önce başlaması iyi.
3. **Uygulama MVP (Murat'la):** Ü1–6 içeriği hazır. İçeriği uygulamaya verecek bir JSON derleme adımı (prototip derleyicisi iyi bir başlangıç). Asıl iş: aralıklı tekrar motoru, kelime durumları, bildirimler, ilerleme. Hedef: **yarıyıl tatili (Ocak–Şubat 2027)** civarında öğrencilere açılabilmesi; LGS'ye kadar işe yarasın.
4. **Ünite 7–10 içeriği (Şubat'tan önce):** bu üniteler bahar döneminde işleniyor. İki seçenek: (a) tam hikâyeli günler (yaklaşık 40 gün, motor ve sezon planı hazır); (b) önce **hafif mod** (kelime kartı + Kullan/Sına soruları, hikâyesiz) bir betikle üretilsin, hikâyeler zaman kalırsa. Ben (b) ile başlamayı öneririm.
5. **Öğretmen/editör okuması:** taslak içerik bir kez gözden geçmeli. Murat'a "kontrol listesi" ile birkaç günü okutmak hızlı yol.
6. **Eksikler:** Ü6 ve Ü10 sınavda çıkmış tabloları; 2021 sonrası LGS'nin taranması; programın sonuna deneme bölümü.

## 5. Otomasyon ve hız önerileri

**Reels, haftalık:**
- `reels/batch.py --hafta N`: havuzdan kelime seçer → N video + açıklama metinleri + yayın takvimi (CSV) üretir. Seçim kuralı: `exam` sayısı yüksek olanlar önce, aynı kelime 30 gün içinde tekrar etmesin, okul takvimindeki üniteyle uyumlu. Yayınlananlar `reels/posted.csv`'ye yazılsın.
- Yeni şablonlar: **tuzak kelime** ("mean ≠ anlam"), **mini sahne** (karakterler 2–3 satırlık İngilizce diyalogla kelimeyi sezdirir; yöntemimizin vitrini), **soru kökü taktiği** (`sinav_dili.yaml`'dan). Şablonların hepsi aynı `seek(t)` mantığıyla (deterministik kare çekimi) çalışsın.
- Kareleri paralel çek (birden çok Playwright sayfası) ve JPEG kullan; 5 video birkaç dakikada çıkar.
- Otomatik kalite kontrolü: DOM'da taşan metin var mı, Instagram arayüzünün kapattığı alt ~350 px ve sağ kenarda içerik var mı, kontrol et.
- Haftalık üretim, Claude Code'un zamanlanmış görevleriyle ya da Murat'ın bilgisayarında cron ile çalışabilir; çıktılar bir "Reels/hafta-N" klasörüne düşer.

**Paylaşım:**
- Şimdilik: Murat videoları Meta Business Suite'te zamanlıyor (haftada ~10 dk).
- Sonra (format tutarsa): **Instagram Graph API** ile tam otomatik. Gerekenler: Professional (Business/Creator) hesap, bağlı Facebook sayfası, Meta geliştirici uygulaması, uzun ömürlü erişim jetonu (Murat oluşturur, `.env`'de tutulur, repoya girmez). Reels için videonun herkese açık bir URL'de olması gerekir (container oluştur → durum hazır olunca publish). Bunu Murat'ın açık onayı olmadan kurma.
- Her durumda paylaşım Murat'ın onayıyla yapılmalı.

**İçerik üretiminde hız:**
- YAML'ları baştan sona okuma; `grep` ve küçük sorgularla çalış. Dosyalar büyük, token bütçesi önemli.
- Hikâyeli gün yazımında ünite başına 1–2 yazar ajanı + 1 editör yeterli oldu; doğrulayıcı döngüsü kaliteyi tutuyor.
- Hafif mod günleri ve sosyal medya metinleri büyük ölçüde betikle (`phrase_bank`, `traps`, `mini_lessons` alanlarından) üretilebilir; model yalnız son dokunuşta kullanılsın.

## 6. Benim fikirlerim (Murat'la tartışmaya değer)

- **Reels → uygulama hunisi:** Instagram biyografisindeki bağlantı ileride uygulamanın bekleme listesine gitsin. "Mini sahne" Reels'leri hem iyi içerik hem uygulamanın tanıtımı.
- **Hoca Nova'yı karakter olarak büyütmek:** basit, özgün bir avatar ve ses tonu; videolarda, bildirimlerde ve uygulamada aynı yüz.
- **Ücretsiz/ücretli denge:** seviye testi + Ünite 1 ücretsiz, gerisi ücretli ya da okul/öğretmen lisansı. Murat öğretmen; öğretmen paneli (sınıfın ilerlemesi) güçlü bir satış noktası olabilir.
- **Ses (TTS):** hedef kelimelerin İngilizce telaffuzu; uygulamada dokununca okunuyor. Reels'e de eklenebilir.
- **Ölçüm:** her Reels şablonu için görüntülenme / kaydetme / takip verisini haftalık tabloya işle; 2 haftada bir zayıf şablonu bırak.

## 7. Bilinen küçük tutarsızlıklar

- Ünite 1 soru kimlikleri eski biçimde (`d01-…`), diğerleri `u3d01-…`.
- "call center" Amerikan yazımıyla duruyor.
- `sosyal_medya/posts.py` çalıştırılınca `lgs-kaynak/exam/sosyal_medya_postlar.yaml` dosyasını da yeniden yazar.

## 8. Murat'a sorulacaklar (ilk konuşmada)

1. Uygulamanın kodu nerede, hangi teknolojiyle yazılıyor (web, Flutter, React Native…)? Bu repo onunla nasıl birleşecek?
2. Reels sıklığı: günde 1 mi, haftada 3–4 mü? İlk videonun sonuçları nasıldı?
3. Hangi Reels şablonu önce: tuzak kelime mi, mini sahne mi, soru kökü mü?
4. Ünite 7–10: hafif mod mu, tam hikâye mi?
5. Paylaşımı ileride Graph API ile tam otomatik yapmak istiyor mu?
6. Ücretsiz/ücretli model ve marka adı (Hikayenglish mi, lgsingilizce mi)?
7. Sezdirme mi, dokun-göster mi: uygulamanın varsayılanı ne olsun?

## 9. Ekler (bu klasörde)

| Yol | İçerik |
|---|---|
| `CLAUDE.md` | Çalışma kuralları ve komutlar |
| `lgs-pilot/` | Bütün ders içeriği, şemalar, doğrulayıcılar |
| `lgs-kaynak/` | Ünite kaynak dosyaları, hikâye motoru, Sınav Dili, post verisi |
| `prototype/` | Prototip şablonu, derleyici, derlenmiş HTML |
| `reels/` | Reels şablonu, render betiği, örnek veri, örnek video ve açıklama metni |
| `sosyal_medya/` | 509 postluk havuz (xlsx), üretici betik, örnek kart görseli |
| `havuz_xlsx/` | 10 ünitenin havuz çalışma kitabı + havuz kontrol tablosu |
| `docs/` | Ünite üretim yöntemi (13 adım), ilk ürün planı, prototip ekran görüntüleri |

Kolay gelsin. Murat'la çalışmak keyifli: net söyler, hızlı karar verir ve emeğe teşekkür etmeyi unutmaz.
