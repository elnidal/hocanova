# 1–7 Kasım 2026 · Ünite 2 Teen Life · metinler: 2026-11-01_07.md
# Geri sayım 12 Haziran 2027'ye göre (MEB tarihi açıklanınca güncelle).
# chat / opts / rows yardımcıları kart_uret.py'den gelir.

HAFTA = [
  {"kod": "01_paz_sayac", "seri": "sayac",
   "slaytlar": [
     {"grad": True, "html": '<div class="d" style="font-size:90px">LGS\'ye</div><div class="d big">223</div>'
        '<div class="d" style="font-size:90px">gün kaldı</div>'
        '<p class="lead">Kasım başladı. Paniğe gerek yok,<br>plana ihtiyaç var.</p>'},
     {"html": '<h2 class="d">📅 Bu hafta ne var?</h2>' + rows(
        ("🔎", "Pzt · Günün kelimesi"), ("⚠️", "Sal · Tuzak"), ("📝", "Çar · LGS sorusu"),
        ("🔎", "Per · Günün kelimesi"), ("💊", "Cum · Hap bilgi"), ("📝", "Cmt · LGS sorusu"))},
     {"html": '<h2 class="d">🧮 Küçük bir hesap</h2>'
        '<div class="card"><p>Günde <b>10 dakika</b> × <b>223 gün</b></p>'
        '<p class="d" style="font-size:84px;color:#3B4BD8;margin-top:10px">= 37 saat İngilizce</p></div>'
        '<div class="tip"><span class="k">Hoca Nova:</span> Bir dizi sezonu kadar. Ama bu sezonun finali seninle bitiyor 😉</div>'},
   ],
   "story": {"gun": 223, "gorev": "Ünite 1'den 5 kelimeyi hatırla. Aklına hiç gelmiyorsa bu da bir bilgi 😄"}},

  {"kod": "02_pzt_kelime", "seri": "kelime",
   "slaytlar": [
     {"html": '<div class="badge">Anlamını sahneden yakala</div><div class="d word">trendy</div>'
        '<p class="lead">Anlamını söylemiyorum.<br>Sahneyi oku, sen bul! ➡️</p>', "nova": "Tahminini aklında tut 🤔"},
     {"html": chat(("Elif", "Look at Duru's new jacket! Everyone is wearing it this year."),
                   ("Kaan", "Yeah, it's so <b>trendy</b>."),
                   ("Bora", "My jacket is from 2019. Is it <b>trendy</b> too? 😅"),
                   ("Duru", "Maybe in 2019, Bora."))},
     {"html": '<div class="d word">trendy</div><div class="d mean">= moda olan, popüler</div>'
        '<div><span class="badge">📌 LGS ve TEOG\'da 4 kez çıktı</span></div>'
        '<div class="card"><p>Karşıtı: <b class="en">old-fashioned</b> (modası geçmiş)</p></div>'},
     {"html": '<h2 class="d">✍️ Sıra sende</h2><div class="card"><p class="en">"Everybody at school wants these trainers. '
        'They are very ______ this year."</p></div><p class="lead">Cevabını yorumlara yaz 👇</p>'},
   ],
   "story": {"gun": 222, "gorev": "<b>trendy</b> kelimesini bir cümlede kullan. Bora'nın ceketi trendy mi? 👍 / 👎"}},

  {"kod": "03_sal_tuzak", "seri": "tuzak",
   "slaytlar": [
     {"html": '<div class="d word">terrific</div><h2 class="d">Çoğu öğrenci burada yanılıyor!</h2>'
        '<p class="lead">"Korkunç" mu, "harika" mı? ➡️</p>', "nova": "Önce sen tahmin et 🤔"},
     {"html": rows(("❌", "<b>terror</b> ve <b>terrible</b>'a benzediği için \"korkunç\" sanılır."),
                   ("✅", "<b>terrific</b> = müthiş, harika 😊"),
                   ("✅", "<b>terrible</b> = berbat 😖"))},
     {"html": '<h2 class="d">🎯 LGS\'de nasıl çıkar?</h2>'
        '<div class="card"><p class="en">"The concert was <b>terrific</b>! I want to go again."</p>'
        '<p>Tekrar gitmek isteyen kişi memnundur.</p></div>'
        '<div class="tip"><span class="k">🧠 Hafıza kancası:</span> terrific gülümser, terrible surat asar.</div>'},
   ],
   "story": {"gun": 221, "gorev": "Hızlı test: <span class=\"en\">\"The film was terrific!\"</span> Kişi filmi beğendi mi? EVET / HAYIR"}},

  {"kod": "04_car_soru", "seri": "soru",
   "slaytlar": [
     {"html": '<p class="stem">Ece asked <b>20 students</b> in her class about their free-time activities.</p>'
        '<div class="card" style="padding:16px 34px"><table>'
        '<tr><td>hanging out with friends</td><td>16</td></tr><tr><td>playing online games</td><td>10</td></tr>'
        '<tr><td>reading books</td><td>3</td></tr><tr><td style="border:0">doing extreme sports</td><td style="border:0">0</td></tr>'
        '</table></div><p class="q">Which of the following is TRUE according to the survey?</p>'
        + opts(["Half of the students read books.", "A few students do extreme sports.",
                "Most students enjoy hanging out with friends.", "None of the students play online games."]),
      "nova": "⏱️ 30 saniye! Cevabın yorumlara 👇", "sik": True},
     {"sik": True, "html": '<h2 class="d">✅ Cevap: C</h2>'
        + opts(["Half of the students read books.", "A few students do extreme sports.",
                "Most students enjoy hanging out with friends.", "None of the students play online games."], "C")
        + '<div class="tip">20\'de 16 → <span class="k">most</span> · 3 → <span class="k">a few</span> · '
          '0 → <span class="k">none</span> · 10 → <span class="k">half</span><br>🎯 Önce rakamı kelimeye çevir, sonra şıklara bak.</div>'},
   ],
   "story": {"gun": 220, "gorev": "Bugünün sorusu postta! Cevabın A mı, B mi, C mi, D mi? 📊"}},

  {"kod": "05_per_kelime", "seri": "kelime",
   "slaytlar": [
     {"html": '<div class="badge">Anlamını sahneden yakala</div><div class="d word" style="font-size:132px">unbearable</div>'
        '<p class="lead">Sahneyi oku, anlamı sen bul! ➡️</p>', "nova": "Tahminini aklında tut 🤔"},
     {"html": chat(("Elif", "The music next door is so loud. I can't sleep!"),
                   ("Selin", "Again?"),
                   ("Elif", "Every night until 1 a.m. It's <b>unbearable</b>."),
                   ("Duru", "Come to my house. Fıstık is very quiet… sometimes. 🐶"))},
     {"html": '<div class="d word" style="font-size:132px">unbearable</div><div class="d mean">= katlanılmaz, dayanılmaz</div>'
        '<div><span class="badge">📌 LGS ve TEOG\'da 4 kez çıktı</span></div>'
        '<div class="card"><p><b>un</b> (değil) + <b>bear</b> (katlanmak) + <b>able</b> (-ebilir)</p>'
        '<p>Kardeşi: <b class="en">I can\'t stand it.</b></p></div>'},
     {"html": '<h2 class="d">✍️ Sıra sende</h2><div class="card"><p class="en">"It is 40 degrees today and there is no air '
        'conditioning. The heat is ______."</p></div><p class="lead">Cevabını yorumlara yaz 👇</p>'},
   ],
   "story": {"gun": 219, "gorev": "Senin için en <b>unbearable</b> şey ne? İngilizce yaz, en iyileri paylaşıyoruz 👇"}},

  {"kod": "06_cum_hap", "seri": "hap",
   "slaytlar": [
     {"html": '<div class="badge">30 saniyede dilbilgisi</div><h1 class="d">-ing veren,<br><span class="hl">-ed</span> hisseden</h1>'
        '<p class="lead">Sıkıcı mısın, sıkılmış mı? ➡️</p>'},
     {"html": rows(("🎬", "The film is <b>boring</b>. → I am <b>bored</b>."),
                   ("🔊", "The noise is <b>annoying</b>. → I am <b>annoyed</b>."),
                   ("🎢", "The ride is <b>exciting</b>. → I am <b>excited</b>."))},
     {"html": rows(("❌", "<span class=\"en\">I am boring.</span> → \"Ben sıkıcı biriyim\" 😅"),
                   ("✅", "<span class=\"en\">I am bored.</span> → \"Sıkıldım.\""))
        + '<div class="tip"><span class="k">🎯 LGS:</span> Kişinin duygusu sorulursa <span class="k">-ed</span> gelir.</div>'},
   ],
   "story": {"gun": 218, "gorev": "Hangisi doğru?<br><span class=\"en\">I am interesting in music.<br>I am interested in music.</span>"}},

  {"kod": "07_cmt_soru", "seri": "soru",
   "slaytlar": [
     {"html": chat(("Duru", "Do you like heavy metal music?"),
                   ("Selin", "______ It's too loud for me. I prefer jazz."))
        + '<p class="q">Which of the following completes the dialogue?</p>'
        + opts(["Of course, it's my favourite genre.", "Yes, I'm crazy about it.",
                "Sure, I listen to it every day.", "Not really. I can't stand it."]),
      "nova": "⏱️ 30 saniye! Cevabın yorumlara 👇"},
     {"html": '<h2 class="d">✅ Cevap: D</h2>'
        + opts(["Of course, it's my favourite genre.", "Yes, I'm crazy about it.",
                "Sure, I listen to it every day.", "Not really. I can't stand it."], "D")
        + '<div class="tip">İpucu boşluktan <span class="k">sonra</span>: "too loud for me" olumsuz bir görüş. '
          '<span class="k">be crazy about</span> = bayılmak!</div>'},
   ],
   "story": {"gun": 217, "gorev": "Haftanın 5 kelimesi: <b>trendy · terrific · unbearable · bored · can't stand</b>. Kaçını hatırladın? 🏆"}},
]
