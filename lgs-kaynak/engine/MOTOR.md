# Hikâye Motoru

Hikayenglish LGS Kelime Koçu'nun 10 ünitesinde aynı dünyayı, aynı karakterleri ve aynı yazım kurallarını kullanmak için hazırlanan kalıcı paket. Motor uygulamaya bağlı değildir: ders dosyasının biçimi değişse de, ürün video, kart ya da kitap olsa da karakterler, olmuş olaylar, sezon planı ve kurallar buradan alınır.

Kısaca:
- **Kim?** Ece, Kaan, Bora, Duru, Selin, Elif (İzmir'de bir ortaokulun 8. sınıfı) ve çevreleri. Koç Hoca Nova hikâyenin dışında durur.
- **Ne zaman?** Bir okul yılı: Eylül'de doğum günü partisi, Haziran'da LGS.
- **Nasıl?** Her ünitenin bir çerçeve olayı vardır (parti haftası, anket ödevi, şef yarışması…). Her gün bir bölümdür. Kelimeler bölümün içinde sezdirilir.

## Dosyalar

| Dosya | Ne işe yarar | Kim kullanır |
|---|---|---|
| `world.yaml` | Şehir, mekânlar, karakter kartları (ses, süregiden espriler, asla yapmazlar, aile, evcil hayvan, ünite ünite gelişim), Hoca Nova, **canon_facts** (değişmez gerçekler), **open_threads** (kapanmamış iplikler) | Yazar, editör, Story Bible hazırlayan |
| `rules.yaml` | R01–R53: belirteç, çeviri yasağı, uzunluk, tekrar takvimi, soru, koç, ton ve güvenlik kuralları. Her kural için validator denetliyor mu (evet / kısmen / hayır / elle) | Yazar, editör, validator geliştiren |
| `season.yaml` | 10 ünitelik sezon: ay, çerçeve olay, çatışma, karakter yayları, komedi motoru, final, kanca, durum | Ünite planlayan |
| `episode_template.yaml` | Bir günlük bölümün vuruşları (B1–B7), Story Bible gün satırı biçimi, ünite yayı (A1–A6) | Story Bible hazırlayan, yazar |
| `writer_prompt_template.md` | Yazar ajanı istemi; yer tutucular `{UNIT}` `{UNIT_TITLE}` `{DAYS}` `{PREFIX}` `{ITEMS_FILE}` `{STORY_BIBLE}` | Yazar ajanlarını başlatan |
| `story_bible_template.md` | Yeni ünitenin Story Bible'ı için boş şablon (Ü2 düzeninde) | Ünite planlayan |

Motorun dışında kalan ama birlikte çalışan dosyalar:
- `lgs-pilot/content/unit_XX_items.yaml`: birimler (id, display, meaning_tr, trap_note, pilot_day)
- `lgs-pilot/content/story_bible*.md`: ünite Story Bible'ları
- `lgs-pilot/schema/lgs_day.schema.yaml` ve `lgs-pilot/tools/lgs_validate.py`: makine denetimi
- `lgs-kaynak/units/unit_XX_kaynak.yaml` (`lgs-kaynak/schema/unit_kaynak.schema.yaml`): ünitenin kalıcı bilgisi (işlevler, dilbilgisi, tuzaklar, LGS odağı, `story_hooks`)

**Öncelik sırası** (çelişki olursa): `world.yaml` canon_facts → yazılmış gün dosyaları → ünite Story Bible'ı → season.yaml önerileri.

## Yeni bir ünite: adım adım

1. **Havuz.** Ünitenin ham listeleri tek havuzda birleşir (kaynak işaretli): `LGS_UniteN_..._Havuz_vX.xlsx`. Satır değil öğretim birimi sayılır; liste onaylanıp dondurulur (Çalışma Yöntemi §2–4).
2. **Items.** Onaylı birimler `lgs-pilot/content/unit_NN_items.yaml` olur (`U{N}-001…`). `pilot_day` bu aşamada boştur.
   - meaning_tr'yi yazarken **çeviri yasağını düşün**: "yemek", "sonra", "tat" gibi gündelik kelimeler karşılık olursa, o birimin geçtiği her hikâyede yasaklanır (rules.yaml R12).
3. **Kaynak dosyası.** `lgs-kaynak/units/unit_NN_kaynak.yaml`: işlevler, dilbilgisi, tuzaklar, LGS soru kalıpları, öncelikli birimler. `story_hooks` alanı hangi sahnenin hangi birimleri doğal taşıdığını söyler. Bu dosya bir sonraki adımın malzemesidir.
4. **Season satırını ayrıntılandır.** `season.yaml`'daki ünite satırı (çerçeve, çatışma, yaylar, final, kanca) kelime listesine göre güncellenir. Durum `kaynak_bekleniyor` → `havuz_hazir`. Kanon ve yay yönü değişmez, olaylar değişebilir.
5. **Story Bible.** `story_bible_template.md` → `lgs-pilot/content/story_bible_uNN.md`.
   - Gün tablosu episode_template'teki ünite yayını izler (A1–A6).
   - Günde 4–6 birim. Karışan birimler aynı ya da art arda günlere konur.
   - Tablo bitince items dosyasına `pilot_day` yazılır. Gün sayısı = tekil birim ÷ ~6.
6. **Yazar ajanları.** `writer_prompt_template.md` doldurulur. Günler 3–4 yazara bölünür (ör. 1–4, 5–8, 9–12, 13–16).
   - Takvim birimlerin `pilot_day`'ine dayandığı için yazarlar paralel çalışabilir; birbirlerinin dosyasını beklemezler.
   - Her yazar yalnız kendi dosyalarına dokunur.
7. **Doğrulayıcı.** `cd lgs-pilot && python3 tools/lgs_validate.py`: tüm ünite için 0 ENGEL, 0 UYARI.
   - Validator'ın denetlemediği kurallar (`check: hayir/elle`) için rules.yaml'daki listeye bakılır. Özellikle: `answer: 0`, id biçimi, hikâye/sahne uzunluğu, ünite 1. günü 5 LGS sorusu, 2–4 eski ünite belirteci.
8. **Gözden geçirme.**
   - (a) Bağımsız okuma (ikinci ajan ya da kişi): iki doğru cevaplı soru, yanlış anahtar, dil hatası, eş anlamlıyla anlam sızıntısı, kanon çelişkisi.
   - (b) İnsan editör: Türkçenin doğallığı ve Z07 ("anlam bağlamdan çıkarılabiliyor mu?").
   - (c) Ünite bitince **world.yaml güncellenir**: yeni canon_facts, karakterlerin `gelisim.uN` satırı, kapanan/açılan open_threads, `canon_through`. season.yaml'da ünite durumu `yazildi` olur.
9. **Prototip.** `lgs-pilot/prototip_lgs_pilot.html` üzerinde uçtan uca deneme (telefon genişliği, koyu tema), sonra pilot öğrenciler.

## Örnek akış: Ünite 3 (In the Kitchen)

| Adım | Durum | Yapılacak |
|---|---|---|
| 1 Havuz | ✓ `LGS_Unite3_InTheKitchen_Havuz_v1.xlsx` | — |
| 2 Items | ✓ `unit_03_items.yaml`, 60 birim, pilot_day yok | meaning_tr'de "yemek / sonra / tat / tatlı / mutfak" sızıntı riskini gözden geçir |
| 3 Kaynak | ✓ `lgs-kaynak/units/unit_03_kaynak.yaml` (taslak) | Story Bible'dan önce `story_hooks` ile season.yaml Ü3 satırını uzlaştır (ör. Bora'nın 'gizli aşçı' yayı ↔ omlet krizi kancası) |
| 4 Season | öneri hazır | "Küçük Şefler Yarışması"; ekipler Ece–Selin–Elif / Kaan–Bora–Duru; Kaan'ın seçme sonucu G1'de |
| 5 Story Bible | ✗ | ~10 gün. Ör.: G1 yarışma ilanı + seçme sonucu → G2–3 tarif ve ölçüler → G4–5 ilk deneme (Fıstık) → G6 Ege "gurme" → G7–8 kriz (yanan deneme, çöken pasta) → G9 çözüm → G10 yarışma + final soruları |
| 6 Yazarlar | — | `{UNIT}=3`, `{UNIT_TITLE}=In the Kitchen`, `{PREFIX}=u3d`, `{ITEMS_FILE}=…/unit_03_items.yaml`, `{STORY_BIBLE}=…/story_bible_u03.md`, `{DAYS}`: 1–3 / 4–6 / 7–10 |
| 7–9 | — | validator → bağımsız okuma → editör → world.yaml güncellemesi → prototip |

