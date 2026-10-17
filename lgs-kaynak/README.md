# Hikayenglish LGS · Kaynak Bankası + Hikâye Motoru

Uygulamadan bağımsız, kalıcı bilgi katmanı. Ders dosyaları (lgs-pilot), kartlar, videolar, deneme soruları… ne üretilirse buradan beslenir. Ürün fikri değişse de bu klasör geçerliliğini korur.

Durum: **TASLAK** (editör onayı bekliyor).

## İçerik

```
lgs-kaynak/
├── units/unit_XX_kaynak.yaml   # ünite kaynak dosyası (makine için)
├── units/unit_XX_kaynak.md     # aynı dosyanın okunur hali (araçla üretilir, elle düzenleme)
├── schema/unit_kaynak.schema.yaml
├── engine/                     # hikâye motoru (10 ünite için ortak)
│   ├── world.yaml              # dünya, karakterler, konuşma tarzları, kanon gerçekleri
│   ├── rules.yaml              # yazım kuralları R01…; hangisi doğrulayıcıda denetleniyor
│   ├── season.yaml             # 10 ünitelik sezon: olay, karakter yayları, finaller
│   ├── episode_template.yaml   # bir günlük bölümün vuruş şablonu
│   ├── writer_prompt_template.md
│   ├── story_bible_template.md
│   └── MOTOR.md                # nasıl kullanılır (Türkçe)
├── exam/sinav_dili.yaml / .md   # Sınav Dili modülü: 14 soru kökü, 10 taktik, kök kelimeleri, 8 mini ders
└── tools/kaynak_tool.py        # doğrula + .md üret
```

Öğretim birimlerinin kendisi `lgs-pilot/content/unit_XX_items.yaml` dosyalarındadır (ID'ler: U1-001 …).

## Ünite kaynak dosyası neleri içerir

Müfredat kazanımları ve işlevler (kalıplar + cevaplar) · tasnif (birim sayısı, sınıflar, öğretilmeyen ama hikâyede geçebilecek kelimeler) · temalar · dilbilgisi (formül, örnek, Türk öğrencinin yaygın hataları, LGS notu) · hazır ifadeler · eşdizimler · kelime aileleri · eşanlamlı/karşıt · tuzaklar ve kaynak hataları · LGS odağı (ne soruluyor, özgün örnek sorular, çeldirici mantığı, en kritik birimler, taktikler, soru kökü kelimeleri) · ünitelerarası bağlar · hikâye kancaları ve gün gruplaması önerisi · hap bilgiler · açık sorular.

## Durum

| Ünite | Birim | Dilbilgisi | İfade | Tuzak | Örnek soru kalıbı | Hap bilgi | Hikâye |
|---|---|---|---|---|---|---|---|
| 1 Friendship | 100 | 11 | 28 | 30 | 10 | 20 | yazıldı (17 gün) |
| 2 Teen Life | 92 | 10 | 18 | 27 | 9 | 20 | yazıldı (16 gün) |
| 3 In the Kitchen | 63 | 9 | 17 | 30 | 10 | 20 | yazıldı (11 gün) |
| 4 On the Phone | 55 | 6 | 28 | 22 | 7 | 19 | yazıldı (10 gün) |
| 5 The Internet | 61 | 6 | 22 | 18 | 7 | 20 | yazıldı (10 gün) |
| 6 Adventures | 57 | 8 | 18 | 22 | 7 | 18 | yazıldı (10 gün) |
| 7 Tourism | 61 | 6 | 18 | 19 | 6 | 12 | havuz hazır, hikâye yok |
| 8 Chores | 50 | 6 | 14 | 22 | 6 | 12 | havuz hazır, hikâye yok |
| 9 Science | 46 | 6 | 14 | 25 | 6 | 12 | havuz hazır, hikâye yok |
| 10 Natural Forces | 48 | 6 | 14 | 26 | 6 | 12 | havuz hazır, hikâye yok |
| **Toplam** | **633** | | | | | | 10 ünite tamam (Ü1–6 hikâyeli, Ü7–10 yalnız havuz) |

## Kullanım

```
pip install pyyaml jsonschema
python3 tools/kaynak_tool.py          # doğrular, .md dosyalarını yeniden üretir
python3 tools/kaynak_tool.py --check  # yalnız doğrular
```

Yeni ünite akışı için: `engine/MOTOR.md`.

## Çıkmış kelime bilgisi

`unit_XX_items.yaml` içindeki `exam` alanı: o birimin 2013–2020 TEOG ve 2018–2020 LGS'de kaç kez çıktığı (kaynak: ders kitabı listelerindeki "sınavlarda çıkmış kelimeler" tabloları). Uygulamada tekrar önceliği ve "sınavda çıktı" rozeti için kullanılabilir. Öğretilmeyen ama sık çıkan kelimeler kaynak dosyalarında `tasnif.exam_record`. Ayrıntı: `LGS_Havuz_Kontrol_v1.xlsx`.

## Sınav Dili modülü ve kalıp cümle havuzu

- **Soru kökleri kelimelerden bağımsız** öğretilir (`exam/sinav_dili.yaml`): 8 kısa mini ders, her biri bir soru ailesi. Ders açıldıktan sonra o kök, kelime günlerindeki Sına ve tekrar sorularında `stem_id` ile kullanılır.
- **Kalıp cümleler ünitenin içinde kalır** (`phrase_bank`, Ü1/Ü2/Ü4/Ü5/Ü6/Ü7/Ü8/Ü9/Ü10): öğretim birimi sayılmaz, sahne diyaloglarının ve soru köklerinin hammaddesidir; işlevlerine göre gruplu, ilgili birim ID'leri bağlı.
