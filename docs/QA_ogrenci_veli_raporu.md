# QA raporu: öğrenci ve veli gözüyle (yerel sürüm, 22 Ekim 2026)

Yöntem: temiz bir öğrenci olarak telefon boyutunda (375×812) siteye girdim; başlangıç testi (18 soru) → ana ekran → Ünite 1 Gün 1 (hikâyeli) → Ünite 7 Gün 1 (hafif mod) → ana ekran; ayrıca koyu mod. Henüz oynamadıklarım: günlük tekrar ekranı, Gün 8/15 kontrolü, Ünite 1 giriş kontrolü, gerçek telefonda PWA/çevrimdışı.

## A. Hata (hemen düzeltilmeli)

| # | Bulgu | Durum |
|---|---|---|
| A1 | **Hafif mod (Ünite 7–10) dersi beyaz ekranla çöküyor**: `day.story is not iterable` (`Lesson.jsx`). Kart-önce akış eklenirken hikâyesiz günler korunmamış. Canlı sürümde de aynı kod var, yani 7–10. üniteye giren öğrenci boş ekran görür (canlıda denemedim, kod aynı). | **Düzeltildi** (yerel, 2 satır), canlıya gönderilmedi. Hafif günü baştan sona oynadım, çalışıyor. |
| A2 | **Büyük harfte Türkçe İ**: "FRİENDSHİP", "TOURİSM". Sayfa dili `tr` olduğu için CSS `uppercase` İngilizce kelimelere noktalı İ koyuyor. | Açık. Ünite başlığındaki İngilizce adı `lang="en"` ile sarmak yeter. |
| A3 | **Cevap geri bildirimi İngilizce**: "Correct!" / "Not quite. Doğrusu yeşil olan." (`Question.jsx:53`). Türkçe arayüzde yarı İngilizce yarı Türkçe. | Açık. "Doğru!" / "Neredeyse. Doğrusu yeşil olan." |

## B. Öğrenci gözüyle: akış ve ekran