## Bakım kuralları
- world.yaml yalnız **yazılmış** içerikten güncellenir. Plan/öneri season.yaml'da durur, yazılınca kanona taşınır.
- Bir kanon gerçeğini değiştirmek gerekirse eski metin de düzeltilir ya da gerçek "açık süreklilik notu" olarak burada kalır. Sessizce değiştirilmez.
- Validator'a yeni denetim eklendikçe rules.yaml'daki `check` alanı güncellenir (öneriler: `validator_gap_suggestions`).

## Açık süreklilik notları

Ü1–Ü2 metinleri ve plan dosyaları karşılaştırılırken bulunanlar. Motor dosyaları bunlarla çelişmeyecek biçimde yazıldı. Karar gerekenler işaretli.

1. **Ece grupta mı?** Ü1 G15'te (s26) Elif, Ece'yi gruba şarkıcı olarak çağırdı, Ece "Deal!" dedi. Ü2'de grup yalnız Duru (gitar) + Elif (vokal) ve sonra Bora (davul). Ece hiç anılmadı. *Öneri:* Ü4'te Ece grubun menajeri olur (OT5).
2. **Bora'nın cumartesileri dolu.** Ü1 G11'de gizli dans kursu "cumartesileri". Ü2 G7'de karate cumartesi sabahı. Ü2 G4'teki soru kökünde ve G5'te prova cumartesi öğleden sonra Duru'nun evinde. Dans dersi Ü2 G5'te hâlâ sürüyor ("My dance teacher would be proud"). *Karar gerekli:* dans kursu hafta içi akşama alınsın (bir cümleyle anılması yeter).
3. **Bora'nın dans gösterisi** ("next Saturday", Ü1 G12 s25) hiç yazılmadı. Sezon planında Ü10 yıl sonu gösterisinde kapanıyor (OT2).
4. **Kaan'ın basketbol seçmesi** (2 Aralık) Ü2'de hazırlığıyla anlatıldı, sonucu yazılmadı. *Öneri:* Ü3 G1'de "yedek oyuncu olarak takımda" (OT1).
5. **Elif'in çalgısı.** Ü1 G7'de "I play the guitar too!" dedi. Ü2'de yalnız vokal. Çelişki değil ama Elif'in gitar çaldığı unutulmamalı.
6. **Şehir.** Ü1 Story Bible "şehir belirtilmez" diyor (tek atıf: Bora, "the best cake in İzmir"). Motor İzmir'i açıkça kullanıyor (görev tanımı gereği). Çelişen metin yok. story_bible.md'deki bu satır güncellenebilir.
7. **Kerem kimin kuzeni?** Ü2 G12'de Ege "my cousin Kerem" dedi, Kerem herkese "Nice to meet you" dedi. Ece onu tanımıyor gibi; o zaman Kerem Ece'nin değil, yalnız Ege'nin (öbür taraftan) kuzeni. world.yaml bu yorumla yazıldı. *Teyit gerekli.*
8. **Grubun adı** "The Sleepy Cats" yalnız bir soru kökünde geçiyor (u02_day_04, sina sorusu). Hikâyede ad yok. Ü4'te kesinleşmeli (OT4). O ad kullanılacaksa Bora'nın "olmayan kedi" esprisine güzel bağlanır.
9. **Soru id biçimi.** rules.yaml R33 `u{U}d{DD}-…` diyor. Ü1 dosyaları eski biçimde (`d01-026-z`). Benzersiz oldukları için validator sorun görmüyor. Ü1 değiştirilmedi, istisna olarak kaydedildi.
10. **Uzunluk istisnası.** Ü1 G4 hikâyesi 29 satır (kural 18–28). Ü2 G15'te eski ünite belirteci 2 (alt sınırda).
11. **Plan dosyası eskidi.** `LGS_Kelime_Kocu_Plan.md` §5 kadro önerisinde "Defne (laid back)" ve "Ece: reliable" var. Gerçekte laid-back olan Duru, reliable olan Selin. §11'de "koçun adı" ve "kadro" hâlâ karar bekliyor görünüyor (ikisi de kararlaştı: Hoca Nova; Ece, Kaan, Bora, Duru, Selin, Elif). README'de "unit_01_items: 30'unda pilot_day var" yazıyor, şimdi 100'ünde var.
12. **coach.yaml Ü1'e özgü.** Genel havuzdaki bazı metinler Ü1'e bağlı: "Friendship ünitesinin pilotu bitti", "Ece'nin partisi seni bekliyor", unit_end'de "arkadaşlık soruları". Ü3'ten önce `{unit}` ve `{story_hook}` değişkenleriyle üniteden bağımsız hale getirilmeli.
13. **Ü3 çeviri yasağı riski.** Ü3 karşılıkları çok yaygın Türkçe kelimeler içeriyor: yemek, önce, sonra, ne kadar, tat (→ tatlı, tatil), mutfak, fırın, adım, bir sürü. Validator sağ sınır kullanmadığı için "tat" parçası "tatlı" ve "tatil"i de yakalar. Bu birimler belirteçle geçtiği her hikâyede (d−3 ve ünitelerarası tekrar dahil) Türkçe anlatı çok kısıtlanır. *Karar gerekli:* meaning_tr daraltılsın mı (ör. U3-056 "yemek (tabak yemek); tabak"), yoksa validator'a `leak_forms` alanı mı eklensin?
14. **Selin'in kedisi.** Ü1 G6'da (s09) geçti ("Well, Ece and my cat"). Bora'nın olmayan kedisiyle karıştırılmamalı; canon_facts'e yazıldı.
15. **Yarı kanon ayrıntılar.** Yalnız soru köklerinde geçenler ("The Sleepy Cats", Bora'nın dedesinin saksafonu ve Louis Armstrong plakları, "Elif's grandma is seventy") kanon sayılmadı. Hikâyede kullanılacaksa önce world.yaml'a alınmalı.
