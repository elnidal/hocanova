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
