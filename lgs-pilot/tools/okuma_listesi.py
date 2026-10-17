"""Öğretmen okuma listesi üretici: seçilen günleri okunur HTML'e çevirir (✓/✗ + not, sorunları kopyala).
Kullanım (repo kökünden):  python3 lgs-pilot/tools/okuma_listesi.py --unit 1 --days 1 2 3
Çıktı: docs/okuma_listesi/u01_gun_01-02-03.html  (tek dosya, tarayıcıda açılır, işaretler tarayıcıda saklanır)
"""
import argparse, glob, html, os, re, yaml

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
C = os.path.join(ROOT, "lgs-pilot", "content")
MARK = re.compile(r"\{(U\d+-\d+)(?:\|([^}]*))?\}")

STORY_Q = [
    ("tr_dogal", "Türkçe doğal ve akıcı mı? (çeviri kokmuyor, 8. sınıf diline uygun)"),
    ("komik", "Komik ya da merak uyandırıcı mı, sıkmadan okunuyor mu?"),
    ("sezdirme", "Her yeni ifadenin anlamı bağlamdan çıkarılabiliyor mu? (hikâyede yeterli ipucu var)"),
    ("sizinti", "Yeni ifadenin Türkçe karşılığı hiçbir yerde sızmamış mı? (başlık, koç mesajı, bildirim dahil)"),
    ("kanon", "Karakter ve olaylar kanonla tutarlı mı? (örn. Bora'nın kedisi yok; Fıstık = Duru'nun köpeği)"),
    ("ton", "Ton uygun mu? (zorbalık, aşağılama, romantizm, tehlikeli davranış, gerçek marka/ünlü yok)"),
    ("buyuk_harf", "Türkçe cümle içinde ek alan İngilizce kelime BÜYÜK HARFLE yazılmış (örn. INVITATION'ı). Bu tercih okumayı bozmuyor, öğrenciye uygun mu? (İstemezsen kural koyalım, ben düzeltirim.)"),
    ("uzunluk", "Telefonda okunacak uzunlukta mı? (yaklaşık 18–28 satır, 5–10 dk ders)"),
]
SCENE_Q = [
    ("en_dogal", "İngilizce doğal mı? (gerçek bir mesajlaşmada yazılır gibi)"),
    ("en_yazim", "İngiliz yazımı (colour, favourite…) ve Present Perfect yok mu?"),
    ("en_kullanim", "Yeni ifadeler doğru ve doğal bağlamda kullanılmış mı?"),
]
QUESTION_Q = [
    ("tek_dogru", "Her soruda tek ve savunulabilir doğru cevap var mı? (ilk şık işaretli)"),
    ("celdirici", "Çeldiriciler adil mi? (ikinci bir doğru cevap yok, saçma değil)"),
    ("ipucu", "Sına sorusu, kelimeyi bilmeden şıklara/metne bakarak çözülemiyor mu?"),
    ("lgs_bicim", "Sına soruları gerçek LGS biçimine benziyor mu? (kök, uzunluk, dil)"),
    ("aciklama", "Yanlış cevap açıklamaları doğru ve öğretici mi?"),
]
GENERAL_Q = [
    ("hap", "Hap bilgiler (tuzak, hafıza kancası, mini dilbilgisi) doğru mu?"),
    ("koc", "Koç mesajları (açılış, kapanış) sıcak, utandırmayan, Türkçe karşılık içermeyen mi?"),
    ("bildirim", "Bildirimler kısa ve merak uyandırıcı mı? (çeviri yok)"),
]


def esc(s):
    return html.escape(str(s), quote=False)


def rich(text, items):
    """İşaretleri okunur HTML'e çevirir: {U1-001|x} → vurgulu kelime, <en> → italik."""
    t = esc(text)
    t = re.sub(r"&lt;en&gt;(.*?)&lt;/en&gt;", r'<em class="en">\1</em>', t, flags=re.S)
    t = re.sub(r"&lt;u&gt;(.*?)&lt;/u&gt;", r"<u>\1</u>", t, flags=re.S)
    t = MARK.sub(lambda m: f'<mark title="{m.group(1)}">{m.group(2) or items.get(m.group(1), {}).get("display", m.group(1))}</mark>', t)
    return t.replace("\n", "<br>")


