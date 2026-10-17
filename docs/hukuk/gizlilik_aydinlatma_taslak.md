# Hikayenglish LGS Kelime Koçu — Gizlilik ve Kişisel Verilerin Korunması Aydınlatma Metni

> **TASLAK — yayımlanmadan önce bir hukukçu (KVKK bilen avukat) okumalıdır.** Bu metin hukuki danışmanlık değildir. `[[ ... ]]` ile işaretli yerler doldurulmadan kullanılmamalıdır. Metindeki teknik bilgiler uygulamanın kodundan çıkarılmıştır (17 Ekim 2026 sürümü); uygulama değişirse metin de güncellenmelidir.

## Kısa özet (öğrenci için)

- Uygulama **gerçek adını istemez**. Bir takma ad (ve istersen sınıf kodu) yazarsın.
- Kaydettiklerimiz: verdiğin cevaplar, hangi derslerin bittiği, hangi kelimeleri bildiğin ve ne zaman çalıştığın.
- Bunları **öğretmenin**, uygulamanın işe yarayıp yaramadığını görmek ve sana daha iyi tekrar planı yapmak için kullanır.
- **Reklam yok, takip yok, verilerini kimseye satmıyoruz.**
- İstediğin zaman (velinle birlikte) verilerinin silinmesini isteyebilirsin: `[[iletişim e-postası]]`.

## 1. Veri sorumlusu

Veri sorumlusu: `[[Ad Soyad / kurum unvanı]]`  
Adres: `[[adres]]` · E-posta: `[[kvkk iletişim e-postası]]`

## 2. Hangi verileri işliyoruz?

| Veri | Nedir | Zorunlu mu? |
|---|---|---|
| Takma ad, sınıf kodu | Öğrencinin yazdığı isim ve (varsa) sınıf kodu. Gerçek ad istenmez. | Takma ad pilotta istenir; sınıf kodu isteğe bağlı |
| Öğrenme verisi | Başlangıç testi sonucu (puan ve seviye), her sorunun cevabı (doğru/yanlış, seçilen yanlış şık), bitirilen dersler, kelime durumları (yeni / kararsız / biliniyor), kalıcılık kontrol sonuçları, zaman damgaları | Uygulamanın çalışması için |
| Anonim kimlik | Uygulama ilk açılışta rastgele bir kullanıcı numarası (UUID) oluşturur. | Evet |
| E-posta ve şifre | Yalnızca öğrenci "Hesabı kaydet" derse. Şifre geri döndürülemez biçimde (hash) saklanır, bize görünmez. | Hayır |
| Teknik kayıtlar | Barındırma ve veritabanı sağlayıcılarının tuttuğu IP adresi, tarayıcı türü, istek zamanı gibi sunucu günlükleri | Teknik olarak kaçınılmaz |

**İşlemediklerimiz:** gerçek ad-soyad, T.C. kimlik no, telefon, adres, fotoğraf, ses, konum, rehberlik/sağlık bilgisi, kimliği belirleyen başka bilgi. Uygulamada reklam, analitik, üçüncü taraf izleyici ve çerez **yoktur**. (Uygulama cihazda "yerel depolama" kullanır: ilerlemenin kaybolmaması için; bu bir izleme çerezi değildir.)

## 3. Neden işliyoruz? (amaç ve hukuki sebep)

- Öğrenciye kişisel tekrar planı sunmak ve ilerlemesini göstermek.
- Pilot çalışmada uygulamanın öğrenmeye etkisini ve içerik kalitesini değerlendirmek (hangi kelimeler zorluyor, kalıcılık oranı). Raporlarda öğrenciler **takma adla / toplu** gösterilir.
- Hukuki sebep: velinin / yasal temsilcinin **açık rızası** (KVKK m.5/1 ve m.6'ya göre, reşit olmayanlar için veli onayı) — `[[hukukçu doğrulasın]]`.

## 4. Verileri kimlerle paylaşıyoruz ve nerede saklıyoruz?

Verileriniz kimseye satılmaz ve reklam amacıyla paylaşılmaz. Teknik hizmet sağlayıcılar (veri işleyen):

| Sağlayıcı | Ne için | Konum |
|---|---|---|
| Supabase | Veritabanı ve giriş (kimlik) hizmeti | Avrupa (İrlanda) `[[bölgeyi doğrula]]` |
| Netlify | Uygulamanın barındırılması (sunucu günlükleri) | Küresel altyapı, şirket ABD merkezli |
| Cloudflare Turnstile | Bot koruması (CAPTCHA), yalnız etkinleştirilirse | Küresel altyapı |

Bu sağlayıcıların sunucuları veya şirketleri Türkiye dışında olduğundan, verilerin **yurt dışına aktarımı** söz konusudur. Aktarım için velinin ayrı ve açık rızası alınır (bkz. veli formu) `[[hukukçu: güncel KVKK m.9 mekanizması]]`.

## 5. Ne kadar süre saklıyoruz?

`[[saklama süresi]]` — Öneri: pilot bittikten sonra en geç `[[90 gün]]` içinde veriler silinir veya kimliksizleştirilir (takma ad ve sınıf kodu kaldırılır, yalnız toplu istatistik tutulur). Hesap silme talebinde veriler `[[7 gün]]` içinde silinir.

## 6. Haklarınız

KVKK madde 11 uyarınca veri sorumlusuna başvurarak: verilerinizin işlenip işlenmediğini öğrenme, bilgi isteme, düzeltilmesini / silinmesini isteme, işlemeye itiraz etme, zarar halinde tazminat isteme haklarına sahipsiniz. Başvuru: `[[e-posta]]`. Rızanızı istediğiniz zaman geri çekebilirsiniz; bu durumda öğrencinin verileri silinir ve uygulama kullanımı sona erer. Yanıt süresi en geç 30 gündür.

## 7. Çocukların verileri

Uygulama 8. sınıf öğrencilerine yöneliktir. Reşit olmayan öğrencinin verileri **yalnızca veli / yasal temsilcinin açık rızasıyla** işlenir. Veli, rızasını istediği an geri çekebilir. Öğrencilerden gerçek kimlik bilgisi istenmez; takma ad kullanılması önerilir.

## 8. Güvenlik

Veri aktarımı şifreli bağlantı (HTTPS) ile yapılır. Veritabanında her öğrenci yalnız kendi kaydını okuyabilir/yazabilir (satır düzeyinde erişim kuralı). Öğrenci özetlerine yalnızca yetkili öğretmen hesabı erişir. Tüm sistemlerde mükemmel güvenlik garantisi verilemez; bir ihlal olursa mevzuat gereği ilgililere ve Kurula bildirim yapılır.

## 9. Değişiklikler

Bu metin güncellenirse uygulamada ve `[[adres]]` sayfasında duyurulur. Son güncelleme: `[[tarih]]`.
