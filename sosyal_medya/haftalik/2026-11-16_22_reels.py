# 16–22 Kasım 2026 Reels · ara tatil tekrar haftası
# Hepsi kanca() ile açılır: 0. karede dolu, büyük iddia/soru (eski açılışta ilk kare boştu).
# Zamanlar saniye; el() zamanı sahnenin başına göre. Yardımcılar reel_uret.py'den gelir.

K = 1.4  # kanca süresi

REELS = [
  {"kod": "01_pzt", "seri": "sayac", "sahneler": [
    kanca(K, "Ara tatil başladı 🎒", "209 gün", "Tatilde İngilizceyi unutma"),
    sahne(K, K + 5,
      el(0.1, '<h2 class="d">🧮 Küçük bir hesap</h2>'),
      el(0.5, '<div class="card"><p style="font-size:56px"><b>5 gün</b> × <b>10 dakika</b></p></div>', snd="pop"),
      el(1.6, '<div class="d" style="font-size:120px;line-height:1;color:#3B4BD8">= 50 dk</div>', fx="zoom", snd="ding"),
      el(3.0, '<div class="tip"><span class="k">Hoca Nova:</span> Bir film bile değil 🍿</div>')),
    sahne(K + 5, K + 11.5,
      el(0.1, '<h2 class="d">📅 Bu hafta her gün:</h2>'),
      el(0.6, '<div class="row"><span class="ic">⚠️</span><span>miss · pretty tuzakları</span></div>', snd="pop"),
      el(1.3, '<div class="row"><span class="ic">📝</span><span>Davet ve grafik soruları</span></div>', snd="pop"),
      el(2.0, '<div class="row"><span class="ic">💊</span><span>play / go / do</span></div>', snd="pop"),
      el(2.7, '<div class="row"><span class="ic">🏆</span><span>Pazar: tatil sınavı</span></div>', snd="pop")),
    kapanis(K + 11.5, 209, "Tatilde de her gün 1 adım 💪"),
  ]},

  {"kod": "02_sal", "seri": "tuzak", "sahneler": [
    kanca(K, "Çoğu öğrenci bunu yanlış çeviriyor", "I miss the bus.", "= Otobüsü özlüyorum? 😳"),
    sahne(K, K + 5.3,
      el(0.2, '<div class="card"><p style="font-size:58px">❌ miss = <span data-x="2.6" data-a="0">hep özlemek</span></p></div>', snd="pop"),
      el(3.0, '<div class="card"><p style="font-size:58px">✅ miss the bus = <b>kaçırmak</b> 🚌</p></div>', fx="zoom", snd="ding")),
    sahne(K + 5.3, K + 10.8,
      el(0.1, '<h2 class="d">🎯 LGS\'de böyle çıkar:</h2>'),
      el(0.6, '<div class="card"><p class="en" style="font-size:48px">"I don\'t want to <b>miss</b> my piano lesson."</p></div>'),
      el(2.4, '<p class="lead">Dersi özlemiyor, <b>kaçırmak</b> istemiyor.</p>', snd="pop")),
    sahne(K + 10.8, K + 15,
      el(0.1, '<div class="card"><p style="font-size:54px">🚌 olay / taşıt → <b>kaçırmak</b></p></div>', snd="pop"),
      el(0.9, '<div class="card"><p style="font-size:54px">👵 kişi / yer → <b>özlemek</b></p></div>', snd="pop")),
    kapanis(K + 15, 208, "Kaydet 📌 Arkadaşına gönder 📤"),
  ]},

  {"kod": "03_car", "seri": "soru", "sahneler": [
    kanca(K, "10 saniyen var ⏱️", "Davete kibarca HAYIR de", "Hangi şık?"),
    sahne(K, K + 14.5,
      chat_reel(0.1, 1.0, ("Elif", "Would you like to come to our band's concert on Saturday?"),
                          ("Kaan", "______ I have a football match at the same time.")),
      el(1.6, '<p class="q">Which of the following completes the dialogue?</p>'),
      opts_reel(["Sure, I'd love to.", "Yes, see you there!", "Sorry, I can't.", "Of course. What time?"], "C", 12.6, 2.2),
      el(2.6, halka(2.6, 10)),
      cls="sik"),
    sahne(K + 14.5, K + 20,
      el(0.1, '<h2 class="d">✅ Cevap: C</h2>', snd="pop"),
      el(0.6, '<div class="tip" style="font-size:46px">Boşluktan <span class="k">sonra</span> bahane var:<br>aynı saatte maçı var → <span class="k">ret</span></div>'),
      el(2.2, '<div class="card"><p>Kibar ret: <b class="en">Sorry, I can\'t.</b><br><b class="en">I\'d love to, but…</b></p></div>')),
    kapanis(K + 20, 207, "Sen hangi şıkkı seçtin? 👇"),
  ]},

  {"kod": "04_per", "seri": "tuzak", "sahneler": [
    kanca(K, "Çoğu öğrenci bunu yanlış çeviriyor", "pretty boring", "= güzel sıkıcı? 🤔"),
    sahne(K, K + 5.3,
      el(0.2, '<div class="card"><p style="font-size:58px">❌ pretty = <span data-x="2.6" data-a="0">hep güzel</span></p></div>', snd="pop"),
      el(3.0, '<div class="card"><p style="font-size:58px">✅ pretty + sıfat = <b>oldukça</b></p></div>', fx="zoom", snd="ding")),
    sahne(K + 5.3, K + 10.8,
      el(0.1, '<h2 class="d">🎯 LGS\'de böyle çıkar:</h2>'),
      el(0.6, '<div class="card"><p class="en" style="font-size:48px">"The film was <b>pretty</b> long, but I enjoyed it."</p></div>'),
      el(2.4, '<p class="lead">Film <b>oldukça</b> uzun.</p>', snd="pop")),
    sahne(K + 10.8, K + 15,
      el(0.1, '<div class="card"><p style="font-size:54px">pretty <b>good</b> → oldukça iyi</p></div>', snd="pop"),
      el(0.9, '<div class="card"><p style="font-size:54px">a pretty <b>dress</b> → güzel elbise</p></div>', snd="pop")),
    kapanis(K + 15, 206, "pretty kafası karışık arkadaşına gönder 📤"),
  ]},

  {"kod": "05_cum", "seri": "hap", "sahneler": [
    kanca(K, "Hangisi doğru?", "I go football?", "play mı, go mu, do mu?"),
    sahne(K, K + 8,
      el(0.2, '<div class="card"><p style="font-size:52px">⚽ <b>play</b> + top oyunu<br>play football, play tennis</p></div>', snd="pop"),
      el(2.4, '<div class="card"><p style="font-size:52px">🏊 <b>go</b> + -ing<br>go swimming, go hiking</p></div>', snd="pop"),
      el(4.6, '<div class="card"><p style="font-size:52px">🥋 <b>do</b> + dövüş sporu, egzersiz<br>do karate, do yoga</p></div>', snd="pop")),
    sahne(K + 8, K + 13.5,
      el(0.2, '<div class="card"><p style="font-size:56px"><span data-x="2.2" data-a="0">❌ I go football.</span></p></div>', snd="pop"),
      el(2.6, '<div class="card"><p style="font-size:56px">✅ I <b>play</b> football.</p></div>', fx="zoom", snd="ding"),
      el(3.6, '<div class="tip"><span class="k">🧠</span> Top → play · -ing → go · gerisi → do</div>')),
    kapanis(K + 13.5, 205, "\"I go football\" diyen arkadaşına gönder 😄"),
  ]},

  {"kod": "06_cmt", "seri": "soru", "sahneler": [
    kanca(K, "10 saniyede çöz ⏱️", "30 öğrenci", "Kaçı film izliyor?"),
    sahne(K, K + 16,
      el(0.1, '<div class="card"><p class="en" style="font-size:36px">Ece asked <b>30 classmates</b> about their favourite free-time '
              'activity. Half of them prefer playing sports. Six students like reading, and the rest enjoy watching films.</p></div>'),
      el(1.2, '<p class="q">How many students enjoy watching films?</p>'),
      opts_reel(["6", "9", "15", "24"], "B", 14.2, 1.8),
      el(3.2, halka(3.2, 10)),
      cls="sik"),
    sahne(K + 16, K + 21.5,
      el(0.1, '<h2 class="d">✅ Cevap: B</h2>', snd="pop"),
      el(0.6, '<div class="tip" style="font-size:46px">half = 15<br>15 + 6 = 21<br><span class="k">the rest</span> = 30 − 21 = 9</div>'),
      el(2.2, '<p class="lead">🎯 the rest = <b>geri kalanı</b>, dinlenmek değil.</p>')),
    kapanis(K + 21.5, 204, "Sen kaç saniyede buldun? 👇"),
  ]},

  {"kod": "07_paz", "seri": "sayac", "sahneler": [
    kanca(K, "Tatil sınavı 🏆", "5 soru", "Kaçını bileceksin?"),
    sahne(K, K + 4, el(0.1, '<div class="d word" style="font-size:110px">miss the bus</div>', fx="zoom", snd="pop"),
      el(2.2, '<div class="d mean" style="font-size:72px">= kaçırmak</div>', fx="zoom", snd="ding"), cls="ctr"),
    sahne(K + 4, K + 8, el(0.1, '<div class="d word" style="font-size:110px">pretty easy</div>', fx="zoom", snd="pop"),
      el(2.2, '<div class="d mean" style="font-size:72px">= oldukça kolay</div>', fx="zoom", snd="ding"), cls="ctr"),
    sahne(K + 8, K + 12, el(0.1, '<div class="d word" style="font-size:110px">___ swimming</div>', fx="zoom", snd="pop"),
      el(2.2, '<div class="d mean" style="font-size:72px">= go</div>', fx="zoom", snd="ding"), cls="ctr"),
    sahne(K + 12, K + 16, el(0.1, '<div class="d word" style="font-size:96px">Sorry, I ___ come.</div>', fx="zoom", snd="pop"),
      el(2.2, '<div class="d mean" style="font-size:72px">= can\'t</div>', fx="zoom", snd="ding"), cls="ctr"),
    sahne(K + 16, K + 20, el(0.1, '<div class="d word" style="font-size:96px">the rest of the class</div>', fx="zoom", snd="pop"),
      el(2.2, '<div class="d mean" style="font-size:72px">= sınıfın geri kalanı</div>', fx="zoom", snd="ding"), cls="ctr"),
    kapanis(K + 20, 203, "Puanını yorumlara yaz 🏆"),
  ]},
]