def judge(did, label):
    """✓/✗ düğmeleri; ✗ ise not alanı açılır."""
    return (f'<div class="j" data-id="{did}" data-label="{esc(label)}"><span class="jl">{esc(label)}</span>'
            f'<span class="jb"><button type="button" class="ok" aria-label="iyi">✓</button><button type="button" class="no" aria-label="sorun">✗</button></span>'
            f'<textarea placeholder="Ne sorunlu? Ne olmalı?" rows="2"></textarea></div>')


def flag(did, label):
    """Tek bir soru/satır için küçük bayrak."""
    return (f'<div class="j flag" data-id="{did}" data-label="{esc(label)}"><button type="button" class="no sm">⚑ sorun var</button>'
            f'<textarea placeholder="Ne sorunlu?" rows="2"></textarea></div>')


def question_html(q, items, did, label):
    opts = "".join(
        f'<li class="{"right" if i == 0 else ""}">{rich(o, items)}{" <b>✓ doğru</b>" if i == 0 else ""}</li>' for i, o in enumerate(q["options"]))
    head = f'<div class="qh"><code>{esc(q.get("id", ""))}</code> <span class="muted">{esc(q.get("type", ""))}{" · LGS biçimi" if q.get("lgs_like") else ""}</span></div>'
    body = f'<p class="prompt">{rich(q["prompt"], items)}</p>' if q.get("prompt") else ""
    if q.get("stem"):
        body += f'<p class="stem">{rich(q["stem"], items)}</p>'
    exp = f'<p class="explain">Açıklama: {esc(q["explain"])}</p>' if q.get("explain") else ""
    return f'<div class="q">{head}{body}<ol type="a">{opts}</ol>{exp}{flag(did, label)}</div>'


def count_lines(item_id, lines):
    n = 0
    for l in lines:
        if any(m[0] == item_id for m in MARK.findall(l["text"])):
            n += 1
    return n


