# Hikayenglish çalışma yöntemi

Bu dosya, Hikayenglish ve LGS Kelime Koçu'nu kurarken izlediğimiz yolu anlatıyor. Yeni bir ünitede, yeni bir pakette (ör. doktorlar için İngilizce) ya da yeni bir ekip üyesiyle aynı sırayı izlemek için.

## Ana fikir

> Önce **ne öğreteceğimizi** netleştir, sonra **nasıl öğreteceğimizi** küçük bir pilotta dene, en son **büyüt**.

Liste mükemmelleştirmek amaç değildir. "Yeterince iyi" liste → çalışan pilot → gerçek öğrenci verisi → düzeltme.

## Adım adım süreç

### 1. Hedefi tek cümleyle yaz
- Kim öğrenecek? (8. sınıf, LGS'ye hazırlanıyor)
- Neyi öğrenecek? (10 ünitenin kelime ve kalıpları)
- Başarıyı ne gösterir? (LGS tarzı soruda tanıma, 8. ve 15. günde hatırlama)

### 2. Kaynakları topla, birleştir, kaynağını işaretle
- Elindeki tüm listeleri tek havuzda birleştir; her satırda **hangi kaynaktan geldiği** yazsın.
- Yazım farklarını birleştir (apologise/apologize, laid back/laid-back).
- Kaynak hatalarını ayrı bir sayfada tut; silme, düzelt ve not düş.
- Ünite dışına taşan kelimeleri ayır (eski kitabın sahneleri, başka ünitenin kelimeleri).

### 3. Satır değil öğretim birimi say
Her satır şu sınıflardan birine girer:

| Sınıf | Ne yapılır |
|---|---|
| Çekirdek | Öğretilir |
| Kalıp / işlev | Varyantlar tek birimde öğretilir ("Sounds fun / good / great" → *Sounds + sıfat*) |
| Tuzak (çok anlamlı) | Ünitedeki anlam öğretilir, diğerine dikkat kartı (mean, fair, full, back up) |
| Eş anlamlı küme | Birlikte öğretilir (trust / count on / rely on) |
| Zaten bilinen | Hikâyede geçer, kotaya girmez |
| Tanıma | Okuma metninde görür, öğretilmez |

### 4. Önceliklendir ve bir sayıya indir
- En az iki bağımsız kaynakta geçen = öncelik 1.
- Hedef sayı **karar sonucudur, kota değildir**. LGS'de ünite başına yaklaşık 100 birim seçtik.
- Çıkarılan birimler silinmez; "tanıma" ya da "bilinen" olarak havuzda kalır.
- Listeyi **onaylat ve dondur**. Bundan sonra yalnız pilot verisi bir sorun gösterirse değişir.

### 5. Önce plan dosyası
Yapacaklarımızı tek bir .md dosyasında yaz: amaç, ilkeler, içerik türleri, koçluk, veri formatı, açık kararlar. Kararlar konuştukça bu dosyaya işlenir.

### 6. Küçük bir pilotla başla
- Ünitenin tamamı değil, bir dilimi: 5 gün × 6 birim = 30 birim.
- Pilotun omurgası, sınavda en çok sorulan işlev olsun (davet etme / kabul / red).
- Başarı ölçütleri baştan yazılır: tamamlama oranı, ders süresi ≤ 10 dk, Gün 8 / 15 hatırlama ≥ %70, öğrenci anketi.

### 7. İçeriği kodun okuyabileceği formatta üret
- Her gün ayrı YAML dosyası; kelimelere yalnız ID ile başvurulur (`{U1-013}`).
- İngilizce aralıklar işaretlenir (`<en>…</en>`).
- Çeldiriciler içerikte sabittir; şıkları uygulama karıştırır, yanlış seçilen şık kaydedilir.
- Şema dosyası ve doğrulayıcı (validate.py) baştan yazılır.

### 8. Her kelime aynı döngüden geçer

| Adım | Dil | Amaç |
|---|---|---|
| **Sezdir** | Türkçe hikâye + İngilizce hedef | Anlamı bağlamdan çıkar |
| **Kullan** | Tamamen İngilizce cümle | Doğru kullanımı seç / kur |
| **Sına** | LGS tarzı soru | Sınav bağlamında tanı |

Tekrar takvimi: d+1 hatırlama (Türkçe yok) · d+3 aynı kelime yeni hikâyede · d+7 LGS sorusu · d+14 kalıcılık kontrolü.

### 9. Hikâye kuralları
- Hedef kelime en az 3 ayrı cümlede geçer.
- Hedefin Türkçe karşılığı aynı metinde **ve** başlıkta, koç girişinde, bildirimlerde geçmez.
- "İngilizce kelime + etmek / yapmak" yok (❌ *INVITE etti*).
- Karakterler kelimeleri bedenler: güvenilir Selin, bahaneci Bora, kafası rahat Duru.
- Mizah evet; kimseyi aşağılamak, hassas konuları şakaya çevirmek hayır.

### 10. Kişiselleştirme
- **Tek içerik, kişisel yol.** Seviyelere göre ayrı içerik yazılmaz.
- Başlangıç testi seviyeyi ve zayıf boyutu ölçer (kelime tanıma / bağlam / sınavda kullanma).
- Ünite girişinde evet/hayır kontrolü + sahte kelimeler; "evet" denen birim LGS sorusuyla doğrulanır.
- Birim durumları: **yeni → kararsız → şimdilik biliyor**. Tek doğru cevap "biliyor" saymaya yetmez.
- **Testlerde tek deneme ve geri bildirim yok** (aksi hâlde seviye ölçülemez). Derste yanlışta doğru cevap ve açıklama gösterilir, soru ders sonunda bir kez daha gelir.

### 11. Koçluk (Hoca Nova)
- Günün hedefini söyler, sonucu yorumlar, zorlanılan kelimeleri adıyla anar.
- Seriyi kutlar, kaçırılan günde suçlamadan geri çağırır, sınav geri sayımını plana bağlar.
- Utandıran, korkutan dil yok; uyku ve mola hatırlatması olabilir.
- Bildirimler içerikte yazılır (≤ 90 karakter), kodda zamanlanır.

### 12. Kontrol et, bağımsız gözle bir daha kontrol et
1. Otomatik doğrulayıcı (şema + kurallar) sıfır bulguya inene kadar.
2. Bağımsız bir okuma: dil hatası, iki doğru cevaplı soru, yanlış anahtar, mantık hatası. Bu turda 26 sorun çıktı; hepsi düzeltildi.
3. Prototipte uçtan uca deneme (telefon genişliği, koyu tema).
4. İnsan editör: Türkçenin doğallığı ve "anlam bağlamdan çıkarılabiliyor mu?" (Z07).

### 13. Pilot → veri → büyüt
- Pilotu 5–10 farklı seviyeden öğrenciyle dene.
- İlerleme ekranındaki "en çok seçilen yanlış şık" verisine bak: hangi kelimeler karışıyor?
- Sonuçlara göre düzelt, sonra aynı süreçle kalan üniteleri üret.
- Gün sayısını en son belirle: tekil birim sayısı ÷ günlük kapasite.

## Kaçınılacaklar
- Listeyi sonsuza kadar tartışmak (bir noktada dondur).
- Her satırı ayrı kelime saymak.
- Testte "doğruyu bulana kadar dene" (seviye ölçülemez, cevap sızar).
- Koçun girişinde ya da bildirimde öğretilecek kelimenin anlamını söylemek.
- Kontrol edilmemiş "ilginç bilgi".

## Dosya düzeni (örnek)
```
lgs-pilot/
├── schema/          # şemalar
├── content/
│   ├── unit_01_items.yaml
│   ├── days/        # günlük dersler
│   ├── tests/       # başlangıç, giriş, kalıcılık
│   └── coach.yaml   # Hoca Nova mesaj havuzu
├── tools/lgs_validate.py
└── prototip_lgs_pilot.html
```
