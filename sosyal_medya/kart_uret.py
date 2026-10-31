#!/usr/bin/env python3
"""Haftalık Instagram kartları: hafta dosyası (.py) → PNG (post 1080×1350, story 1080×1920).

Kullanım:  python3 sosyal_medya/kart_uret.py sosyal_medya/haftalik/2026-11-01_07.py
Çıktı:     hafta dosyasıyla aynı adlı klasör, gün gün alt klasörler (…/2026-11-01_07/2 Pazartesi (2 Kasım)/)
           + her güne aciklamalar.txt (haftanın .md dosyasından)
Gereken:   Google Chrome (headless ekran görüntüsü için). Yazı tipleri sosyal_medya/fonts/ içinde.
"""
import os, re, runpy, subprocess, sys, tempfile, shutil
from concurrent.futures import ThreadPoolExecutor

KOK = os.path.dirname(os.path.abspath(__file__))
CHROME = os.environ.get("CHROME", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
HESAP = "@lgsingilizce"

# Hoca Nova (app/src/owlArt.js ile aynı çizim)
OWL = open(os.path.join(KOK, "..", "app", "src", "owlArt.js"), encoding="utf-8").read()
OWL_DEFS = re.search(r'OWL_DEFS = "(.*?)"\n', OWL).group(1).replace('\\"', '"')
OWL_BODY = re.search(r'export const OWL = "(.*?)"\n', OWL).group(1).replace('\\"', '"')

def owl(size, bg=True):
    zemin = '<rect width="100" height="100" rx="26" fill="url(#novaBg)"/>' if bg else ""
    return f'<svg width="{size}" height="{size}" viewBox="0 0 100 100">{OWL_DEFS}{zemin}{OWL_BODY}</svg>'

# Seri renkleri ve etiketleri
SERI = {
    "sayac": ("#3B4BD8", "⏳ GERİ SAYIM"),
    "kelime": ("#1E9E77", "🔎 GÜNÜN KELİMESİ"),
    "tuzak": ("#F0614A", "⚠️ TUZAK"),
    "soru": ("#3B4BD8", "📝 LGS SORUSU"),
    "hap": ("#C98A10", "💊 HAP BİLGİ"),
}
KARAKTER = {"Elif": "#D9467A", "Kaan": "#E07B12", "Bora": "#3B4BD8", "Duru": "#1E9E77",
            "Selin": "#7A4FD6", "Ece": "#C0392B"}

CSS = """
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:%(w)dpx;height:%(h)dpx;overflow:hidden}
body{font-family:"Nunito Sans",sans-serif;background:#F1F0F7;color:#1B1E3A;position:relative;font-weight:700}
.d{font-family:"Bricolage Grotesque",sans-serif;font-weight:800;letter-spacing:-.02em}
.blob{position:absolute;border-radius:50%%;filter:blur(2px);opacity:.16}
.top{position:absolute;left:70px;right:70px;top:64px;display:flex;justify-content:space-between;align-items:center}
.chip{color:#fff;font-size:30px;font-weight:800;padding:12px 26px;border-radius:999px;letter-spacing:.04em}
.acc{font-size:30px;color:#62668A;font-weight:800}
.main{position:absolute;left:70px;right:70px;top:170px;bottom:190px;display:flex;flex-direction:column;justify-content:center;gap:34px}
.foot{position:absolute;left:70px;right:70px;bottom:56px;display:flex;align-items:center;gap:22px}
.foot .say{margin-left:auto;font-size:30px;color:#62668A;font-weight:800}
.foot .nova{font-size:30px;color:#1B1E3A;font-weight:700;max-width:720px;line-height:1.25}
h1{font-size:96px;line-height:1.02}
h2{font-size:66px;line-height:1.08}
.lead{font-size:44px;line-height:1.35;color:#3A3E66}
.card{background:#fff;border-radius:36px;padding:44px 50px;box-shadow:0 2px 3px rgba(27,30,58,.06),0 16px 40px rgba(27,30,58,.10)}
.card p{font-size:42px;line-height:1.38}
.card p+p{margin-top:18px}
.row{display:flex;gap:22px;align-items:flex-start;font-size:42px;line-height:1.35}
.row+.row{margin-top:20px}
.ic{flex:none;width:58px;text-align:center}
.word{font-size:150px;line-height:1;color:var(--c)}
.mean{font-size:62px;line-height:1.15}
.badge{display:inline-block;background:#FFC93C;color:#1B1E3A;font-size:32px;font-weight:800;padding:10px 24px;border-radius:999px}
.en{font-style:italic}
b,.hl{color:var(--c)}
.chat{display:flex;flex-direction:column;gap:22px}
.msg{background:#fff;border-radius:30px 30px 30px 8px;padding:24px 34px;max-width:880px;box-shadow:0 2px 3px rgba(27,30,58,.06),0 10px 26px rgba(27,30,58,.08)}
.msg.r{align-self:flex-end;border-radius:30px 30px 8px 30px}
.msg .n{font-size:30px;font-weight:800;margin-bottom:4px}
.msg .t{font-size:42px;line-height:1.3}
.msg .t b{background:#FFF1C2;color:#1B1E3A;padding:0 8px;border-radius:8px}
table{border-collapse:collapse;width:100%%;font-size:38px}
td{padding:14px 20px;border-bottom:2px solid #DCDCEB}
td:last-child{text-align:right;font-family:"Bricolage Grotesque";font-weight:800;font-size:44px;color:var(--c)}
.stem{font-size:40px;line-height:1.35}
.q{font-size:42px;font-weight:800;line-height:1.3}
.opts{display:flex;flex-direction:column;gap:16px}
.opt{background:#fff;border:3px solid #DCDCEB;border-radius:24px;padding:18px 26px;font-size:37px;line-height:1.3;display:flex;gap:20px;align-items:center}
.opt i{font-style:normal;flex:none;width:58px;height:58px;border-radius:50%%;background:#E3E6FC;color:#3B4BD8;display:flex;align-items:center;justify-content:center;font-family:"Bricolage Grotesque";font-weight:800;font-size:32px}
.opt.ok{background:#1E9E77;border-color:#1E9E77;color:#fff}
.opt.ok i{background:#fff;color:#1E9E77}
.opt.no{opacity:.45}
.tip{background:#1B1E3A;color:#fff;border-radius:30px;padding:30px 40px;font-size:38px;line-height:1.38}
.tip .k{color:#FFC93C;font-weight:800}
.grad{background:linear-gradient(160deg,#4A5AE8,#262B86);color:#fff}
.grad .acc,.grad .foot .say{color:#C9CEFF}
.grad .lead{color:#E3E6FC}
.grad .foot .nova{color:#fff}
.big{font-size:330px;line-height:.9;color:#FFC93C}
.sik{gap:22px}.sik .stem{font-size:34px}.sik table{font-size:32px}.sik td{padding:10px 18px}.sik td:last-child{font-size:36px}.sik .q{font-size:36px}.sik .opt{font-size:32px;padding:12px 22px}.sik .opt i{width:48px;height:48px;font-size:26px}.sik .tip{font-size:34px}
"""

def sayfa(icerik, w, h, renk, cls=""):
    fonts = "file://" + os.path.join(KOK, "fonts", "fonts.css")
    return (f'<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="{fonts}">'
            f'<style>{CSS % {"w": w, "h": h}}</style></head>'
            f'<body class="{cls}" style="--c:{renk}">'
            f'<div class="blob" style="width:620px;height:620px;background:{renk};right:-260px;top:-240px"></div>'
            f'<div class="blob" style="width:520px;height:520px;background:#FFC93C;left:-260px;bottom:-220px"></div>'
            f'{icerik}</body></html>')

def post_html(seri, slayt, no, toplam):
    renk, etiket = SERI[seri]
    grad = slayt.get("grad")
    nova = slayt.get("nova", "Kaydet, sınavdan önce bir daha bak 📌" if no == toplam else "")
    say = f"{no}/{toplam}" + ("  ➡️" if no < toplam else "")
    ic = (f'<div class="top"><span class="chip" style="background:{"#FFC93C;color:#1B1E3A" if grad else renk}">{etiket}</span>'
          f'<span class="acc">{HESAP}</span></div>'
          f'<div class="main{" sik" if slayt.get("sik") else ""}">{slayt["html"]}</div>'
          f'<div class="foot">{owl(96)}<span class="nova">{nova}</span><span class="say">{say}</span></div>')
    return sayfa(ic, 1080, 1350, renk, "grad" if grad else "")

def story_html(gun, gorev, ek=""):
    ic = (f'<div class="top" style="top:250px"><span class="chip" style="background:#FFC93C;color:#1B1E3A">⏳ GERİ SAYIM</span>'
          f'<span class="acc">{HESAP}</span></div>'
          f'<div class="main" style="top:380px;bottom:420px;gap:40px">'
          f'<div class="d" style="font-size:80px">LGS\'ye</div>'
          f'<div class="d big">{gun}</div>'
          f'<div class="d" style="font-size:80px;margin-top:-10px">gün kaldı</div>'
          f'<div class="card" style="color:#1B1E3A;margin-top:30px"><div class="badge" style="margin-bottom:18px">BUGÜNÜN GÖREVİ</div>'
          f'<p>{gorev}</p>{ek}</div></div>'
          f'<div class="foot" style="bottom:330px">{owl(120, bg=False)}<span class="nova">Hoca Nova: Küçük adım, her gün. 💪</span></div>')
    return sayfa(ic, 1080, 1920, "#3B4BD8", "grad")

GUNLER = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"]
AYLAR = ["", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]

def gun_klasoru(hafta_klasoru, kod):
    """…/2026-11-01_07 + '02_pzt…' → …/2026-11-01_07/2 Pazartesi (2 Kasım)"""
    import datetime
    bas = datetime.date.fromisoformat(os.path.basename(hafta_klasoru)[:10])
    sira = int(kod[:2])
    g = bas + datetime.timedelta(days=sira - 1)
    yol = os.path.join(hafta_klasoru, f"{sira} {GUNLER[g.weekday()]} ({g.day} {AYLAR[g.month]})")
    os.makedirs(yol, exist_ok=True)
    return yol

def aciklama_yaz(hafta_klasoru):
    """Haftanın .md dosyasını günlere böler → her gün klasörüne aciklamalar.txt.
    .md düzeni: '## <gün başlığı>' bölümleri, sonda '# Reels' tablosu (satır başına bir gün)."""
    md_yolu = hafta_klasoru + ".md"
    if not os.path.exists(md_yolu):
        return 0
    md = open(md_yolu, encoding="utf-8").read()
    govde, _, reels = md.partition("\n# Reels")
    m = re.search(r"Ortak hashtag: `(.*?)`", md)
    hashtag = m.group(1) if m else ""
    reel_satir = [l for l in reels.splitlines() if l.startswith("| ") and "_reels.mp4" in l]
    bolumler = govde.split("\n## ")[1:]
    for i, b in enumerate(bolumler, 1):
        metin = "## " + b.strip().rstrip("-").strip() + "\n"
        if i <= len(reel_satir):
            metin += ("\n---\n\n## REELS açıklaması\n" + reel_satir[i - 1].split("|")[4].strip() + "\n\n" + hashtag +
                      "\n\nSes: Videoda kendi fon müziğimiz var; Instagram'da ayrıca ses ekleme.\n")
        open(os.path.join(gun_klasoru(hafta_klasoru, f"{i:02d}"), "aciklamalar.txt"), "w", encoding="utf-8").write(metin)
    return len(bolumler)

def ekran_goruntusu(is_):
    html, png, w, h = is_
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
                    f"--window-size={w},{h}", "--virtual-time-budget=2500", f"--screenshot={png}", "file://" + html],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

