# 8–14 Kasım 2026 · Ünite 2 Teen Life (2. hafta) · metinler: 2026-11-08_14.md
# Geri sayım resmî tarihe göre: 13 Haziran 2027 Pazar (8 Kasım = 217 gün).
# 10 Kasım (Salı): story anma görseli; karusel ve Reels şakasız, sade.
# chat / opts / rows yardımcıları kart_uret.py'den gelir.

SORU1 = ["Elif hardly ever works out.", "Kaan works out three times a week.",
         "Selin works out every day.", "Bora works out regularly."]
SORU1_TABLO = ('<div class="card" style="padding:16px 34px"><table>'
               '<tr><td>Elif</td><td>every day</td></tr><tr><td>Kaan</td><td>three times a week</td></tr>'
               '<tr><td>Selin</td><td>once a week</td></tr><tr><td style="border:0">Bora</td><td style="border:0">never</td></tr>'
               '</table></div>')
SORU2 = ["doesn't mind going to the cinema alone.", "thinks science fiction films are boring.",
         "hardly ever watches a film.", "enjoys sitting near loud people."]
SORU2_METIN = ('<div class="card"><p class="en" style="font-size:36px">Hi, I\'m Deniz. I\'m really into science fiction films, '
               'and I watch one every weekend. I don\'t mind going to the cinema alone. '
               'However, I can\'t stand loud people behind me!</p></div>')