def day_html(d, items, uid):
    D = f'u{uid}d{d["day"]}'
    newset = d["new_items"]
    words = sum(len(re.sub(r"\{[^}]*\}|<[^>]+>", " ", l["text"]).split()) for l in d["story"])
    notif_bad = [k for k, v in d["notifications"].items() if len(v) > 90]

    # otomatik bilgiler
    auto = []
    for iid in newset:
        n = count_lines(iid, d["story"])
        warn = ' class="warn"' if n < 3 else ""
        it = items.get(iid, {})
        auto.append(f'<tr{warn}><td><b>{esc(it.get("display", iid))}</b><br><code>{iid}</code></td><td>{esc(it.get("meaning_tr", ""))}<br><span class="muted">{esc(it.get("theme", ""))} · {esc(it.get("class", it.get("kind", "")))}</span></td><td>{n} satır{" ⚠ (en az 3 olmalı)" if n < 3 else ""}</td><td>{judge(f"{D}.item.{iid}", f"{it.get("display", iid)}: öğretilmeye değer ve anlamı doğru mu?")}</td></tr>')

    out = [f'<details class="day" open><summary><span class="dn">Gün {d["day"]}</span> {esc(d["title"])} <span class="muted">· {d.get("est_minutes", "?")} dk · {len(d["story"])} satır · ~{words} kelime</span></summary>']
    out.append(f'<p class="muted">Karakterler: {esc(", ".join(d.get("characters", [])))} · Durum: <b>{esc(d.get("status", ""))}</b></p>')
    out.append('<h3>Bu günün yeni ifadeleri <span class="muted small">(öğrenciye anlamı gösterilmez; sen kontrol et)</span></h3>')
    out.append('<div class="tw"><table><thead><tr><th>İfade</th><th>Anlam / tema</th><th>Hikâyede</th><th>Kontrol</th></tr></thead><tbody>' + "".join(auto) + "</tbody></table></div>")

    out.append("<h3>1 · Koç açılışı</h3>")
    out.append(f'<p class="coach">{esc(d["coach"]["start"])}</p>')
    out.append("<h3>2 · Hikâye <span class=\"muted small\">(sarı = yeni ifade)</span></h3><div class=\"story\">")
    for l in d["story"]:
        out.append(f'<div class="line"><span class="ln">{l["id"]}</span><p>{rich(l["text"], items)}</p>{flag(f"{D}.story.{l["id"]}", f"Hikâye {l["id"]}")}</div>')
    out.append("</div>" + "".join(judge(f"{D}.story.{k}", f"Hikâye · {t}") for k, t in STORY_Q))

    out.append("<h3>3 · İngilizce sahne</h3><div class=\"chat\">")
    for l in d.get("scene", []):
        out.append(f'<div class="msg"><b>{esc(l.get("speaker", ""))}</b> {rich(l["text"], items)}{flag(f"{D}.scene.{l["id"]}", f"Sahne {l["id"]}")}</div>')
    out.append("</div>" + "".join(judge(f"{D}.scene.{k}", f"Sahne · {t}") for k, t in SCENE_Q))

    out.append("<h3>4 · Sezdir · Kullan · Sına</h3>")
    for st in d["steps"]:
        it = items.get(st["item"], {})
        out.append(f'<div class="step"><h4>{esc(it.get("display", st["item"]))} <code>{st["item"]}</code></h4>')
        for role, name in (("sezdir", "Sezdir"), ("kullan", "Kullan"), ("sina", "Sına")):
            q = st[role]
            ctx = ""
            if role == "sezdir" and q.get("context"):
                src = next((l for l in d["story"] if l["id"] == q["context"]), None)
                if src:
                    ctx = f'<p class="ctx">Öğrenciye gösterilen hikâye satırı ({q["context"]}): {rich(src["text"], items)}</p>'
            out.append(f'<div class="role"><span class="rb {role}">{name}</span>{ctx}{question_html(q, items, f"{D}.q.{q["id"]}", f"Soru {q["id"]} ({name}, {it.get("display", st["item"])})")}</div>')
        out.append("</div>")

    if d.get("review"):
        out.append("<h3>5 · Tekrar soruları <span class=\"muted small\">(önceki günlerden)</span></h3>")
        for q in d["review"]:
            it = items.get(q.get("item", ""), {})
            out.append(question_html(q, items, f"{D}.q.{q['id']}", f"Tekrar {q['id']} ({it.get('display', q.get('item', ''))})"))
    out.append("".join(judge(f"{D}.qs.{k}", f"Sorular · {t}") for k, t in QUESTION_Q))

    out.append("<h3>6 · Hap bilgiler</h3>")
    for i, t in enumerate(d["tips"]):
        out.append(f'<div class="tip"><span class="muted">{esc(t["type"])}</span><p>{esc(t["text"])}</p>{flag(f"{D}.tip.{i}", f"Hap bilgi {i + 1} ({t["type"]})")}</div>')
    out.append("<h3>7 · Koç kapanışı ve bildirimler</h3>")
    out.append(f'<p class="coach">İyi: {esc(d["coach"].get("end_good", ""))}</p><p class="coach">Karışık: {esc(d["coach"].get("end_mixed", ""))}</p>')
    out.append("<ul class=\"notif\">" + "".join(f'<li><b>{k}</b> ({len(v)} kar.{" ⚠ 90 üstü" if len(v) > 90 else ""}): {esc(v)}</li>' for k, v in d["notifications"].items()) + "</ul>")
    out.append("".join(judge(f"{D}.gen.{k}", f"Genel · {t}") for k, t in GENERAL_Q))
    out.append("</details>")
    return "\n".join(out), bool(notif_bad)


LIGHT_Q = [
    ("kart", "Kart: örnek cümleler doğal İngilizce mi, Türkçe karşılıkları doğru mu, tuzak notları doğru mu?"),
    ("tek_dogru", "Her soruda tek ve savunulabilir doğru cevap var mı? (ilk şık işaretli)"),
    ("celdirici", "Çeldiriciler adil mi? (ikinci bir doğru cevap yok, tamamen saçma da değil)"),
    ("ipucu", "Sına soruları kelimeyi bilmeden çözülemiyor mu? (şıklara bakarak bulunmuyor)"),
    ("lgs_bicim", "Sına soruları gerçek LGS biçimine (kök, uzunluk, dil) benziyor mu?"),
    ("tekrar", "Tekrar soruları Kullan/Sına'dan farklı bir bağlamda mı, hâlâ adil mi?"),
    ("aciklama", "Açıklamalar doğru ve öğretici mi?"),
    ("yazim", "İngiliz yazımı (colour, favourite, realise…) kullanılmış mı? Present Perfect dilbilgisi yok mu?"),
]


