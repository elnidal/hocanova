# Hikayenglish LGS: Kelime Koçu (çalışma planı)

> Durum: TASLAK. Gün sayısı bilerek boş bırakıldı. Ünitelerin tekil birim sayısı çıktıktan sonra karar verilecek.

## 1. Amaç

8. sınıf öğrencisinin LGS İngilizce bölümündeki 10 ünitenin kelime ve kalıplarını öğrenmesi, unutmaması ve sınav sorusunda tanıması.

Üç ilke:

1. **Gün gün ilerleme.** Her günün net bir hedefi var ("Bugün 6 kelime + 1 kalıp + 1 hap bilgi"). Öğrenci nerede olduğunu ve sınava ne kaldığını her zaman görür.
2. **Hikâye ve sezdirme.** Kelimeler bir hikâye içinde, anlamı bağlamdan çıkarılarak öğrenilir. Komedi serbest, ama hedef kelimeyi gölgelemeyecek.
3. **Koçluk.** Uygulama sadece ders vermez: hatırlatır, cesaretlendirir, taktik verir, ilerlemeyi yorumlar.

## 2. Önce içerik, sonra takvim

Sıra:

1. Ünite listeleri tek tek işlenir (bkz. §4).
2. 10 ünite bitince tekil birim sayısı kesinleşir.
3. Gün sayısı ve günlük yük **ondan sonra** belirlenir. Seçenekler şimdiden şöyle:
   - Yoğun program: yaklaşık 100 gün, sınava yakın dönem.
   - Okula paralel program: bütün yıl, okulun ünite sırasıyla.
   - İkisi birden: aynı içerik, iki farklı takvim.
4. Günlere bölme işi en sona kalır. İçerik "ünite paketleri" olarak yazılır, takvim bu paketlerden kurulur.

## 3. Kaynak ve telif