1. **Açılışta sadece düz "Yükleniyor…" yazısı** var; logo/animasyon yok. Yavaş telefonda ilk izlenim boş sayfa.
2. **Ana ekran, yeni öğrencide kalabalık**: koç balonu + ders kartı + takma ad formu + 10 ünite butonu (≈350 px) + istatistik. Asıl ders kartı ilk ekranda ama altı uzun. Öneri: ünite seçimini "Ünite değiştir" ile katlanır yap, takma ad kartını ilk dersten sonra göster.
3. **Koç mesajı bayat**: Gün 1'i bitirince ana ekranda hâlâ "Hoş geldin!" yazıyor. Bitirince "Bugün 6 ifade öğrendin, yarın 6 tekrar seni bekliyor" gibi duruma göre mesaj olmalı. Aynı şekilde "bekleyen tekrar 0" yazıyor oysa yarına 6 tekrar kuruldu; "yarın: 6 tekrar" gösterilebilir.
4. **Ders içi ilerleme belirsiz**: üst çipte "Gün 1 · 4/6" kullan/sına aşamasının tamamı boyunca değişmiyor; o aşamada 12–24 soru var (Gün 1'de benim 48 ekranım oldu, çoğu yanlışlarımın yeniden sorulması). Öğrenci "ne kadar kaldı?" bilemiyor. Öneri: bu aşamada "Soru 7/14" çubuğu.
5. **Yanlış cevaba hemen aynı sorunun tekrarı**: yeniden sorulan soru aynı metin, sadece şıklar karışık. Öğrenci kelimeyi değil şık yerini ezberleyebilir. Öneri: tekrar için aynı kelimenin başka sorusunu seç, yoksa yeniden sormadan önce 2-3 farklı soru araya koy.
6. **Bazı yanlışlarda açıklama boş** (ör. `accept` kullan sorusu): sadece "Doğrusu yeşil olan." Her sorunun `explain` alanı dolu olmalı (doğrulayıcıya kural olarak eklenebilir).
7. **Ders sonu raporu**: 5/12 doğruda altı kelimenin altı tanesi de "biraz karıştı" yazıyor; ilk gün için moral bozucu. Eşik: ilk denemede en az yarısı doğruysa "iyi gidiyor" de, rozeti kelime başına değil toplamda ver.
8. **Başlangıç testi 5/18 çıkarsa** 13 yanlışın listesi açılıyor; iyi, ama öğrenci yalnız "Başlangıç" etiketini görüyor. Koç metni iki cümlede aynı şeyi tekrar ediyor ("her gün biraz ilerleyeceğiz … her gün birkaç yeni kelime, bol tekrar").
9. Test sorularında "laid-back → rahat, kafası rahat" şıkkı bulanık; "Sounds great!/I'd love to!" gibi birden fazla kabul edilebilir şık içeren diyalog soruları (Bölüm C, 13–14) hocanın gözünden geçmeli.
10. Koyu mod düzgün; yazı boyutu ve kontrast iyi. Dar telefonda yatay taşma yok.

## C. İçerik (öğretmen gözüyle, kısa)

- Hap bilgiler genel olarak temiz ve örnekli (önceki tarama). Gün 1'de "Would you like to" ve "How about" ilk hafta öğrencileri için doğru seçim.
- Hafif günde "hikâye yok" olduğu için Ünite 7–10 ilk bakışta sıkıcı olabilir: kart + 2 soru + tekrar. Günlük 6–7 dk hedefi tutuyor; yine de her gün bir "mini sahne" (2–3 satır diyalog) eklenirse bağlam gelir.
- Tüm içerik hâlâ `draft`; hocanın okuması bekleniyor.

## D. Koç gibi davranmak: önerilen özellikler

Öncelik sırası benim önerim (etki / emek):

1. **Günlük hedef + ödev** (yüksek etki, orta emek). Koç her sabah "Bugünkü görevin: 1 yeni ders + 20 tekrar sorusu" der; öğretmen sınıf için haftalık hedef (örn. "bu hafta 100 soru") belirler, öğrenci ilerleme çubuğu görür, bitince Hoca Nova tebrik eder. Hedefi öğretmen Supabase'den yazar (öğrenci/sınıf kodu zaten var).
2. **Kelime listesi PDF'i** (yüksek etki, düşük emek): "Ünite X kelimeleri" ve "ilk 10 günün kelimeleri"; kelime, Türkçesi, örnek cümle, tuzak notu; A4, yazdırılabilir. İçerik JSON'u hazır olduğu için tarayıcıdan `window.print()` ile ya da Python ile üretilebilir. Ayrıca "bildiklerimi çıkar, yalnız zorlandıklarım" seçeneği.
3. **Veli raporu** (yüksek etki, orta emek): tek sayfalık, paylaşılabilir bağlantı/PDF: bu hafta kaç gün çalıştı, kaç kelime "biliyor", en çok zorlandığı 5 kelime, seri. Takma ad kullandığımız için KVKK açısından da uygun; veli onayı metni hukuk taslaklarında var.
4. **Seri ve nazik hatırlatma**: kaç gündür ardışık çalıştığı; kaçırılan gün için suçlamasız mesaj ("Dün yoktun, bugün 5 dakikada yetişiriz"). Bildirim izni istemeden önce uygulama içi başlıkla başla.
5. **Haftalık mini test + rozet**: Cuma günü o haftanın 15 sorusu; sonuç kartı paylaşılabilir (Instagram hikâyesi için görsel) → huninin büyütülmesine de hizmet eder.
6. **Soru çözdürme modu ("bugün 100 soru")**: bitmiş üniteler için hızlı karışık soru seti, doğruluk yüzdesiyle; ödev hedefine sayılır.
7. **Öğretmen paneli** (sonra): sınıf kodu bazında kim çalıştı/çalışmadı; şimdilik `supabase/analytics.sql` yeterli.

## E. Önerilen sıra

1. A1–A3'ü düzelt ve canlıya gönder (hafif mod çökmesi acil). 
2. Ders içi ilerleme çubuğu (B4), duruma göre koç mesajı (B3), aynı sorunun tekrarı (B5).
3. Kelime listesi PDF'i (D2) ve günlük hedef (D1).
4. Veli raporu (D3).
