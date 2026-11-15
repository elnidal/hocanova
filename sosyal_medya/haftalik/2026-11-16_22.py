# 16–22 Kasım 2026 · Ara tatil haftası: Ünite 1–2 tuzak tekrarı · metinler: 2026-11-16_22.md
# Geri sayım 13 Haziran 2027'ye göre (16 Kasım = 209 gün).
# chat / opts / rows yardımcıları kart_uret.py'den gelir.

SORU1 = ["Sure, I'd love to.", "Yes, see you there!", "Sorry, I can't.", "Of course. What time?"]
SORU2 = ["6", "9", "15", "24"]
SORU2_METIN = ('<div class="card"><p class="en" style="font-size:36px">Ece asked <b>30 classmates</b> about their favourite '
               'free-time activity. Half of them prefer playing sports. Six students like reading, and the rest enjoy '
               'watching films.</p></div>')

HAFTA = [
  {"kod": "01_pzt_sayac", "seri": "sayac",
   "slaytlar": [
     {"grad": True, "html": '<div class="d" style="font-size:90px">LGS\'ye</div><div class="d big">209</div>'
        '<div class="d" style="font-size:90px">gün kaldı</div>'
        '<p class="lead">Ara tatil başladı. Dinlen,<br>ama İngilizceyi <b style="color:#FFC93C">unutturma.</b></p>'},
     {"html": '<h2 class="d">📅 Tatil planı: günde 10 dakika</h2>' + rows(
        ("⚠️", "Sal · Tuzak: miss"), ("📝", "Çar · LGS sorusu: davet"), ("⚠️", "Per · Tuzak: pretty"),
        ("💊", "Cum · play / go / do"), ("📝", "Cmt · Grafik sorusu"), ("🏆", "Paz · Tatil sınavı"))},
     {"html": '<h2 class="d">🧮 Küçük bir hesap</h2>'
        '<div class="card"><p><b>5 tatil günü</b> × <b>10 dakika</b></p>'
        '<p class="d" style="font-size:84px;color:#3B4BD8;margin-top:10px">= 50 dakika</p></div>'
        '<div class="tip"><span class="k">Hoca Nova:</span> Bir film bile değil. Ama Ünite 1 ve 2\'nin tuzaklarını kapatmaya yeter 😉</div>'},
   ],
   "story": {"gun": 209, "gorev": "Ünite 1 ve 2'den en zor bulduğun kelimeyi yaz. Bu hafta onu birlikte çözelim 👇"}},

  {"kod": "02_sal_tuzak", "seri": "tuzak",
   "slaytlar": [
     {"html": '<div class="d word">miss</div><h2 class="d">Çoğu öğrenci burada yanılıyor!</h2>'
        '<p class="lead">"Özlemek" mi, "kaçırmak" mı? ➡️</p>', "nova": "Önce sen tahmin et 🤔"},
     {"html": rows(("❌", "<b>miss</b> hep \"özlemek\" sanılır."),
                   ("✅", "<span class=\"en\">miss the bus / the party / the lesson</span> = <b>kaçırmak</b>"),
                   ("✅", "<span class=\"en\">I miss my grandma.</span> = <b>özlemek</b>"))},
     {"html": '<h2 class="d">🎯 LGS\'de nasıl çıkar?</h2>'
        '<div class="card"><p class="en">"Sorry, I can\'t come. I don\'t want to <b>miss</b> my piano lesson."</p>'
        '<p>Piyano dersini özlemiyor, <b>kaçırmak</b> istemiyor.</p></div>'
        '<div class="tip"><span class="k">🧠 Kural:</span> Arkasında olay ya da taşıt varsa kaçırmak; kişi ya da yer varsa özlemek.</div>'},
   ],
   "story": {"gun": 208, "gorev": "Hızlı test: <span class=\"en\">\"Hurry up! We will miss the bus!\"</span> Özlemek mi, kaçırmak mı? 🚌"}},

  {"kod": "03_car_soru", "seri": "soru",
   "slaytlar": [
     {"html": chat(("Elif", "Would you like to come to our band's concert on Saturday?"),
                   ("Kaan", "______ I have a football match at the same time."))
        + '<p class="q">Which of the following completes the dialogue?</p>' + opts(SORU1),
      "nova": "⏱️ 30 saniye! Cevabın yorumlara 👇"},
     {"html": '<h2 class="d">✅ Cevap: C</h2>' + opts(SORU1, "C")
        + '<div class="tip">İpucu boşluktan <span class="k">sonra</span>: aynı saatte maçı var, yani davete <span class="k">hayır</span> diyor. '
          'A, B ve D kabul cümlesi.<br>🎯 Kibar ret: <span class="k">Sorry, I can\'t.</span> · <span class="k">I\'d love to, but…</span></div>'},
   ],
   "story": {"gun": 207, "gorev": "Davete kibarca hayır demenin bir yolu daha: <span class=\"en\">\"______, but I'm busy.\"</span> Boşluğa ne gelir? 👇"}},

  {"kod": "04_per_tuzak", "seri": "tuzak",
   "slaytlar": [
     {"html": '<div class="d word">pretty</div><h2 class="d">Çoğu öğrenci burada yanılıyor!</h2>'
        '<p class="lead">"pretty boring" = güzel sıkıcı mı? ➡️</p>', "nova": "Önce sen tahmin et 🤔"},
     {"html": rows(("❌", "<b>pretty</b> hep \"güzel\" sanılır."),
                   ("✅", "pretty + sıfat = <b>oldukça</b>: <span class=\"en\">pretty good, pretty boring</span>"),
                   ("✅", "pretty + isim = <b>güzel, sevimli</b>: <span class=\"en\">a pretty dress</span>"))},
     {"html": '<h2 class="d">🎯 LGS\'de nasıl çıkar?</h2>'
        '<div class="card"><p class="en">"The film was <b>pretty</b> long, but I enjoyed it."</p>'
        '<p>Film güzel uzun değil, <b>oldukça</b> uzun.</p></div>'
        '<div class="tip"><span class="k">🧠 Kural:</span> pretty\'nin arkasına bak. Sıfat geliyorsa "oldukça".</div>'},
   ],
   "story": {"gun": 206, "gorev": "<span class=\"en\">\"This test is pretty easy.\"</span> Test güzel mi, yoksa oldukça kolay mı? 😄"}},

  {"kod": "05_cum_hap", "seri": "hap",
   "slaytlar": [
     {"html": '<div class="badge">30 saniyede dilbilgisi</div><h1 class="d">play, go,<br><span class="hl">do?</span></h1>'
        '<p class="lead">"go football" mu, "play football" mu? ➡️</p>'},
     {"html": rows(("⚽", "<b>play</b> + top oyunu: <span class=\"en\">play football, play tennis</span>"),
                   ("🏊", "<b>go</b> + -ing: <span class=\"en\">go swimming, go hiking</span>"),
                   ("🥋", "<b>do</b> + dövüş sporu, egzersiz: <span class=\"en\">do karate, do yoga</span>"))},
     {"html": rows(("❌", "<span class=\"en\">I go football.</span>"),
                   ("✅", "<span class=\"en\">I play football.</span>"))
        + '<div class="tip"><span class="k">🧠 Hafıza:</span> Top varsa <span class="k">play</span>, -ing varsa '
          '<span class="k">go</span>, gerisi <span class="k">do</span>.</div>'},
   ],
   "story": {"gun": 205, "gorev": "Boşluğu doldur: <span class=\"en\">\"My cousin ___ karate every Tuesday.\"</span> play / go / do? 🥋"}},

  {"kod": "06_cmt_soru", "seri": "soru",
   "slaytlar": [
     {"html": SORU2_METIN + '<p class="q">How many students enjoy watching films?</p>' + opts(SORU2),
      "nova": "⏱️ 30 saniye! Cevabın yorumlara 👇", "sik": True},
     {"sik": True, "html": '<h2 class="d">✅ Cevap: B</h2>' + opts(SORU2, "B")
        + '<div class="tip">30\'un <span class="k">half</span>\'ı = 15 · 15 + 6 = 21 · <span class="k">the rest</span> = 30 − 21 = <b>9</b>'
          '<br>🎯 <span class="k">the rest</span> burada "dinlenmek" değil, <b>geri kalanı</b>.</div>'},
   ],
   "story": {"gun": 204, "gorev": "<span class=\"en\">\"the rest of the class\"</span>: sınıfın dinlenmesi mi, geri kalanı mı? 🤔 Cevap postta"}},

  {"kod": "07_paz_sinav", "seri": "sayac",
   "slaytlar": [
     {"grad": True, "html": '<div class="badge" style="background:#FFC93C;color:#1B1E3A">🏆 Tatil sınavı</div>'
        '<div class="d" style="font-size:120px;line-height:1.05">5 soru,<br>tatil bitti mi?</div>'
        '<p class="lead">Cevapları aklında tut, 3. slaytta kontrol et ➡️</p>'},
     {"html": '<h2 class="d">✍️ 5 hızlı soru</h2>' + rows(
        ("1", "<span class=\"en\">miss the bus</span> = ?"),
        ("2", "<span class=\"en\">pretty easy</span> = ?"),
        ("3", "<span class=\"en\">___ swimming</span> (play / go / do)"),
        ("4", "<span class=\"en\">\"Sorry, I ___ come.\"</span>"),
        ("5", "<span class=\"en\">the rest of the class</span> = ?"))},
     {"html": '<h2 class="d">✅ Cevaplar</h2>' + rows(
        ("1", "otobüsü <b>kaçırmak</b>"), ("2", "<b>oldukça</b> kolay"), ("3", "<b class=\"en\">go</b> swimming"),
        ("4", "<b class=\"en\">can't</b>"), ("5", "sınıfın <b>geri kalanı</b>"))
        + '<div class="tip"><span class="k">5/5:</span> tatil verimli geçti 🏆 · <span class="k">3–4:</span> çok iyi 👍 · '
          '<span class="k">0–2:</span> bu haftanın postlarına bir daha bak 📌</div>'},
   ],
   "story": {"gun": 203, "gorev": "Tatil sınavından kaç aldın? 5/5 🏆 · 3–4 👍 · 0–2 📌 Yorumlara puanını yaz 👇"}},
]