- **Ana kaynak:** MEB 8. sınıf İngilizce öğretim programı ve ders kitabı (ünite konuları, işlevler, kazanımlar).
- **Kontrol katmanı:** Geçmiş yıllarda çıkmış LGS İngilizce soruları. Hangi kelime ve kalıp gerçekten soruluyor?
- **Çıkmış soru analizi:** Geçmiş LGS İngilizce sorularındaki kelime ve kalıplar çıkarılır, ünite listeleriyle eşleştirilir. Sınavda çıkmış birimler `lgs_seen: [yıl]` alanıyla işaretlenir ve öncelik kazanır.
- **Çıkmış sorular derste:** Her ünitenin en sonunda 1–2 gerçek çıkmış soru "Gerçek LGS sorusu (yıl)" etiketiyle ve kaynağıyla gösterilir. Amaç öğrencinin "bunu çözebiliyorum" demesi. Kullanım koşulu hukuki kontrolde netleşecek; netleşmezse aynı yapıda özgün "LGS benzeri" soru yazılır.
- **Üçüncü taraf listeler** (ör. ingilizceciyiz.com PDF'leri): yalnız karşılaştırma ve eksik kontrolü için. Aynen kopyalanmaz; kendi listemiz ve kendi Türkçe karşılıklarımız yazılır.
- Ticari kullanım öncesinde hukuki kontrol yapılacak.

## 4. Ünite işleme hattı (her ünite için aynı adımlar)

### 4.1 Ham liste → birim kartı

Satırlar tek tek kelime sayılmaz. Önce üç inceleme yapılır:

1. **İfadeler:** Çok kelimeli satırlar (count on, get on well with each other, have a lot in common) tek bir birim mi, yoksa bir kalıbın parçası mı? Aynı kalıbın varyantları birleştirilir (sounds fun / sounds good / sounds great / sounds awesome → tek kalıp: *Sounds + SIFAT*).
2. **Çok anlamlılar:** Hangi anlam ünitede gerçekten kullanılıyor? Yalnız o anlam öğretilir, diğerleri tuzak notuna yazılır (ör. *like* = "gibi" ünitede hedef; "sevmek" zaten biliniyor).
3. **Eş anlamlı kümeler:** Aynı anlamı taşıyan satırlar bir kümeye bağlanır. Kümenin bir üyesi "ana" seçilir, diğerleri onunla birlikte öğretilir.

Ardından her birim şu sınıflardan birine girer:

| Sınıf | Tanım | Örnek (Ünite 1) | Günlük kotaya girer mi? |
|---|---|---|---|
| **ÇEKİRDEK** | Ünitenin asıl kelimesi, sınavda çıkma ihtimali yüksek | reliable, honest, invitation, refuse | Evet |
| **KALIP / İŞLEV** | Diyalog kalıbı; işlev içinde öğretilir | Would you like to…? · Sorry, I can't · Sounds great! | Evet (kalıp olarak) |
| **KÜME** | Eş anlamlılar birlikte verilir | trust / count on / rely on · busy / occupied | Kümenin her üyesi ayrı birim, ama aynı derste |
| **TUZAK** | Çok anlamlı ya da karışan kelimeler | match (maç / eşleştirmek / kibrit) · full (dolu / tok) · like (gibi) · lie | Evet + "dikkat" kartı |
| **BİLİNEN** | 5–7. sınıftan büyük ihtimalle bilinen kelimeler | want, give, ask, idea, thing | Hayır: hikâyede geçer, hızlı tekrar |
| **TANIMA** | Düşük öncelikli; görünce anlaması yeter | solemn, generation, unconditional | Hayır: okuma metinlerinde geçer |

Kart alanları: `id`, `unit`, `sınıf`, `gösterim`, `anlam_tr`, `örnek (EN)`, `küme`, `tuzak notu`, `işlev`, `LGS'de çıktı mı?`, `okunuş`.

### 4.2 Tekilleştirme (üniteler arası)

- Aynı kelime iki ünitede geçiyorsa **ilk geçtiği ünitede** öğretilir. Sonraki ünitede tekrar olarak geçer, ikinci kez sayılmaz.
- Aynı kelimenin farklı anlamı ayrı birimdir (Core kuralı: satır değil, anlam sayılır).
- Sonuç tablosu her ünitede güncellenir:

| Ünite | Ham satır | Tekil birim | Çekirdek | Kalıp | Tuzak | Bilinen | Tanıma |
|---|---|---|---|---|---|---|---|
| 1 Friendship | ~165 | ? | ? | ? | ? | ? | ? |
| 2 … | | | | | | | |

### 4.3 Ünite paketi (yazılacak içerik)

Her ünite için:

1. **Birim kartları** (§4.1)
2. **Ders blokları:** her biri 5–8 birim, bir hikâye bölümü, alıştırmalar. Blok sayısı birim sayısından çıkar.
3. **İşlev diyaloğu:** ünitenin konuşma kalıpları canlı bir sahnede.
4. **LGS tarzı soru seti:** 5–10 soru.
5. **Hap bilgiler** (§6)
6. **Koç mesajları ve bildirimler** (§7)
7. **Ünite finali:** tamamen İngilizce kısa metin + özet kartı.

## 5. Hikâye evreni

- **Kadro:** Bir 8. sınıf grubu, okul, mahalle, WhatsApp grubu. Karakterler ünite kelimelerini bedenleyen tiplerden oluşur (Ünite 1'den öneri):
  - Kaan: *always in a hurry*
  - Ece: *reliable*
  - Bora: bahane ustası, *break promise*
  - Defne: *laid back*
  - Kesinleşince ayrı bir **karakter kartı** dosyası (Story Bible) tutulur.
- **Ton:** Gençlerin güldüğü durum komedisi (sınav stresi, grup sohbeti kazaları, öğretmen esprileri). Kimseyi aşağılamayan, zorbalık ve hassas konuları mizaha dönüştürmeyen bir dil.
- **Türkçe-İngilizce karışımı bilinçli kullanılır.** Karışım yalnız ünite ilerledikçe değil, her kelimenin kendi öğrenme döngüsü içinde de değişir (bkz. §5.1).
- **Metinlerin genel dil oranı da kademeli artar:**

| Aşama | Dil |
|---|---|
| İlk üniteler | Türkçe metin + İngilizce hedef kelime/kalıp (sezdirme) |
| Orta üniteler | Diyaloglar İngilizce, anlatım Türkçe |
| Son üniteler | Metinler büyük ölçüde İngilizce, LGS okuma düzeyinde |

- **Hikâye kuralları** (Hikayenglish QA'sından devralınır):
  - Hedef kelime en az 3 cümlede geçer.
  - Hedefin Türkçe karşılığı aynı metinde geçmez.
  - "İngilizce kelime + etmek/yapmak" kullanılmaz.
  - İngilizce cümlelerde yalnız öğretilmiş ya da BİLİNEN sınıfındaki kelimeler kullanılır.

### 5.1 Kelime öğrenme döngüsü: Sezdir → Kullan → Sına

Her birim aynı üç adımdan geçer. Türkçe yalnız ilk adımda taşıyıcıdır.

| Adım | Dil | Ne olur | Örnek (*reliable*) |
|---|---|---|---|
| **1. Sezdir** | Türkçe hikâye + İngilizce hedef | Anlam bağlamdan çıkarılır | "Ece tam bir RELIABLE arkadaş: '8'de oradayım' dediyse 7:59'da oradadır." |
| **2. Kullan** | Tamamen İngilizce cümle | Doğru cümleyi seçer ya da kurar | "*Ece always keeps her promises. She is very ___.*" |
| **3. Sına** | LGS tarzı soru | Kelimeyi sınav bağlamında tanır | Kısa mesaj + "Which of the following is TRUE about Ece?" |

- 1. ve 2. adım aynı gün yapılır. 3. adım aynı gün ya da ilk tekrar gününde yapılır.
- Tekrarlar 2. ve 3. adım türünden olur; Türkçe taşıyıcıya geri dönülmez.
- Ünitenin en sonunda gerçek çıkmış soru(lar) gelir (§3).

## 6. Hap bilgiler

Kısa (1–3 cümle), akılda kalan, "vay be" dedirten bilgiler. Her ders bloğunda en az bir tane. Türleri:

| Tür | Amaç | Örnek |
|---|---|---|
| **Hafıza kancası** | Kelimeyi akılda tutturmak | *reliable* = rely (güvenmek) + able: "güvenilebilir" |
| **Tuzak uyarısı** | Sık yapılan hatayı önlemek | *match* bir maç, bir eşleştirme ya da bir kibrit olabilir; LGS bağlamdan sorar |
| **LGS taktiği** | Soru tipi stratejisi | Diyalog sorularında önce boşluktan **sonraki** cümleyi oku; cevap çoğu zaman oradadır |
| **Kelime ailesi** | Bir kelimeyle birkaç tane kazanmak | respect → respectful → disrespectful |
| **İlginç bilgi** | Merak ve keyif | İngilizler arkadaşlarına "mate" der; Amerikalılar "buddy" |
| **Mini dilbilgisi** | Kalıbı çözmek | *Would you like **to** come?* ama *How about **coming**?* |

Kurallar:

- Doğruluğu kontrol edilmemiş "ilginç bilgi" yazılmaz.
- Her hap bilgi bir birime ya da bir soru tipine bağlıdır (`refs`).

## 7. Koçluk sistemi

### 7.1 Koç kimdir?

Uygulamanın tek bir sesi var: samimi, esprili, abi/abla tadında bir koç. Çocuksu değil, öğretmen gibi de değil. (Adı ve kişiliği ayrıca belirlenecek; hikâye karakterlerinden biri de olabilir.)

### 7.2 Koçun yaptıkları

| An | Koç ne yapar | Örnek |
|---|---|---|
| Gün başı | Günün hedefini söyler | "Bugün 6 kelime var, 7 dakikanı alır. Bora yine bir şey yapmış…" |
| Ders sonu | Sonucu yorumlar, ne kaldığını söyler | "6'da 5! *occupied* biraz kafa karıştırdı, yarın tekrar soracağım." |
| Seri (streak) | Devamlılığı kutlar | "7 gün üst üste! Bir haftalık seri, 1. ünitenin yarısı demek." |
| Kaçırılan gün | Suçlamadan geri çağırır | "Dün olmadı, sorun değil. Bugün 3 dakikalık kısa tekrarla başlayalım." |
| Haftalık rapor | İlerlemeyi gösterir | "Bu hafta 34 kelime öğrendin. En zorlandıkların: *loyal, solemn*." |
| Ünite sonu | Rozet + özet | "Friendship ünitesi tamam! LGS'deki olası arkadaşlık sorularına hazırsın." |
| Sınav geri sayımı | Sınava kalanı planla ilişkilendirir | "Sınava 120 gün var. Bu tempoyla tüm üniteler 30 gün önce bitiyor; kalan süre tekrara." |

### 7.3 Koçun sınırları

- Utandıran, korkutan ya da stresi artıran dil yok ("Bu gidişle kazanamazsın" gibi).
- Uzun seriyi kaybetme korkusuyla baskı kurulmaz. Kaçırılan gün kolay telafi edilir.
- Sınav dönemi mesajları dinlenme ve uyku hatırlatmasını da içerebilir.

### 7.4 Bildirimler

- İçerikte yazılır, kodda zamanlanır.
- Her ders bloğu için:
  - `sabah`: günün hedefi + merak kancası
  - `akşam_hatırlatma`: ders yapılmadıysa
  - `tekrar_daveti`: tek soruluk mini test
- Uzunluk: en fazla ~90 karakter. Emoji ölçülü.
- Aynı mesaj kalıbı art arda tekrarlanmaz.

## 8. Alıştırma türleri

Hikayenglish'ten gelenler:

- `guess`: hikâyeden anlam tahmini
- `listen_choose`: duyduğunu seç
- `tr_to_en`, `en_to_tr`
- `build`: kalıbı kur

LGS için yeni olanlar:

| Tür | Açıklama |
|---|---|
| `dialogue_complete` | Diyalogda boşluğa uygun cümle |
| `synonym` | Altı çizili kelimeye en yakın anlam |
| `message_infer` | Kısa mesaj/e-posta → "hangisi doğrudur / söylenemez?" |
| `trait_match` | Davranış → kişilik sıfatı ("Kaan sözünü hiç tutmaz → hangisi değildir?") |
| `table_read` | Tablo/grafik okuma (LGS'nin sevdiği format) |
| `odd_one_out` | Kümeye uymayan kelime |

Çeldiriciler içerikte sabit yazılır. Yanlış seçilen şık kaydedilir (karışma verisi).

### 8.1 Soru kökü dili (ayrı mini modül)

LGS soruları İngilizcedir. Öğrenci kelimeyi bilse bile soru kökünü anlamazsa soruyu kaçırır. Sık görülen kökler ayrı birimler olarak öğretilir ve günlük kotaya girmez:

- *Which of the following is NOT …?*
- *According to the text / dialogue …*
- *Which one completes the dialogue?*
- *What is the main idea …?*
- *Fill in the blank …*

Gerçek liste çıkmış soru analizinden çıkarılacak.

## 8b. Kişiselleştirme: seviye → kişisel plan → hikâye → akıllı tekrar → LGS pratiği

### Ortak program, kişisel yol

- **Ortak program:** 10 ünite, LGS hedefleri, hikâyeler, genel tekrar takvimi. Herkes için aynı ve tek bir içerik paketi. Seviyelere göre ayrı içerik yazılmaz.
- **Kişisel yol:** Hangi birimin yeni öğretileceği, hangisinin yalnız doğrulanacağı, hangisinin ne zaman tekrar edileceği. Bu öğrenciye göre değişir.
- **Sınır:** Bilinen bir birimi atlamak, onun sınav bağlamındaki kullanımını hiç kontrol etmemek demek değildir. Sezdir adımı atlanabilir; Sına adımı atlanmaz.

### 1. Seviye belirleme: üç boyut

Öğrenci "iyi / zayıf" diye etiketlenmez. Hangi boyutta desteğe ihtiyacı olduğu belirlenir.

| Boyut | Soru | Örnek |
|---|---|---|
| **A. Kelime tanıma** | Anlamı seçenekler arasından bulabiliyor mu? | *reliable* ne demektir? |
| **B. Bağlamı anlama** | Cümleden çıkarım yapabiliyor mu? | "*I can always count on Ece. She never breaks her promises.*" → Ece nasıl bir arkadaş? |
| **C. Sınavda kullanma** | Diyalogda uygun cevabı, soru kökünü ve çeldiricileri anlayabiliyor mu? | Davet diyaloğunda doğru cevap |

- **Başlangıç testi:** 3–4 dakika, 15–20 soru. Üç boyuttan da soru içerir. Kelime bilgisini değil boyut profilini ölçer: tempoyu, hikâyedeki dil oranını ve koçun ilk vurgusunu belirler ("Kelimelerin iyi, soru köklerine birlikte çalışalım").
- **Ünite kontrolü:** Her ünite başında küçük bir test, ünitenin çekirdek birimleri için. Öğrenci 10 ünitenin kelimeleri için tek seferde uzun bir sınava girmez.
- **Abartılı "biliyorum" kontrolü:** Evet/hayır sorularına gerçek olmayan birkaç sahte kelime (ör. *plonter*) karıştırılır. Bunlara "biliyorum" diyen öğrencinin cevapları daha temkinli değerlendirilir.

### 2. Birim durumları

| Durum | Ne zaman | Ne olur |
|---|---|---|
| **Yeni** | Bilmiyor ya da bağlamdan çıkaramıyor | Tam döngü: Sezdir → Kullan → Sına |
| **Kararsız** | Bir kez doğru yaptı ama sonra unuttu, ya da yalnız tek soru tipinde doğru | Daha erken tekrar |
| **Şimdilik biliyor** | Farklı bir cümlede **ve** LGS tarzı soruda doğru | Seyrek aralıklı kontrol |

- Tek doğru cevap kalıcı öğrenmeyi kanıtlamaz. Başlangıç testi bir birimi geçici olarak "biliyor" yapabilir; sonraki karşılaşmalar bunu doğrular ya da birimi "kararsız"a indirir.
- Bu üç durum öğrenciye görünen etiketlerdir. Motorun içinde birim başına daha ayrıntılı bir hafıza tahmini (ör. FSRS) tutulabilir.

### 3. Tekrar takvimi (pilot hipotezi)

Her tekrar bir öncekinden farklı bir etkinlik türüdür. Aynı soruyu tekrar sormak yerine bağlam ve zorluk değişir.

| Gün | Adım | Etkinlik |
|---|---|---|
| 1 | İlk öğrenme | Hikâye + sezdirme, doğru İngilizce kullanım, kısa test |
| 2 | İlk hatırlama | Türkçe karşılık olmadan bağlamda tanıma |
| 4 | Bağlam değişimi | Aynı birim farklı bir hikâye bölümünde ya da diyalogda |
| 8 | LGS pratiği | Diyalog, mesaj ya da paragraf üzerinden soru |
| 15+ | Kalıcılık kontrolü | Başarıya göre aralık uzar ya da döngü sıklaşır |

- Yanlış cevaplanan birim daha erken, istikrarlı doğru cevaplanan daha geç gelir.
- Aralıklar pilot verisine göre değiştirilecek.

### 4. İki öğrenci, aynı ünite

- **Öğrenci A:** *invite, accept, refuse*'u biliyor; *reliable* ile *count on*'u karıştırıyor. Sistem ilk üçünü kısa bir Sına sorusuyla doğrular, dersin odağını diğer ikisine kaydırır.
- **Öğrenci B:** Kelimelerin çoğunu ilk kez görüyor. Daha fazla sezdirme, daha açık örnek ve daha kısa tekrar aralıkları alır.
- Program süresi öğrenciye göre değişir. Gün sayısı kararı "standart öğrenci" için verilir. Hızlı ilerleyen öğrenci kalan süreyi karma tekrara ve çıkmış sorulara ayırır.

### 5. İçerik üretimine etkisi

Kişiselleştirme ancak içerik buna göre yazılırsa çalışır. Her çekirdek birim için yazılacaklar:

- [ ] **Sezdirme bağlamı:** ilk hikâye bölümü
- [ ] **Kullan cümlesi:** tamamen İngilizce
- [ ] **İkinci bağlam:** ünitenin sonraki bir hikâye bölümünde ya da diyalogda doğal tekrar (Gün 4 tekrarı için)
- [ ] **En az iki Sına sorusu,** farklı türlerde (biri giriş testinde, biri Gün 8 tekrarında kullanılabilir)
- [ ] **Test sorusu olarak kullanılabilecek tanıma sorusu**

Hikâyeler, öğrenci bazı kelimeleri zaten biliyorsa da akıcı okunmalı; bilinen birim hikâyede kalır, yalnız alıştırması atlanır.

### 6. Diğer

- **Hata defteri:** Yanlış yapılan birimler kişisel bir listede toplanır, koç bunları "zayıf kelimeler" paketiyle geri getirir.
- **Sabit ders süresi:** Bir ders 7–10 dakikayı geçmez.
- **Ünite ön test / son test:** İlerleme öğrenciye gösterilir; pilotta yöntemin işe yarayıp yaramadığını da bu ölçer.
- **Sınav öncesi karma tekrar:** Son haftalarda yeni içerik yok; 10 ünitenin karışık tekrarı ve çıkmış sorular.

## 9. Veri formatı

Mevcut YAML şeması genişletilir (`hikayenglish-content` paketi):

- **items.yaml** alanları: `unit`, `lgs_class` (core / pattern / cluster / trap / known / recognition), `cluster_id`, `function`, `lgs_seen` (geçmiş sınavda çıktı mı)
- **Yeni dosya `units/unit_01.yaml`:** ünite özeti, birim listesi, ders blokları, işlev diyaloğu, soru seti
- **Ders bloğu dosyaları:** `tips` (hap bilgiler), `coach` (ders başı/sonu mesajları), `notifications`
- **Yeni dosya `coach.yaml`:** genel koç mesaj havuzu (seri, kaçırılan gün, haftalık rapor şablonları); değişkenli metinler (`{streak}`, `{days_left}`)
- **validate.py** yeni kurallar: üniteler arası tekillik, küme bütünlüğü, bildirim uzunluğu, hap bilgi `refs` kontrolü

## 10. Çalışma akışı

1. Sen ünite listesini gönderirsin (PDF ya da metin).
2. Ben birim kartlarını çıkarırım (§4.1) ve önceki ünitelerle tekilleştiririm.
3. Tabloyu **sen onaylarsın**: çekirdek/tanıma sınırı, kümeler, tuzaklar.
4. Ben ünite paketini yazarım: hikâye, alıştırmalar, hap bilgiler, koç mesajları, bildirimler.
5. Doğrulayıcıdan geçer; sen veya editör sezdirme yeterliliğine bakar.
6. 10 ünite bitince: tekil sayı → gün sayısı → takvim.

## 11. Karar bekleyenler

- [ ] Koçun adı ve kişiliği
- [ ] Hikâye kadrosu (Ünite 1 önerisi: Kaan, Ece, Bora, Defne)
- [ ] Program tipi: yoğun / okula paralel / ikisi birden
- [ ] Telaffuz standardı: ders kitabının standardı esas alınır (kontrol edilecek)
- [ ] Bildirim saatleri ve sıklığı

- [ ] Çıkmış soruların derste kullanım koşulu (hukuki kontrol)

## 12. İlk adım

Ünite 1 (Friendship) birim kartı tablosu:

1. İfade incelemesi: kalıplar ve varyantların birleştirilmesi
2. Çok anlamlıların hedef anlamı
3. Eş anlamlı kümeleri
4. Sınıflandırma ve tahmini tekil birim sayısı
5. Çıkmış LGS sorularında Ünite 1 kelimelerinin izi