def day_html_light(d, items, uid):
    D = f'u{uid}d{d["day"]}'
    out = [f'<details class="day" open><summary><span class="dn">Gün {d["day"]}</span> {esc(d["title"])} <span class="muted">· {d.get("est_minutes", "?")} dk · {len(d["steps"])} birim · hikâyesiz (hafif mod)</span></summary>']
    out.append('<h3>Bu günün ifadeleri <span class="muted small">(anlam ve seçim doğru mu, LGS için öğretilmeye değer mi?)</span></h3>')
    rows = []
    for st in d["steps"]:
        it = items.get(st["item"], {})
        rows.append(f'<tr><td><b>{esc(it.get("display", st["item"]))}</b><br><code>{st["item"]}</code></td><td>{esc(it.get("meaning_tr", ""))}<br><span class="muted">{esc(it.get("theme", ""))}</span></td><td>{judge(f"{D}.item.{st["item"]}", f"{it.get("display", st["item"])}: anlam doğru ve öğretilmeye değer mi?")}</td></tr>')
    out.append('<div class="tw"><table><thead><tr><th>İfade</th><th>Anlam / tema</th><th>Kontrol</th></tr></thead><tbody>' + "".join(rows) + "</tbody></table></div>")
    out.append("<h3>Koç açılışı</h3>")
    out.append(f'<p class="coach">{esc(d["coach"]["start"])}</p>')
    out.append("<h3>Kartlar ve sorular <span class=\"muted small\">(öğrenci önce kartı görür, sonra Kullan ve Sına çözer; Tekrar sorusu günler sonra gelir)</span></h3>")
    for st in d["steps"]:
        it = items.get(st["item"], {})
        c = st.get("card", {})
        out.append(f'<div class="step"><h4>{esc(it.get("display", st["item"]))} <code>{st["item"]}</code> <span class="muted small">{esc(it.get("meaning_tr", ""))}</span></h4>')
        out.append(f'<div class="q"><div class="qh"><b>Kart</b></div><p class="stem"><em class="en">{esc(c.get("example_en", ""))}</em></p><p class="muted">{esc(c.get("example_tr", ""))}</p>' + (f'<p class="explain">💡 {esc(c["note_tr"])}</p>' if c.get("note_tr") else "") + flag(f"{D}.card.{st['item']}", f"Kart {it.get('display', st['item'])}") + "</div>")
        for role, name in (("kullan", "Kullan"), ("sina", "Sına"), ("tekrar", "Tekrar (sonraki günlerde gelir)")):
            if role in st:
                q = st[role]
                out.append(f'<div class="role"><span class="rb {role}">{name}</span>{question_html(q, items, f"{D}.q.{q["id"]}", f"Soru {q["id"]} ({name}, {it.get("display", st["item"])})")}</div>')
        out.append("</div>")
    out.append("".join(judge(f"{D}.qs.{k}", f"Sorular · {t}") for k, t in LIGHT_Q))
    out.append("<h3>Hap bilgiler</h3>")
    for i, t in enumerate(d["tips"]):
        out.append(f'<div class="tip"><span class="muted">{esc(t["type"])}</span><p>{esc(t["text"])}</p>{flag(f"{D}.tip.{i}", f"Hap bilgi {i + 1} ({t["type"]})")}</div>')
    out.append("<h3>Koç kapanışı ve bildirimler</h3>")
    out.append(f'<p class="coach">İyi: {esc(d["coach"].get("end_good", ""))}</p><p class="coach">Karışık: {esc(d["coach"].get("end_mixed", ""))}</p>')
    out.append("<ul class=\"notif\">" + "".join(f'<li><b>{k}</b> ({len(v)} kar.{" ⚠ 90 üstü" if len(v) > 90 else ""}): {esc(v)}</li>' for k, v in d["notifications"].items()) + "</ul>")
    out.append("".join(judge(f"{D}.gen.{k}", f"Genel · {t}") for k, t in GENERAL_Q))
    out.append("</details>")
    return "\n".join(out), any(len(v) > 90 for v in d["notifications"].values())