HAFTA = [
  {"kod": "01_paz_sayac", "seri": "sayac",
   "slaytlar": [
     {"grad": True, "html": '<div class="d" style="font-size:90px">LGS\'ye</div><div class="d big">217</div>'
        '<div class="d" style="font-size:90px">gün kaldı</div>'
        '<p class="lead">Tarih belli: <b style="color:#FFC93C">13 Haziran 2027, Pazar.</b><br>Takvimine şimdiden yaz.</p>'},
     {"html": '<h2 class="d">📅 Bu hafta ne var?</h2>' + rows(
        ("🔎", "Pzt · Günün kelimesi"), ("⚠️", "Sal · Tuzak"), ("📝", "Çar · LGS sorusu"),
        ("🔎", "Per · Günün kelimesi"), ("💊", "Cum · Hap bilgi"), ("📝", "Cmt · LGS sorusu"))},
     {"html": '<h2 class="d">🧮 Küçük bir hesap</h2>'
        '<div class="card"><p>Günde <b>10 dakika</b> × <b>217 gün</b></p>'
        '<p class="d" style="font-size:84px;color:#3B4BD8;margin-top:10px">= 36 saat İngilizce</p></div>'
        '<div class="tip"><span class="k">Hoca Nova:</span> Hafta sonunu dizi izleyerek geçirebilirsin. Ama günde 10 dakikanı bana ayır 😉</div>'},
   ],
   "story": {"gun": 217, "gorev": "Geçen haftanın kelimeleri: <b>trendy · terrific · unbearable</b>. Üçünün de anlamını söyleyebilir misin? 🤔"}},

  {"kod": "02_pzt_kelime", "seri": "kelime",
   "slaytlar": [
     {"html": '<div class="badge">Anlamını sahneden yakala</div><div class="d word" style="font-size:136px">ridiculous</div>'
        '<p class="lead">Anlamını söylemiyorum.<br>Sahneyi oku, sen bul! ➡️</p>', "nova": "Tahminini aklında tut 🤔"},
     {"html": chat(("Bora", "I can't do my homework. My cat ate my notebook! 🐱"),
                   ("Selin", "Bora, you don't have a cat."),
                   ("Bora", "It's… my neighbour's cat. 😅"),
                   ("Duru", "That's <b>ridiculous</b>, Bora!"))},
     {"html": '<div class="d word" style="font-size:136px">ridiculous</div><div class="d mean">= saçma, gülünç</div>'
        '<div class="card"><p>Olumsuz bir görüş bildirir.</p><p><b class="en">funny</b> (komik) ile karıştırma: '
        'Duru bahaneye gülmüyor, inanmıyor.</p></div>'},
     {"html": '<h2 class="d">✍️ Sıra sende</h2><div class="card"><p class="en">"Six hours of homework for one weekend? '
        'That\'s ______!"</p></div><p class="lead">Cevabını yorumlara yaz 👇</p>'},
   ],
   "story": {"gun": 216, "gorev": "Duyduğun en <b>ridiculous</b> bahane ne? Yaz bakalım, en iyileri paylaşıyoruz 👇"}},

  {"kod": "03_sal_tuzak", "seri": "tuzak",
   "slaytlar": [
     {"html": '<div class="d word" style="font-size:136px">hardly ever</div><h2 class="d">Çoğu öğrenci burada yanılıyor!</h2>'
        '<p class="lead">"Çok sık" mı, "neredeyse hiç" mi? ➡️</p>', "nova": "Önce sen tahmin et"},
     {"html": rows(("❌", "<b>hard</b> sözcüğüne benzediği için \"sıkı sıkı, çok\" sanılır."),
                   ("✅", "<b>hardly ever</b> = neredeyse hiç"),
                   ("❌", "<span class=\"en\">I don't hardly ever watch TV.</span>"),
                   ("✅", "<span class=\"en\">I hardly ever watch TV.</span>"))},
     {"html": '<h2 class="d">🎯 LGS\'de nasıl çıkar?</h2>'
        '<div class="card"><p class="en">"Selin hardly ever eats fast food."</p>'
        '<p>Selin fast food\'u çok seyrek yer. Fiil olumlu kalır, <b class="en">not</b> eklenmez.</p></div>'
        '<div class="tip"><span class="k">Sıralama:</span> always → usually → often → sometimes → rarely → hardly ever → never</div>'},
   ],
   "story": {"gun": 215, "html":
     '<div class="d" style="font-size:150px;line-height:1">10 Kasım</div>'
     '<p class="lead" style="font-size:56px;line-height:1.35">Cumhuriyetimizin kurucusu<br><b style="color:#FFC93C">Mustafa Kemal Atatürk\'ü</b><br>'
     'saygı, sevgi ve özlemle anıyoruz.</p>'}},

  {"kod": "04_car_soru", "seri": "soru",
   "slaytlar": [
     {"html": '<p class="stem">The table shows <b>how often</b> four friends work out.</p>' + SORU1_TABLO
        + '<p class="q">Which of the following is TRUE according to the table?</p>' + opts(SORU1),
      "nova": "⏱️ 30 saniye! Cevabın yorumlara 👇", "sik": True},
     {"sik": True, "html": '<h2 class="d">✅ Cevap: B</h2>' + opts(SORU1, "B")
        + '<div class="tip">every day ≠ <span class="k">hardly ever</span> · once a week ≠ <span class="k">every day</span> · '
          'never ≠ <span class="k">regularly</span><br>🎯 Tablodaki her satırı şıktaki sıklık sözcüğüyle eşleştir.</div>'},
   ],
   "story": {"gun": 214, "gorev": "Bugünün sorusu postta! Sen haftada kaç kez spor yapıyorsun? <span class=\"en\">Once? Twice? Never?</span> 🏃"}},

  {"kod": "05_per_kelime", "seri": "kelime",
   "slaytlar": [
     {"html": '<div class="badge">Anlamını sahneden yakala</div><div class="d word">snob</div>'
        '<p class="lead">Sahneyi oku, anlamı sen bul! ➡️</p>', "nova": "Tahminini aklında tut 🤔"},
     {"html": chat(("Bora", "Ege, come and eat simit with us!"),
                   ("Ege", "Simit? On the grass? I only eat at expensive restaurants."),
                   ("Selin", "Come on, Ege. Don't be a <b>snob</b>!"),
                   ("Ece", "Give him five minutes. He loves simit, really. 😄"))},
     {"html": '<div class="d word">snob</div><div class="d mean">= züppe, kendini beğenmiş</div>'
        '<div class="card"><p>Parası, kıyafeti ya da zevki yüzünden kendini başkalarından üstün gören kişi.</p>'
        '<p>Moda ve kıyafet metinlerinde karşına çıkabilir.</p></div>'},
     {"html": '<h2 class="d">✍️ Sıra sende</h2><div class="card"><p class="en">"He never talks to us because our clothes '
        'aren\'t expensive. He is such a ______!"</p></div><p class="lead">Cevabını yorumlara yaz 👇</p>'},
   ],
   "story": {"gun": 213, "gorev": "Simit mi, pahalı restoran mı? 🥯 Ege'yi ikna etmek için İngilizce tek cümle yaz 👇"}},

  {"kod": "06_cum_hap", "seri": "hap",
   "slaytlar": [
     {"html": '<div class="badge">30 saniyede dilbilgisi</div><h1 class="d">Beğeni<br><span class="hl">merdiveni</span></h1>'
        '<p class="lead">Hangisi daha çok sevmek? ➡️</p>'},
     {"html": rows(("😍", "<b>be crazy about</b>"),
                   ("😊", "<b>enjoy · be keen on · be fond of</b>"),
                   ("🙂", "<b>like</b>"),
                   ("😐", "<b>don't mind</b>"),
                   ("😕", "<b>dislike</b>"),
                   ("😖", "<b>hate · can't stand</b>"))},
     {"html": rows(("❌", "<span class=\"en\">I don't mind to wait.</span>"),
                   ("✅", "<span class=\"en\">I don't mind waiting.</span>"))
        + '<div class="tip"><span class="k">🎯 LGS:</span> Diyalogda kişinin tavrının derecesi sorulur. '
          '<span class="k">don\'t mind</span> kaba değildir: "benim için sorun değil."</div>'},
   ],
   "story": {"gun": 212, "gorev": "Hangisi doğru?<br><span class=\"en\">I enjoy to play chess.<br>I enjoy playing chess.</span>"}},

  {"kod": "07_cmt_soru", "seri": "soru",
   "slaytlar": [
     {"html": SORU2_METIN + '<p class="q">We can understand from the text that Deniz ______.</p>' + opts(SORU2),
      "nova": "⏱️ 30 saniye! Cevabın yorumlara 👇", "sik": True},
     {"sik": True, "html": '<h2 class="d">✅ Cevap: A</h2>' + opts(SORU2, "A")
        + '<div class="tip"><span class="k">really into</span> → sıkıcı bulmuyor · <span class="k">every weekend</span> → sık izliyor · '
          '<span class="k">can\'t stand</span> → hoşlanmıyor<br>🎯 Metindeki kalıbı şıktaki anlamla eşleştir.</div>'},
   ],
   "story": {"gun": 211, "gorev": "Haftanın 5 kelimesi: <b>ridiculous · hardly ever · snob · don't mind · be into</b>. Kaçını hatırladın? 🏆"}},
]
