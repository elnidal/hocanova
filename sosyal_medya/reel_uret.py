#!/usr/bin/env python3
"""Haftalık Reels: hafta reels dosyası (.py) → MP4 (1080×1920, 30 fps, efekt sesli).

Kullanım:  .venv/bin/python sosyal_medya/reel_uret.py sosyal_medya/haftalik/2026-11-01_07_reels.py [kod …]
Çıktı:     …/2026-11-01_07/<gün klasörü>/<kod>_reels.mp4  (kod verilirse yalnız o günler)
Gereken:   playwright (sistemdeki Chrome kullanılır), ffmpeg.
Tasarım kart_uret.py ile ortak; fon müziği ses/fon_muzik.m4a (kendi sentezimiz, telifsiz).
"""
import os, runpy, subprocess, sys, shutil, tempfile
from multiprocessing import Pool
from kart_uret import CSS, SERI, KARAKTER, KOK, HESAP, owl, gun_klasoru, aciklama_yaz

FPS = 30

REEL_CSS = """
.scene{position:absolute;left:70px;right:140px;top:300px;bottom:470px;display:none;flex-direction:column;justify-content:center;gap:40px}
.top{top:190px;right:140px}
#bar{position:absolute;left:0;top:0;height:10px;background:var(--c)}
.word{font-size:180px}
.strike{opacity:.45;text-decoration:line-through;text-decoration-color:#F0614A;text-decoration-thickness:8px}
.cdn{font-family:"Bricolage Grotesque";font-weight:800;font-size:300px;line-height:1;color:var(--c);text-align:center}
.ring{position:relative;width:170px;height:170px;align-self:center}
.ring .num{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:"Bricolage Grotesque";font-weight:800;font-size:76px}
.ctr{text-align:center;align-items:center}
.opt.no{opacity:.4!important}.strike{opacity:.45!important}
.scene .card p{font-size:50px}.scene .row{font-size:58px}.scene .lead{font-size:52px}.scene .msg .t{font-size:48px}.scene .tip{font-size:44px}
.sik .msg .t{font-size:40px}.sik .card p{font-size:40px}.ring{margin:0 auto}
.grad .chip{background:#FFC93C!important;color:#1B1E3A}
"""

JS = """
const S=[...document.querySelectorAll('.scene')];
const TOTAL=Math.max(...S.map(s=>+s.dataset.e));
const cl=x=>Math.max(0,Math.min(1,x)), ease=p=>1-Math.pow(1-p,3);
const back=p=>{const c=1.7;return 1+(c+1)*Math.pow(p-1,3)+c*Math.pow(p-1,2)};
window.seek=function(t){
  document.getElementById('bar').style.width=(t/TOTAL*100)+'%';
  let grad=false;
  S.forEach(s=>{
    const a=+s.dataset.s,e=+s.dataset.e,vis=t>=a&&t<e;
    s.style.display=vis?'flex':'none'; if(!vis)return;
    const lt=t-a; if(s.dataset.grad)grad=true;
    s.style.opacity=Math.min(cl(lt/0.25),cl((e-t)/0.25));
    s.querySelectorAll('[data-a]').forEach(el=>{
      const p=cl((lt-+el.dataset.a)/0.45),fx=el.dataset.fx;
      el.style.opacity=ease(p);
      el.style.transform=fx==='zoom'?`scale(${.4+.6*back(p)})`:fx==='fade'?'none':`translateY(${(1-back(p))*60}px)`;
    });
    s.querySelectorAll('[data-ok]').forEach(el=>el.classList.toggle('ok',lt>=+el.dataset.ok));
    s.querySelectorAll('[data-no]').forEach(el=>el.classList.toggle('no',lt>=+el.dataset.no));
    s.querySelectorAll('[data-x]').forEach(el=>el.classList.toggle('strike',lt>=+el.dataset.x));
    s.querySelectorAll('[data-cd]').forEach(el=>{const r=+el.dataset.n-(lt-+el.dataset.cd);el.textContent=r>0?Math.ceil(r):'💡';});
    s.querySelectorAll('[data-ring]').forEach(el=>{const a=+el.dataset.ring,d=+el.dataset.d,p=cl((lt-a)/d);
      el.querySelector('.arc').style.strokeDashoffset=389.6*p;
      el.querySelector('.num').textContent=Math.max(0,Math.ceil(d-Math.max(0,lt-a)));});
    s.querySelectorAll('[data-from]').forEach(el=>{const p=ease(cl((lt-+el.dataset.ca)/+el.dataset.cdur));
      el.textContent=Math.round(+el.dataset.from+(+el.dataset.to-+el.dataset.from)*p);});
  });
  document.body.classList.toggle('grad',grad);
};
// Ses olayları: [tür, saniye]
window.SOUNDS=function(){const ev=[];S.forEach(s=>{const a=+s.dataset.s;
  s.querySelectorAll('[data-snd]').forEach(el=>ev.push([el.dataset.snd,a+ +el.dataset.a]));
  s.querySelectorAll('[data-cd]').forEach(el=>{for(let i=0;i<+el.dataset.n;i++)ev.push(['tick',a+ +el.dataset.cd+i]);ev.push(['ding',a+ +el.dataset.cd+ +el.dataset.n]);});
  s.querySelectorAll('[data-ring]').forEach(el=>{const r=+el.dataset.ring,d=+el.dataset.d;for(let i=Math.max(0,d-3);i<d;i++)ev.push(['tick',a+r+i]);ev.push(['ding',a+r+d]);});
});return ev;};
seek(0);
"""

