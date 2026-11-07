# 8–14 Kasım 2026 Reels · aynı günün karuseliyle aynı konu (Reels kanca, karusel ayrıntı)
# Zamanlar saniye; el() zamanı sahnenin başına göre. Yardımcılar reel_uret.py'den gelir.
# 03_sal 10 Kasım'a denk gelir: şakasız. Yayınlanıp yayınlanmayacağına Murat karar verir.

def soru_tablo():
    return ('<div class="card" style="padding:16px 34px"><table>'
            '<tr><td>Elif</td><td>every day</td></tr><tr><td>Kaan</td><td>three times a week</td></tr>'
            '<tr><td>Selin</td><td>once a week</td></tr><tr><td style="border:0">Bora</td><td style="border:0">never</td></tr>'
            '</table></div>')

REELS = [
  {"kod": "01_paz", "seri": "sayac", "sahneler": [
    sahne(0, 4.5,
      el(0.1, '<div class="d" style="font-size:96px">LGS\'ye</div>'),
      sayac(0.3, 2.6, 365, 217),
      el(2.9, '<div class="d" style="font-size:96px">gün kaldı</div>', snd="ding"),
      grad=True),
    sahne(4.5, 10,
      el(0.1, '<h2 class="d">📅 Tarih belli:</h2>'),
      el(0.6, '<div class="d" style="font-size:110px;line-height:1.05;color:#3B4BD8">13 Haziran 2027</div>', fx="zoom", snd="ding"),
      el(1.8, '<div class="card"><p style="font-size:52px">Günde <b>10 dakika</b> × <b>217 gün</b><br>= <b>36 saat İngilizce</b></p></div>', snd="pop"),
      el(3.4, '<div class="tip"><span class="k">Hoca Nova:</span> Takvimine şimdiden yaz 😉</div>')),
    sahne(10, 16,
      el(0.1, '<h2 class="d">📅 Bu hafta her gün:</h2>'),
      el(0.6, '<div class="row"><span class="ic">🔎</span><span>Günün kelimesi</span></div>', snd="pop"),
      el(1.2, '<div class="row"><span class="ic">⚠️</span><span>Tuzak bilgiler</span></div>', snd="pop"),
      el(1.8, '<div class="row"><span class="ic">📝</span><span>LGS soruları</span></div>', snd="pop"),
      el(2.4, '<div class="row"><span class="ic">💊</span><span>30 saniyede hap bilgi</span></div>', snd="pop")),
    kapanis(16, 217, "217 gün, her gün 1 adım 💪"),
  ]},

  {"kod": "02_pzt", "seri": "kelime", "sahneler": [
    sahne(0, 3.5,
      el(0.1, '<span class="badge">🤔 Anlamını tahmin et!</span>'),
      el(0.5, '<div class="d word" style="font-size:150px">ridiculous</div>', fx="zoom", snd="pop"),
      el(1.3, '<p class="lead">Sahneyi izle, anlamı sen bul.</p>')),
    sahne(3.5, 11.5,
      chat_reel(0.2, 1.7, ("Bora", "I can't do my homework. My cat ate my notebook! 🐱"),
                          ("Selin", "Bora, you don't have a cat."),
                          ("Bora", "It's… my neighbour's cat. 😅"),
                          ("Duru", "That's <b>ridiculous</b>, Bora!"))),
    sahne(11.5, 15,
      el(0.1, '<h2 class="d">ridiculous ne demek?</h2>'),
      geri_say(0.3, 3), cls="ctr"),
    sahne(15, 20.5,
      el(0.1, '<div class="d word" style="font-size:150px">ridiculous</div>'),
      el(0.4, '<div class="d mean" style="font-size:76px">= saçma, gülünç</div>', fx="zoom", snd="ding"),
      el(1.6, '<div class="card"><p><b class="en">funny</b> (komik) ile karıştırma: Duru bahaneye gülmüyor, inanmıyor.</p></div>')),
    kapanis(20.5, 216, "Doğru tahmin ettin mi? 👇"),
  ]},

  {"kod": "03_sal", "seri": "tuzak", "sahneler": [
    sahne(0, 3.2,
      el(0.1, '<h2 class="d">⚠️ Çoğu öğrenci burada yanılıyor</h2>'),
      el(0.7, '<div class="d word" style="font-size:150px">hardly ever</div>', fx="zoom", snd="pop")),
    sahne(3.2, 8.5,
      el(0.2, '<div class="card"><p style="font-size:58px">❌ hardly ever = <span data-x="2.6" data-a="0">çok sık</span></p></div>', snd="pop"),
      el(3.0, '<div class="card"><p style="font-size:58px">✅ hardly ever = <b>neredeyse hiç</b></p></div>', fx="zoom", snd="ding")),
    sahne(8.5, 14,
      el(0.1, '<h2 class="d">🎯 LGS\'de böyle çıkar:</h2>'),
      el(0.6, '<div class="card"><p class="en" style="font-size:50px">"Selin <b>hardly ever</b> eats fast food."</p></div>'),
      el(2.4, '<p class="lead">Selin fast food\'u <b>çok seyrek</b> yer.</p>', snd="pop")),
    sahne(14, 18,
      el(0.1, '<div class="card"><p style="font-size:54px">❌ I don\'t hardly ever watch TV.</p></div>', snd="pop"),
      el(0.9, '<div class="card"><p style="font-size:54px">✅ I <b>hardly ever</b> watch TV.</p></div>', snd="pop"),
      el(1.8, '<div class="tip"><span class="k">🧠</span> Anlam zaten olumsuz, <b>not</b> eklenmez.</div>')),
    kapanis(18, 215, "Kaydet 📌"),
  ]},

  {"kod": "04_car", "seri": "soru", "sahneler": [
    sahne(0, 16,
      el(0.1, '<p class="stem">The table shows <b>how often</b> four friends work out.</p>'),
      el(0.5, soru_tablo()),
      el(1.2, '<p class="q">Which of the following is TRUE according to the table?</p>'),
      opts_reel(["Elif hardly ever works out.", "Kaan works out three times a week.",
                 "Selin works out every day.", "Bora works out regularly."], "B", 13.2, 1.8),
      el(3.2, halka(3.2, 10)),
      cls="sik"),
    sahne(16, 21.5,
      el(0.1, '<h2 class="d">✅ Cevap: B</h2>', snd="pop"),
      el(0.6, '<div class="tip" style="font-size:46px">every day ≠ <span class="k">hardly ever</span><br>once a week ≠ <span class="k">every day</span><br>'
              'never ≠ <span class="k">regularly</span></div>'),
      el(2.2, '<p class="lead">🎯 Tablodaki her satırı şıktaki sıklık sözcüğüyle eşleştir.</p>')),
    kapanis(21.5, 214, "Sen kaç saniyede buldun? 👇"),
  ]},

  {"kod": "05_per", "seri": "kelime", "sahneler": [
    sahne(0, 3.5,
      el(0.1, '<span class="badge">🤔 Anlamını tahmin et!</span>'),
      el(0.5, '<div class="d word">snob</div>', fx="zoom", snd="pop"),
      el(1.3, '<p class="lead">Sahneyi izle, anlamı sen bul.</p>')),
    sahne(3.5, 11.5,
      chat_reel(0.2, 1.7, ("Bora", "Ege, come and eat simit with us!"),
                          ("Ege", "Simit? On the grass? I only eat at expensive restaurants."),
                          ("Selin", "Come on, Ege. Don't be a <b>snob</b>!"),
                          ("Ece", "Give him five minutes. He loves simit, really. 😄"))),
    sahne(11.5, 15,
      el(0.1, '<h2 class="d">snob ne demek?</h2>'),
      geri_say(0.3, 3), cls="ctr"),
    sahne(15, 20.5,
      el(0.1, '<div class="d word">snob</div>'),
      el(0.4, '<div class="d mean" style="font-size:72px">= züppe, kendini beğenmiş</div>', fx="zoom", snd="ding"),
      el(1.6, '<div class="card"><p>Parası, kıyafeti ya da zevki yüzünden kendini üstün gören kişi.</p></div>')),
    kapanis(20.5, 213, "Doğru tahmin ettin mi? 👇"),
  ]},

  {"kod": "06_cum", "seri": "hap", "sahneler": [
    sahne(0, 3.5,
      el(0.1, '<span class="badge">💊 30 saniyede hap bilgi</span>'),
      el(0.5, '<h1 class="d" style="font-size:120px">Beğeni<br><span class="hl">merdiveni</span></h1>', fx="zoom", snd="pop")),
    sahne(3.5, 11.5,
      el(0.2, '<div class="row"><span class="ic">😖</span><span><b>hate · can\'t stand</b></span></div>', snd="pop"),
      el(1.3, '<div class="row"><span class="ic">😕</span><span><b>dislike</b></span></div>', snd="pop"),
      el(2.4, '<div class="row"><span class="ic">😐</span><span><b>don\'t mind</b></span></div>', snd="pop"),
      el(3.5, '<div class="row"><span class="ic">🙂</span><span><b>like</b></span></div>', snd="pop"),
      el(4.6, '<div class="row"><span class="ic">😊</span><span><b>enjoy · be keen on · be fond of</b></span></div>', snd="pop"),
      el(5.7, '<div class="row"><span class="ic">😍</span><span><b>be crazy about</b></span></div>', fx="zoom", snd="ding")),
    sahne(11.5, 17,
      el(0.2, '<div class="card"><p style="font-size:54px"><span data-x="2.2" data-a="0">❌ I don\'t mind to wait.</span></p></div>', snd="pop"),
      el(2.6, '<div class="card"><p style="font-size:54px">✅ I don\'t mind <b>waiting</b>.</p></div>', fx="zoom", snd="ding"),
      el(3.6, '<div class="tip"><span class="k">🎯 LGS:</span> don\'t mind kaba değil: "benim için sorun değil."</div>')),
    kapanis(17, 212, "Merdivene arkadaşını da çağır 📤"),
  ]},

  {"kod": "07_cmt", "seri": "soru", "sahneler": [
    sahne(0, 17,
      el(0.1, '<div class="card"><p class="en" style="font-size:36px">Hi, I\'m Deniz. I\'m really into science fiction films, '
              'and I watch one every weekend. I don\'t mind going to the cinema alone. However, I can\'t stand loud people behind me!</p></div>'),
      el(1.2, '<p class="q">We can understand from the text that Deniz ______.</p>'),
      opts_reel(["doesn't mind going to the cinema alone.", "thinks science fiction films are boring.",
                 "hardly ever watches a film.", "enjoys sitting near loud people."], "A", 14.2, 1.8),
      el(3.2, halka(3.2, 11)),
      cls="sik"),
    sahne(17, 22.5,
      el(0.1, '<h2 class="d">✅ Cevap: A</h2>', snd="pop"),
      el(0.6, '<div class="tip" style="font-size:46px"><span class="k">really into</span> → sıkıcı bulmuyor<br><span class="k">every weekend</span> → sık izliyor<br>'
              '<span class="k">can\'t stand</span> → hoşlanmıyor</div>'),
      el(2.2, '<p class="lead">🎯 Metindeki kalıbı şıktaki anlamla eşleştir.</p>')),
    kapanis(22.5, 211, "Sen hangi şıkkı seçtin? 👇"),
  ]},
]