CSS = """
:root{--bg:#f1f0f7;--paper:#fff;--ink:#1b1e3a;--muted:#62668a;--line:#dcdceb;--brand:#3b4bd8;--ok:#1e9e77;--no:#d2433a;--hl:#fff3b0}
@media (prefers-color-scheme:dark){:root{--bg:#12142a;--paper:#1b1e3a;--ink:#ecedf8;--muted:#a3a6c8;--line:#2e3260;--brand:#8e9bff;--ok:#53d1a6;--no:#ff877e;--hl:#5a4d10}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:17px/1.6 "Nunito Sans","Segoe UI",system-ui,sans-serif;padding:20px 16px 90px}
.wrap{max-width:820px;margin:0 auto}h1{font-size:1.8rem;margin:.2em 0}h3{margin:1.6em 0 .4em;font-size:1.1rem;border-bottom:2px solid var(--line);padding-bottom:4px}h4{margin:.2em 0}
.muted{color:var(--muted)}.small{font-size:.8rem;font-weight:400}code{font-size:.8em;background:var(--bg);padding:1px 5px;border-radius:5px}
details.day{background:var(--paper);border-radius:16px;padding:16px 18px;margin:16px 0;box-shadow:0 1px 6px #0002}
summary{cursor:pointer;font-weight:800;font-size:1.15rem}.dn{background:var(--brand);color:#fff;border-radius:8px;padding:1px 9px;margin-right:6px}
.how{background:var(--paper);border-left:4px solid var(--brand);padding:10px 14px;border-radius:10px}
mark{background:var(--hl);color:inherit;border-radius:4px;padding:0 3px;font-weight:800}.en{font-style:italic}
.line{display:grid;grid-template-columns:34px 1fr;gap:2px 8px;padding:6px 0;border-bottom:1px dashed var(--line)}.line p{margin:0}.line .flag{grid-column:2}.ln{color:var(--muted);font-size:.7rem;padding-top:5px}
.chat .msg{background:var(--bg);border-radius:12px;padding:8px 12px;margin:6px 0}
.coach{background:var(--bg);border-radius:12px;padding:8px 12px;font-weight:600}
.tw{overflow-x:auto}table{border-collapse:collapse;width:100%;font-size:.9rem}th,td{border-bottom:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:top}tr.warn td{background:color-mix(in srgb,var(--no) 14%,transparent)}
.step{border:1px solid var(--line);border-radius:12px;padding:8px 12px;margin:10px 0}.role{margin:6px 0}.rb{display:inline-block;font-size:.72rem;font-weight:800;border-radius:99px;padding:1px 10px;background:var(--line)}
.q{background:var(--bg);border-radius:12px;padding:8px 12px;margin:6px 0}.qh{font-size:.8rem}.prompt{font-weight:800;margin:.2em 0}.stem{white-space:pre-line;margin:.2em 0}.ctx{font-size:.88rem;color:var(--muted);margin:.2em 0}
ol{margin:.2em 0 .2em 1.2em;padding:0}li.right{color:var(--ok);font-weight:700}.explain{font-size:.88rem;color:var(--muted);margin:.2em 0}
.tip{background:var(--bg);border-radius:12px;padding:6px 12px;margin:6px 0}.tip p{margin:.2em 0}.notif{font-size:.9rem}
.j{margin:6px 0;display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center}.j .jl{flex:1 1 300px}.jb{display:flex;gap:6px}
.j textarea{display:none;flex:1 1 100%;font:inherit;border:2px solid var(--no);border-radius:10px;padding:6px 8px;background:var(--paper);color:var(--ink)}
.j.bad textarea{display:block}.j button{font:inherit;border:2px solid var(--line);background:var(--paper);color:var(--ink);border-radius:8px;padding:0 10px;min-height:32px;cursor:pointer;font-weight:800}
.j.good .ok{background:var(--ok);border-color:var(--ok);color:#fff}.j.bad .no{background:var(--no);border-color:var(--no);color:#fff}.j.flag{margin:2px 0}.j .sm{font-size:.75rem;min-height:26px}.j.flag .no{opacity:.65}.j.flag.bad .no{opacity:1}
.bar{position:fixed;left:0;right:0;bottom:0;background:var(--paper);border-top:2px solid var(--line);padding:10px 16px;display:flex;gap:12px;align-items:center;justify-content:center;flex-wrap:wrap;z-index:5}
.bar button{font:inherit;font-weight:800;background:var(--brand);color:#fff;border:0;border-radius:10px;padding:8px 16px;cursor:pointer}.bar button.g{background:transparent;color:var(--ink);border:2px solid var(--line)}
input.whoin{font:inherit;border:2px solid var(--line);border-radius:10px;padding:6px 10px;background:var(--paper);color:var(--ink);min-width:260px}\n@media print{.bar{display:none}details{box-shadow:none}.j textarea{display:block}}
"""

