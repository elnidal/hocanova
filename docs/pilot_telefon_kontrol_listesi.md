# Pilot öncesi telefon kontrol listesi

Adres: **https://hocanova.netlify.app**
Süre: cihaz başına yaklaşık 40 dakika. En az **bir iPhone (Safari)** ve **bir Android (Chrome)** ile dene.

Her sorunda şunları not et: **cihaz + tarayıcı**, **hangi adım**, **ne oldu / ne bekliyordun**, mümkünse **ekran görüntüsü**. Bana aynen gönder, düzeltirim.

---

## 0. Hazırlık
- [ ] Telefonun güncel mi? (iOS 16+ / Android 10+ yeterli)
- [ ] Sessiz modu kapat (iPhone'da yan düğme). Kapalı değilse ses çıkmaz, bu bir hata değil.
- [ ] Siteyi daha önce açtıysan: uygulamada **Hesabım → Verileri sıfırla**. Böylece yeni öğrenci gibi başlarsın.

## 1. İlk açılış
- [ ] Logolu açılış ekranı (baykuş + üç nokta) kısa süre görünüyor, boş beyaz ekran yok.
- [ ] Tanıtım turu 3 sayfa: İleri / Geri / Atla çalışıyor, yazılar kesilmiyor.
- [ ] Son sayfada "Başlangıç testine geç" testi açıyor.

## 2. Ana ekrana ekleme (uygulama gibi kullanım)
**iPhone (Safari):** Paylaş düğmesi → "Ana Ekrana Ekle".
**Android (Chrome):** Üç nokta → "Ana ekrana ekle" ya da "Uygulamayı yükle".
- [ ] İkon (gözlüklü baykuş) ana ekranda görünüyor, adı "Kelime Koçu". Eski ikon görünürse siteyi silip yeniden ekle (telefonlar ikonu önbelleğe alır).
- [ ] İkondan açınca tarayıcı çubuğu olmadan tam ekran açılıyor.

## 3. Başlangıç testi (18 soru)
- [ ] Bölüm girişleri (A, B, C) görünüyor.
- [ ] İngilizce soruların altında Türkçe satır var.
- [ ] "Bilmiyorum" seçilebiliyor.
- [ ] Sonuç ekranı: puan, seviye, "Yanlışlarını gözden geçir" açılıyor.

## 4. Ünite 1 ön testi (10 soru)
- [ ] Ana ekranda "Ünite 1 ön testi" kartı var; "Şimdilik atla" da çalışıyor.
- [ ] Testi çöz; sonuçta yüzde görünüyor.

## 5. Gün 1 dersi (en önemli bölüm)
- [ ] Kartlar: ifade, Türkçesi, örnek cümle. **Hoparlör ikonuna dokununca İngilizce okunuyor mu?** (Sesin kalitesini de not et.)
- [ ] Hikâye: 4'er satır açılıyor, "Devam" ile ilerliyor. Kırmızı ifadeye dokununca altta anlam kutusu çıkıyor.
- [ ] Sahne (İngilizce mesajlar) okunaklı.
- [ ] Sorular: üstte "Soru x / y" çubuğu ilerliyor. Doğru/yanlışta açıklama çıkıyor. Yanlış yapınca aynı kelimeden farklı bir soru geliyor.
- [ ] Hap bilgi kartları araya giriyor.
- [ ] Gün raporu: öğrenilenler listesi, "yarın tekrar" etiketi, koç mesajı.
- [ ] Ders ortasında uygulamayı kapatıp açınca ana ekrana dönüyor (ders kaydedilmez; bu beklenen davranış).

## 6. Ana ekran
- [ ] Koç mesajı duruma göre değişiyor ("Bugün X soru çözdün…").
- [ ] Günlük hedef çubuğu ilerliyor; "Hedefi değiştir" ile 10/20/50/100 seçilebiliyor.
- [ ] "Ünite 1 · …" bölümü açılıp kapanıyor; ünite değiştirilebiliyor.
- [ ] Takma ad kartı ilk dersten sonra çıkıyor; kaydedince küçülüyor.

## 7. Yardımcı ekranlar
- [ ] **Hızlı kart:** Kartı çevir, Bilmiyorum / Emin değilim / Bildim. Diyalog satırları ayrı ayrı görünüyor.
- [ ] **Yanlış defterim:** Yanlış yaptığın sorular, senin cevabın (üstü çizili), doğrusu, açıklama.
- [ ] **Sınav Dili:** Bir ders aç: taktik kartları, çözümlü örnek, alıştırma, ipuçları.
- [ ] **Kelime listesi (PDF):** Ünite seç, kapsam seç, "PDF olarak kaydet".
  - iPhone: Yazdır ekranında önizlemeyi iki parmakla büyüt, sonra Paylaş → Dosyalar'a kaydet.
  - Android: Yazıcı olarak "PDF olarak kaydet".
  - [ ] PDF beyaz zeminli, tablo düzgün, düğmeler PDF'te görünmüyor.
- [ ] **Veli raporu:** Aynı şekilde PDF'e kaydet; kutular ve haftalık çubuklar düzgün.

## 7b. Yeni: Sorun bildir, veli bağlantısı, paylaşım kartı
(Sorun bildir ve veli bağlantısı için Supabase'de `reports.sql` ve `parent_link.sql` çalıştırılmış olmalı.)
- [ ] Bir sorunun cevabını verince altta "Bu soruda sorun mu var?" çıkıyor; gönderince "Teşekkürler" yazıyor.
- [ ] Veli raporu → "Bağlantı oluştur" → "Paylaş / kopyala". Bağlantıyı **başka bir telefonda** aç: rapor giriş istemeden açılıyor.
- [ ] "Bağlantıyı kapat" dedikten sonra aynı bağlantı "artık geçerli değil" diyor.
- [ ] Ünite son testinde ilerleme varsa "Sonucumu paylaş 📸" kartı çıkıyor; kartta ad yok; paylaşım sayfası (iPhone) ya da indirme (Android) çalışıyor.
- [ ] Öğretmen paneli: `/#ogretmen` adresinde giriş yapınca sınıf özeti ve öğrenciler görünüyor (`teacher.sql` çalıştırılmış olmalı).
- [ ] Ses: robotik değil, mümkünse İngiliz aksanı. (Telefonun ayarlarından daha iyi bir İngilizce ses indirilebilir.)

## 8. Öğretmen ödev bağlantısı
- [ ] Telefonda şu adresi aç: `https://hocanova.netlify.app/?odev=50&not=Bugün%2050%20soru`
- [ ] Hedef kartı "Öğretmeninin ödevi · 0 / 50" ve "Bugün 50 soru" notunu gösteriyor.

## 9. Kalıcılık ve çevrimdışı
- [ ] Uygulamayı tamamen kapat, yeniden aç: ilerleme duruyor.
- [ ] Siteyi bir kez açtıktan sonra **uçak modunu aç** ve ikondan yeniden aç: ana ekran ve ders açılıyor mu?
- [ ] Uçak modunu kapat; bir süre sonra ilerleme kaybolmadan devam ediyor.

## 10. Görünüm
- [ ] Telefonun **koyu modunu** aç: yazılar okunaklı, Hoca Nova balonu ayırt ediliyor.
- [ ] Telefonda **yazı boyutunu büyüt** (erişilebilirlik): taşma ya da üst üste binme var mı?
- [ ] Telefonu **yatay** çevir: ekran bozulmuyor.
- [ ] Hiçbir ekranda sağa sola kaydırma (yatay taşma) yok.

## 11. Bilinen sınırlar (hata değil)
- Cuma quiz'i yalnız **cuma–pazar** arası ve o hafta en az 5 ifade çalışıldıysa görünür.
- Ünite son testi, ünitenin **tüm** dersleri bitince açılır.
- İlerleme ve veli raporu **cihaza bağlı**. Başka telefonda sıfırdan başlar (hesap kaydı yapılmadıysa).

## 12. Bitince
- [ ] Bulduklarını bana gönder (cihaz + adım + ekran görüntüsü).
- [ ] Denemeden sonra **Hesabım → Verileri sıfırla** ile temizle. Öğrencilere bu telefonu verirsen sıfırdan başlasınlar.