# ---- hafta dosyalarında kullanılan yardımcılar (zamanlar sahne başına göre, saniye) ----
def el(a, html, fx="pop", snd=None, tag="div", cls=""):
    s = f' data-snd="{snd}"' if snd else ""
    return f'<{tag} class="{cls}" data-a="{a}" data-fx="{fx}"{s}>{html}</{tag}>'

def sahne(bas, son, *ogeler, grad=False, cls=""):
    g = ' data-grad="1"' if grad else ""
    return f'<div class="scene {cls}" data-s="{bas}" data-e="{son}"{g}>' + "".join(ogeler) + "</div>"

def chat_reel(bas, adim, *satirlar):
    out = []
    for i, (ad, metin) in enumerate(satirlar):
        out.append(el(bas + i * adim, f'<div class="n" style="color:{KARAKTER.get(ad, "#3B4BD8")}">{ad}</div>'
                      f'<div class="t en">{metin}</div>', snd="pop", cls="msg" + (" r" if i % 2 else "")))
    return '<div class="chat">' + "".join(out) + "</div>"

def opts_reel(secenekler, dogru, cevap_t, bas=0.0, adim=0.35):
    out = []
    for i, s in enumerate(secenekler):
        harf = "ABCD"[i]
        isaret = f'data-ok="{cevap_t}"' if harf == dogru else f'data-no="{cevap_t}"'
        out.append(f'<div class="opt" {isaret} data-a="{bas + i * adim}"><i>{harf}</i><span class="en">{s}</span></div>')
    return '<div class="opts">' + "".join(out) + "</div>"

def geri_say(a, n=3):
    return f'<div class="cdn" data-cd="{a}" data-n="{n}">{n}</div>'

def halka(a, d):
    return (f'<div class="ring" data-ring="{a}" data-d="{d}"><svg viewBox="0 0 150 150" width="170" height="170">'
            '<circle cx="75" cy="75" r="62" fill="#fff" stroke="#DCDCEB" stroke-width="10"/>'
            '<circle class="arc" cx="75" cy="75" r="62" fill="none" stroke="var(--c)" stroke-width="14" stroke-linecap="round" '
            f'transform="rotate(-90 75 75)" stroke-dasharray="389.6"/></svg><div class="num">{d}</div></div>')

def sayac(a, sure, bas, hedef, cls="d big"):
    return f'<div class="{cls}" data-ca="{a}" data-cdur="{sure}" data-from="{bas}" data-to="{hedef}">{bas}</div>'

def kapanis(bas, gun, cagri="Kaydet 📌 Arkadaşına gönder 📤"):
    return sahne(bas, bas + 3.5,
        el(0.1, owl(260, bg=False), fx="zoom", snd="ding"),
        el(0.4, f'<div class="d" style="font-size:84px;line-height:1.05">{cagri}</div>'),
        el(0.8, f'<div class="lead">Her gün 1 LGS İngilizce dozu<br><b style="color:#FFC93C">Takip et: {HESAP}</b></div>'),
        el(1.2, f'<span class="badge">⏳ LGS\'ye {gun} gün</span>'),
        grad=True, cls="ctr")

YARDIMCI = {k: v for k, v in globals().items() if k in
            ("el", "sahne", "chat_reel", "opts_reel", "geri_say", "halka", "sayac", "kapanis", "owl")}