JS = """
const KEY = document.body.dataset.key;
let S = {}; try { S = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const all = [...document.querySelectorAll('.j')];
function paint(el) {
  const s = S[el.dataset.id] || {};
  el.classList.toggle('good', s.v === 'ok'); el.classList.toggle('bad', s.v === 'no');
  const ta = el.querySelector('textarea'); if (ta && s.n != null && ta.value !== s.n) ta.value = s.n;
}
function stats() {
  const crit = all.filter(e => !e.classList.contains('flag'));
  const done = crit.filter(e => (S[e.dataset.id] || {}).v).length;
  const bad = all.filter(e => (S[e.dataset.id] || {}).v === 'no').length;
  document.getElementById('st').textContent = `Kriter: ${done}/${crit.length} işaretlendi · Sorun: ${bad}`;
}
all.forEach(el => {
  paint(el);
  el.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    const id = el.dataset.id, cur = S[id] || {};
    const v = b.classList.contains('ok') ? 'ok' : 'no';
    S[id] = { ...cur, v: cur.v === v ? null : v }; save(); paint(el); stats();
  }));
  const ta = el.querySelector('textarea');
  if (ta) ta.addEventListener('input', () => { S[el.dataset.id] = { ...(S[el.dataset.id] || { v: 'no' }), n: ta.value }; save(); });
});
stats();
const whoEl=document.getElementById('who'); if(whoEl){ whoEl.value=S._who||''; whoEl.addEventListener('input',()=>{S._who=whoEl.value;save();}); }
document.getElementById('cp').onclick = async () => {
  const lines = all.filter(e => (S[e.dataset.id] || {}).v === 'no').map(e => {
    const n = (S[e.dataset.id] || {}).n; return `• [${e.dataset.id}] ${e.dataset.label}${n ? ' — ' + n : ''}`; });
  const who = (document.getElementById('who')||{}).value || '';
  const head = (who ? `Okuyan: ${who}\\n` : '') + document.title + '\\n';
  const txt = head + (lines.length ? `Sorunlar (${lines.length}):\\n` + lines.join('\\n') : 'Sorun işaretlenmedi.');
  try { await navigator.clipboard.writeText(txt); document.getElementById('st').textContent = `Kopyalandı: ${lines.length} sorun. Claude'a yapıştır.`; }
  catch (e) { prompt('Kopyala (Ctrl/Cmd+C):', txt); }
};
document.getElementById('cl').onclick = () => { if (confirm('Tüm işaretler ve notlar silinsin mi?')) { S = {}; save(); location.reload(); } };
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--unit", type=int, default=1)
    ap.add_argument("--days", type=int, nargs="*", default=None, help="gün numaraları; verilmezse ünitenin tüm günleri")
    a = ap.parse_args()
    items = {i["id"]: i for i in yaml.safe_load(open(os.path.join(C, f"unit_{a.unit:02d}_items.yaml"), encoding="utf-8"))["items"]}
    files = {}
    for sub in ("days", "light"):
        for f in sorted(glob.glob(os.path.join(C, sub, f"u{a.unit:02d}_day_*.yaml"))):
            files[int(re.search(r"_day_(\d+)", f).group(1))] = f
    days = a.days if a.days else sorted(files)
    parts, warns, light = [], [], False
    for n in days:
        d = yaml.safe_load(open(files[n], encoding="utf-8"))
        if d.get("mode") == "light":
            light = True
            h, bad = day_html_light(d, items, a.unit)
        else:
            h, bad = day_html(d, items, a.unit)
        parts.append(h)
        if bad:
            warns.append(n)
    all_days = not a.days
    tag = "tum" if all_days else "-".join(f"{n:02d}" for n in days)
    ut = items[next(iter(items))].get("unit", a.unit)
    unit_title = yaml.safe_load(open(os.path.join(C, f"unit_{a.unit:02d}_items.yaml"), encoding="utf-8")).get("unit_title", "")
    title = f"Okuma listesi · Ünite {a.unit} ({unit_title}) · " + ("tüm günler" if all_days else f"Gün {', '.join(map(str, days))}")
    how = (
        '<b>Nasıl kullanılır:</b> Her günü sırayla oku. Önce ifadelerin anlamına bak, sonra her kartı ve sorusunu oku. Doğru şık <b style="color:var(--ok)">yeşil ✓</b> ile işaretli (uygulamada şıklar karışık gelir). '
        'Bir kriter iyiyse <b>✓</b>, sorun varsa <b>✗</b> ve kısa not yaz; tek bir kart/soru/bilgi için <b>⚑</b> kullan. Hepsini işaretlemek zorunda değilsin: yalnız sorun gördüğün yerleri işaretlemen yeterli. '
        'İşaretlerin bu tarayıcıda saklanır, sonra kaldığın yerden devam edebilirsin. Bitince alttaki <b>Sorunları kopyala</b> düğmesine bas ve çıkan metni Murat\'a gönder.<br>'
        '<span class="muted">Odak: öğretilen anlam doğru mu, sorular tek doğru cevaplı ve adil mi, İngilizce doğal mı, LGS\'ye benziyor mu? Durum: tüm günler TASLAK (hafif mod: hikâyesiz kart + soru).</span>'
        if light else
        '<b>Nasıl kullanılır:</b> Her günü sırayla oku (hikâye → sahne → sorular). Doğru şık <b style="color:var(--ok)">yeşil ✓</b>; uygulamada şıklar karışık gelir. Bir kriter iyiyse <b>✓</b>, sorun varsa <b>✗</b> ve kısa not yaz. Tek bir satır/soru için <b>⚑</b> kullan. İşaretlerin bu tarayıcıda saklanır. Bitince alttaki <b>Sorunları kopyala</b> ile bana yapıştır; düzeltmeleri ben yaparım.<br>'
        '<span class="muted">Doğrulayıcının zaten denetlediği şeyler (çeviri yasağı, answer: 0, ≥3 satır, bildirim ≤90) burada ikinci planda; sen insan gözü gereken kısma odaklan: doğallık, mizah, adillik, doğruluk. Durum: tüm günler TASLAK.</span>'
    )
    doc = f"""<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title}</title><style>{CSS}</style></head>
<body data-key="okuma:u{a.unit}:{tag}"><div class="wrap">
<div class="muted">Hikayenglish LGS · pilot öncesi içerik okuması</div><h1>{title}</h1>
<div class="how">{how}</div>
<p><label>Okuyan kişinin adı: <input id="who" class="whoin" placeholder="Ad Soyad (isteğe bağlı)"></label></p>
{"".join(parts)}
</div>
<div class="bar"><span id="st"></span><button id="cp">Sorunları kopyala</button><button id="cl" class="g">Sıfırla</button></div>
<script>{JS}</script></body></html>"""
    out_dir = os.path.join(ROOT, "docs", "okuma_listesi")
    os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, f"u{a.unit:02d}_{'tum_gunler' if all_days else 'gun_' + tag}.html")
    open(out, "w", encoding="utf-8").write(doc)
    print("ok", out, f"({len(doc) // 1024} KB)", "| 90 üstü bildirim olan günler:", warns or "yok")


if __name__ == "__main__":
    main()