# Hafta dosyalarında kullanılan küçük yardımcılar
def chat(*satirlar):
    out = []
    for i, (ad, metin) in enumerate(satirlar):
        out.append(f'<div class="msg{" r" if i % 2 else ""}"><div class="n" style="color:{KARAKTER.get(ad, "#3B4BD8")}">{ad}</div>'
                   f'<div class="t en">{metin}</div></div>')
    return '<div class="chat">' + "".join(out) + "</div>"

def opts(secenekler, dogru=None):
    out = []
    for i, s in enumerate(secenekler):
        harf = "ABCD"[i]
        cls = "" if dogru is None else (" ok" if harf == dogru else " no")
        out.append(f'<div class="opt{cls}"><i>{harf}</i><span class="en">{s}</span></div>')
    return '<div class="opts">' + "".join(out) + "</div>"

def rows(*satirlar):
    return '<div class="card">' + "".join(f'<div class="row"><span class="ic">{ic}</span><span>{t}</span></div>' for ic, t in satirlar) + "</div>"

def main():
    hafta = os.path.abspath(sys.argv[1])
    veri = runpy.run_path(hafta, init_globals={"chat": chat, "opts": opts, "rows": rows})
    cikti = os.path.splitext(hafta)[0]
    os.makedirs(cikti, exist_ok=True)
    gecici = tempfile.mkdtemp()
    isler = []
    for g in veri["HAFTA"]:
        toplam = len(g["slaytlar"])
        for no, s in enumerate(g["slaytlar"], 1):
            ad = f'{g["kod"]}_{no}'
            yol = os.path.join(gecici, ad + ".html")
            open(yol, "w", encoding="utf-8").write(post_html(g["seri"], s, no, toplam))
            isler.append((yol, os.path.join(gun_klasoru(cikti, g["kod"]), ad + ".png"), 1080, 1350))
        ad = f'{g["kod"][:6]}_story'
        yol = os.path.join(gecici, ad + ".html")
        open(yol, "w", encoding="utf-8").write(story_html(g["story"]["gun"], g["story"]["gorev"], g["story"].get("ek", "")))
        isler.append((yol, os.path.join(gun_klasoru(cikti, g["kod"]), ad + ".png"), 1080, 1920))
    with ThreadPoolExecutor(4) as ex:
        list(ex.map(ekran_goruntusu, isler))
    shutil.rmtree(gecici)
    print(f"{len(isler)} görsel, {aciklama_yaz(cikti)} açıklama dosyası → {cikti}")

if __name__ == "__main__":
    main()