def html_yap(r):
    renk, etiket = SERI[r["seri"]]
    fonts = "file://" + os.path.join(KOK, "fonts", "fonts.css")
    return (f'<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="{fonts}">'
            f'<style>{CSS % {"w": 1080, "h": 1920}}{REEL_CSS}</style></head><body style="--c:{renk}">'
            f'<div class="blob" style="width:700px;height:700px;background:{renk};right:-300px;top:-260px"></div>'
            f'<div class="blob" style="width:600px;height:600px;background:#FFC93C;left:-300px;bottom:-260px"></div>'
            f'<div id="bar"></div><div class="top"><span class="chip" style="background:{renk}">{etiket}</span>'
            f'<span class="acc">{HESAP}</span></div>'
            + "".join(r["sahneler"]) + f"<script>{JS}</script></body></html>")

def sesler(dizin):
    tanim = {"tick": ["-f", "lavfi", "-i", "sine=f=1100:d=0.07", "-af", "afade=t=out:st=0.03:d=0.04,volume=0.45"],
             "pop": ["-f", "lavfi", "-i", "sine=f=660:d=0.09", "-af", "afade=t=out:st=0.02:d=0.07,volume=0.35"],
             "ding": ["-f", "lavfi", "-i", "sine=f=1318:d=0.5", "-f", "lavfi", "-i", "sine=f=1975:d=0.5",
                      "-filter_complex", "amix=inputs=2,afade=t=out:st=0.05:d=0.45,volume=0.8"]}
    for ad, arg in tanim.items():
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *arg, os.path.join(dizin, ad + ".wav")], check=True)

def uret(is_):
    r, cikti = is_
    from playwright.sync_api import sync_playwright
    tmp = tempfile.mkdtemp(prefix="_reel_")
    html = os.path.join(tmp, "r.html")
    open(html, "w", encoding="utf-8").write(html_yap(r))
    with sync_playwright() as p:
        b = p.chromium.launch(channel="chrome")
        pg = b.new_page(viewport={"width": 1080, "height": 1920})
        pg.goto("file://" + html)
        pg.wait_for_timeout(500)
        toplam, ev = pg.evaluate("TOTAL"), pg.evaluate("SOUNDS()")
        for i in range(int(toplam * FPS)):
            pg.evaluate(f"seek({i / FPS})")
            pg.screenshot(path=os.path.join(tmp, f"f{i:05d}.jpg"), type="jpeg", quality=90)
        b.close()
    sesler(tmp)
    girdi, filt = [], []
    for j, (tur, t) in enumerate(ev):
        girdi += ["-i", os.path.join(tmp, tur + ".wav")]
        ms = int(t * 1000)
        filt.append(f"[{j + 1}:a]adelay={ms}|{ms}[a{j}]")
    # Fon müziği: ses/fon_muzik.m4a (ffmpeg ile sentezlendi, telifsiz), sonda 1,5 sn kısılır
    m = len(ev) + 1
    girdi += ["-i", os.path.join(KOK, "ses", "fon_muzik.m4a")]
    filt.append(f"[{m}:a]atrim=0:{toplam},volume=0.55,afade=t=out:st={toplam - 1.5}:d=1.5[mz]")
    fc = ";".join(filt) + ";" + "".join(f"[a{j}]" for j in range(len(ev))) + f"[mz]amix=inputs={len(ev) + 1}:normalize=0,apad[aout]"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", os.path.join(tmp, "f%05d.jpg"), *girdi,
                    "-filter_complex", fc, "-map", "0:v", "-map", "[aout]", "-shortest",
                    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium", "-r", str(FPS),
                    "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", cikti], check=True)
    shutil.rmtree(tmp)
    return f"{os.path.basename(cikti)} · {toplam:.1f} sn"

def main():
    hafta = os.path.abspath(sys.argv[1])
    veri = runpy.run_path(hafta, init_globals=YARDIMCI)
    klasor = hafta.replace("_reels.py", "")
    os.makedirs(klasor, exist_ok=True)
    secili = sys.argv[2:]
    isler = [(r, os.path.join(gun_klasoru(klasor, r["kod"]), f'{r["kod"]}_reels.mp4')) for r in veri["REELS"] if not secili or r["kod"] in secili]
    with Pool(min(4, len(isler))) as p:
        for satir in p.imap_unordered(uret, isler):
            print(satir, flush=True)
    print(f"{aciklama_yaz(klasor)} açıklama dosyası güncellendi")

if __name__ == "__main__":
    main()
