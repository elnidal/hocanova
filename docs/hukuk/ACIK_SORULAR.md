# Gizlilik / CAPTCHA — Murat'ın ve hukukçunun cevaplaması gerekenler

Taslaklar (`gizlilik_aydinlatma_taslak.md`, `veli_bilgilendirme_riza_taslak.md`) **bunlar netleşmeden kullanılmamalı.** Ben hukuki görüş veremem; aşağıdakiler bir hukukçuya sorulacak soru listesidir.

## Karar / bilgi gereken
1. **Veri sorumlusu kim?** Şahıs (Murat) mı, bir şirket/dernek mi? Metne ad, adres, e-posta yazılmalı.
2. **Okul izni:** Okulda öğrencilere uygulama denetmek için okul müdürlüğünün / il-ilçe milli eğitim müdürlüğünün izni gerekir mi? (Ben bilmiyorum, kontrol edin.)
3. **VERBİS** (veri sorumluları sicili) yükümlülüğü var mı? Eşikler ve istisnalar için hukukçuya sorun.
4. **Yurt dışı aktarım** (Supabase İrlanda, Netlify ABD): güncel KVKK madde 9 uyarınca hangi mekanizma (açık rıza / standart sözleşme) yeterli? Sağlayıcıların veri işleme sözleşmeleri (DPA) imzalanmalı mı?
5. **Saklama süresi** ve silme: öneri 90 gün (pilot sonrası). Uygun mu?
6. **Veli onayı toplama yöntemi:** kâğıt mı, elektronik mi? Onay kim tarafından, nerede saklanacak?
7. **Takma ad ilkesi:** öğrencilere "gerçek adını yazma" talimatı sınıfta verilecek mi? (Önerilir.)

## CAPTCHA kurulumu (Murat'ın yapacağı, ~10 dk)
Kod hazır ve isteğe bağlı; **sıra önemli** (yanlış sırada yeni öğrenciler giriş yapamaz):
1. Cloudflare hesabında **Turnstile** → yeni widget; alan adı: `hikayenglish-lgs.netlify.app` (yerel deneme için `localhost` da ekle). **Site anahtarı** (herkese açık) ve **gizli anahtar** (secret) verilir.
2. `app/.env.local` dosyasına `VITE_TURNSTILE_SITE_KEY=<site anahtarı>` yaz → bana söyle, derleyip yayınlayayım ve telefonda yeni bir öğrenci olarak giriş yapıldığını doğrulayayım.
3. **Ancak ondan sonra** Supabase → Authentication → Attack Protection → CAPTCHA → Turnstile → **gizli anahtarı** yapıştır, kaydet.
4. Gizli anahtarı kimseyle paylaşma, git'e koyma; yalnız Supabase paneline girilir.

## Veri silme talebi geldiğinde (öğrenci/veli isterse)
Takma adla kullanıcıyı bul, sonra sil (silme geri alınamaz; satır `progress` tablosundan otomatik kalkar):

```sql
-- 1) kimin kaydı? (takma ad + sınıf)
select takma_ad, sinif, anonim, eposta, ilk_giris
from analytics.student_summary
where takma_ad ilike '%Deneme%';

-- 2) emin olduktan sonra: kullanıcı kimliğini bul ve sil
select u.id from auth.users u join public.progress p on p.user_id = u.id
where p.state->'profile'->>'nick' = 'TAKMA_AD' and p.state->'profile'->>'group' = 'SINIF';
-- delete from auth.users where id = '<yukarıdaki id>';   -- progress satırı da (cascade) silinir
```

> Uygulamadaki "Verileri sıfırla" (ana ekranın altı) hem cihazdaki hem sunucudaki ilerlemeyi boş bir kayıtla değiştirir ama anonim kullanıcıyı (ve girdiyse e-postasını) silmez. Tam silme için yukarıdaki SQL gerekir.
