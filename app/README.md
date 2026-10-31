# Kelime Koçu uygulaması (Vite + React + PWA)

```bash
cd app
npm install
npm run content   # YAML → public/content/*.json (repo kökündeki Python venv/pyyaml ile)
npm run dev       # http://localhost:5173
npm test          # öğrenme motoru testleri
```

## Supabase (kalıcı ilerleme, isteğe bağlı)

Anahtar girilmezse uygulama yalnız bu cihazda (localStorage) çalışır.

1. supabase.com'da yeni proje aç.
2. **Authentication → Sign In / Providers → Allow anonymous sign-ins** aç (öğrenci üyeliksiz başlar).
3. `supabase/schema.sql` dosyasını **SQL Editor**'de çalıştır.
4. `app/.env.example` dosyasını `app/.env.local` olarak kopyala, URL ve **anon** anahtarı yaz. `service_role` anahtarını asla koyma.
5. Geliştirme sunucusunu yeniden başlat.

Hesap: öğrenci "Hesabı kaydet" ile e-posta + şifre ekler (aynı ilerleme korunur); başka cihazda "Giriş yap" ile devam eder.
Authentication → Email bölümünde "Confirm email" açıksa kayıt sonrası onay e-postası gider.

## Pilot sonuçlarını görmek (öğretmen)

`supabase/analytics.sql` dosyasını SQL Editor'de bir kez çalıştır (görünümler `analytics` şemasında; öğrenciler okuyamaz, yalnız sen SQL Editor'den görürsün). Sonra:

```sql
-- öğrenci başına özet (takma ad, sınıf, seviye, biten ders, doğru %, kelime durumları, Gün 8/15 sonuçları)
select * from analytics.student_summary order by son_islem desc;

-- hangi kelimeler zorluyor
select * from analytics.word_stats order by yanlis_yuzde desc, yanlis desc limit 30;
```

Öğrenci ilk testten sonra takma ad ve (isteğe bağlı) sınıf kodu girer; gerçek ad zorunlu değildir.

## Yayın (Cloudflare)

Canlı adres: **https://lgsingilizce.app** (www da çalışır). Cloudflare Workers statik yayın, ayar `wrangler.jsonc`, güvenlik ve noindex başlıkları `public/_headers`. Pilot: arama motorlarına kapalı (noindex).

```bash
cd app
npm run deploy     # içeriği üretir, derler, Cloudflare'e gönderir (bir kez: npx wrangler@4 login; Python + pyyaml gerekir)
```

`.env.local` içindeki Supabase değerleri derleme sırasında pakete gömülür (publishable anahtar herkese açık olacak şekilde tasarlanmıştır).

**Eski adres:** `hocanova.netlify.app` artık yalnız `migrate/` taşıma sayfasını sunar. Ziyaretçinin tarayıcı verisini (ilerleme + Supabase oturumu) `#tasi=` ile yeni adrese taşır, eski service worker'ı kaldırır. Yeni adreste `src/boot.js` → `src/migrate.js` bu veriyi yazar. Taşıma sayfasını değiştirirsen: `npm run deploy:eski-adres`. (Daha eski hikayenglish-koc.netlify.app kredisi biten hesapta kaldı.)

## Öğretmen ödev bağlantısı

Sınıfa şu biçimde bir bağlantı gönder; açan öğrencinin günlük hedefi güncellenir (5–300 soru):

`https://lgsingilizce.app/?odev=100&not=Bugün%20100%20soru%20çöz`

## Öğretmen paneli ve "Sorun bildir" (Supabase kurulumu)

1. `supabase/reports.sql` çalıştır (öğrenci bildirimleri için tablo).
2. Authentication → Users → Add user ile kendi e-posta + şifreni oluştur (Auto confirm).
3. `supabase/teacher.sql` çalıştır, dosyanın sonundaki yorumlu `insert` satırını e-postanla çalıştırıp kendini öğretmen yap.
4. Panel: `https://lgsingilizce.app/#ogretmen` (öğrenci oturumundan ayrı giriş; yalnız o sekmede açık kalır).

## Veli bağlantısı

`supabase/parent_link.sql` çalıştırılırsa, Veli raporu ekranında "Bağlantı oluştur" çıkar. Veli `…/#veli=KOD` adresini kendi telefonunda açar (giriş yok, öğrenci oturumu açılmaz); yalnız `parent_report` işlevi çağrılır. Öğrenci "Bağlantıyı kapat" derse bağlantı çalışmaz.

## Tahta modu (sınıfta)

`https://lgsingilizce.app/#tahta` — ünite ve günü elle seçip dersi tahtada açarsın. Giriş, başlangıç testi ve sıra kilidi yok; oturum açılmaz, ilerleme kaydedilmez (sayfa yenilenince sıfırlanır).
