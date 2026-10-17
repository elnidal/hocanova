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

## Yayın (Netlify)

Canlı adres: https://hikayenglish-lgs.netlify.app (Netlify ekibi LGSingilizce, site `hikayenglish-lgs`). Pilot: arama motorlarına kapalı (noindex).

```bash
cd app
npm run deploy     # içeriği üretir, derler, canlıya gönderir (netlify login gerekir; Python + pyyaml gerekir)
```

`.env.local` içindeki Supabase değerleri derleme sırasında pakete gömülür (publishable anahtar herkese açık olacak şekilde tasarlanmıştır).
Netlify ekip ayarı yeni sitelere varsayılan olarak "yalnız Netlify üyeleri görsün" korumasını koyabiliyor; yeni site açarsan `netlify api updateSite` ile `sso_login:false` yap.
