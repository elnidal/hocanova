"""Hafif mod günlerinin doğrulayıcısı (hikâyesiz): python3 lgs-pilot/tools/light_validate.py
Denetler: zorunlu alanlar, birimler items dosyasında var mı, id biçimi, answer: 0, şık sayısı/tekrarı,
İngiliz yazımı, Present Perfect şüphesi (UYARI), bildirim ≤ 90, Sına'da LGS işaretleri,
her birimin kart + kullan + sına (+ tekrar: ders günü gösterilmeyen, aralıklı tekrarda kullanılan üçüncü soru)."""
import glob, os, re, sys, yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TYPES = {"meaning", "gap_fill", "dialogue_complete", "message_infer", "synonym", "trait_match", "odd_one_out", "situation", "process_order", "table_graph", "text_infer"}
US = r"\b(color|colors|favorite|apologize|center|traveler|neighbor|theater|organize|realize|gray|program)\b"
PP = re.compile(r"\b(have|has)\s+(?!to\b|got\b)(\w+ed|been|gone|seen|done|made|taken|visited|eaten|written)\b", re.I)
errors, warns = [], []
E = lambda f, m: errors.append(f"ENGEL  {os.path.basename(f)}: {m}")
W = lambda f, m: warns.append(f"UYARI  {os.path.basename(f)}: {m}")


def texts(q):
    return [q.get("prompt", ""), q.get("stem", "")] + [str(o) for o in q.get("options", [])]


def check_q(f, q, role, day_prefix):
    qid = q.get("id", "?")
    if role == "review":
        if not re.fullmatch(rf"{day_prefix}-r\d{{2}}", qid):
            E(f, f"{qid}: id biçimi {day_prefix}-rNN olmalı")
    else:
        suf = {"kullan": "k", "sina": "s", "tekrar": "t"}[role]
        if not re.fullmatch(rf"{day_prefix}-\d{{3}}-{suf}", qid):
            E(f, f"{qid}: id biçimi {day_prefix}-NNN-{suf} olmalı")
    if q.get("type") not in TYPES:
        E(f, f"{qid}: bilinmeyen type {q.get('type')}")
    if q.get("answer") != 0:
        E(f, f"{qid}: answer 0 olmalı")
    o = q.get("options") or []
    if not 3 <= len(o) <= 4:
        E(f, f"{qid}: 3–4 şık olmalı ({len(o)})")
    if len(set(map(str, o))) != len(o):
        E(f, f"{qid}: tekrarlayan şık")
    if not q.get("prompt"):
        E(f, f"{qid}: prompt boş")
    if not q.get("explain"):
        E(f, f"{qid}: açıklama (explain) yok")
    if role in ("sina", "review"):
        if not q.get("lgs_like"):
            E(f, f"{qid}: Sına sorusunda lgs_like: true olmalı")
        if q.get("stem_id") and not re.fullmatch(r"S(0[1-9]|1[0-4])", str(q["stem_id"])):
            E(f, f"{qid}: stem_id S01–S14 olmalı")
    blob = " ".join(texts(q))
    if re.search(US, blob, re.I):
        E(f, f"{qid}: Amerikan yazımı: {re.search(US, blob, re.I).group(0)}")
    en = " ".join(re.findall(r"<en>(.*?)</en>", blob, flags=re.S))
    m = PP.search(en)
    if m and not re.search(r"have you ever been", en, re.I):
        W(f, f"{qid}: Present Perfect şüphesi: \"{m.group(0)}\"")


TOKEN = re.compile(r"\{(U\d{1,2}-\d{3})(?:\|([^}]+))?\}")
EN_SEG = re.compile(r"<en>.*?</en>", re.S)
TR_CH = "a-zçğıöşüâîû"
low = lambda t: t.replace("I", "ı").replace("İ", "i").lower()


def ban_patterns(it):
    """Çeviri yasağı kalıpları (lgs_validate ile aynı mantık): ban_tr › meaning_ban › meaning_tr parçaları."""
    if it.get("ban_tr"): return [low(b) for b in it["ban_tr"]]
    if it.get("meaning_ban"): return [re.escape(low(b)) for b in it["meaning_ban"]]
    pats = []
    for part in re.split(r"[,/;]", re.sub(r"\(.*?\)", "", it.get("meaning_tr", ""))):
        q = re.sub(r"^-", "", low(part.replace("…", "").replace("?", "").replace(".", "").strip()))
        if len(q) >= 3: pats.append(re.escape(q))
    return pats


def check_mini(f, d, items_full, taught):
    """Mini sahne: her yeni birimin kendi sahnesi, birim orada belirteçle geçer, öğretilmemiş birime belirteç yok, çeviri yasağı."""
    mini = d.get("mini") or []
    if not mini: return
    for m in mini:
        if not 2 <= len(m.get("lines", [])) <= 4: E(f, f"mini {m.get('item')}: 2–4 satır olmalı")
    for i in d["new_items"]:
        m = next((x for x in mini if x.get("item") == i), None)
        if not m: E(f, f"{i}: mini sahne yok"); continue
        if not any(re.search(r"\{" + i + r"[}|]", l["text"]) for l in m["lines"]): E(f, f"{i}: kendi mini sahnesinde geçmiyor")
    full = " ".join([m.get("durum", "") for m in mini] + [l["text"] for m in mini for l in m["lines"]])
    for t in TOKEN.finditer(full):
        if t.group(1) not in taught: E(f, f"mini: {t.group(1)} henüz öğretilmedi ya da bilinmiyor")
    plain = low(TOKEN.sub(" ", EN_SEG.sub(" ", full)))
    for i in {t.group(1) for t in TOKEN.finditer(full)}:
        it = items_full.get(i)
        if not it: continue
        for pat in ban_patterns(it):
            mm = re.search(r"(?<![" + TR_CH + r"])" + pat, plain)
            if mm: W(f, f"ÇEVİRİ: {it.get('display')} karşılığı \"{mm.group(0)}\" mini sahnede geçiyor olabilir")


def main():
    files = sorted(glob.glob(os.path.join(ROOT, "content", "light", "u*_day_*.yaml")))
    ids = set()
    # öğretim sırası: önceki ünitelerin tüm birimleri + bu ünitenin bugüne kadarki günleri
    all_items = {}
    for uf in sorted(glob.glob(os.path.join(ROOT, "content", "unit_*_items.yaml"))):
        for it in yaml.safe_load(open(uf, encoding="utf-8"))["items"]: all_items[it["id"]] = it
    days = [yaml.safe_load(open(x, encoding="utf-8")) for x in files]
    taught_by = {}
    for dd in sorted(days, key=lambda z: (z["unit"], z["day"])):
        prev = {i for i in all_items if int(i[1:i.index("-")]) < dd["unit"]}
        same = {i for z in days if z["unit"] == dd["unit"] and z["day"] <= dd["day"] for i in z["new_items"]}
        taught_by[(dd["unit"], dd["day"])] = prev | same
    for f in files:
        d = yaml.safe_load(open(f, encoding="utf-8"))
        for k in ("unit", "day", "title", "new_items", "steps", "tips", "coach", "notifications", "est_minutes"):
            if k not in d:
                E(f, f"eksik alan: {k}")
        if d.get("mode") != "light":
            E(f, "mode: light olmalı")
        if (d.get("est_minutes") or 0) > 10:
            E(f, "est_minutes ≤ 10 olmalı")
        items = {i["id"] for i in yaml.safe_load(open(os.path.join(ROOT, "content", f"unit_{d['unit']:02d}_items.yaml"), encoding="utf-8"))["items"]}
        prefix = f"u{d['unit']}d{d['day']:02d}"
        step_items = [s["item"] for s in d.get("steps", [])]
        if sorted(step_items) != sorted(d.get("new_items", [])):
            E(f, "new_items ile steps birimleri aynı olmalı")
        if d.get("exam"):  # sınav provası günü: yeni ifade yok, review soruları LGS biçiminde
            if step_items: E(f, "sınav provası gününde yeni ifade olmaz")
            if not 6 <= len(d.get("review", [])) <= 12: E(f, "sınav provası 6–12 soru olmalı")
            for q in d.get("review", []):
                check_q(f, q, "review", prefix)
                if q.get("id") in ids: E(f, f"tekrarlanan id {q.get('id')}")
                ids.add(q.get("id"))
                if not q.get("item"): E(f, f"{q.get('id')}: item yok")
                if "why_wrong" in q and len(q["why_wrong"]) != len(q.get("options", [])) - 1: E(f, f"{q.get('id')}: why_wrong sayısı")
        elif not 1 <= len(step_items) <= 8:
            W(f, f"gün başına {len(step_items)} birim (hedef 4–6)")
        for s in d.get("steps", []):
            if s["item"] not in items:
                E(f, f"{s['item']} items dosyasında yok")
            c = s.get("card") or {}
            if not c.get("example_en") or not c.get("example_tr"):
                E(f, f"{s['item']}: kartta example_en ve example_tr olmalı")
            for role in ("kullan", "sina", "tekrar"):
                if role not in s:
                    (W if role == "tekrar" else E)(f, f"{s['item']}: {role} yok")
                    continue
                check_q(f, s[role], role, prefix)
                if s[role]["id"] in ids:
                    E(f, f"tekrarlanan id {s[role]['id']}")
                ids.add(s[role]["id"])
        for k, v in (d.get("notifications") or {}).items():
            if len(v) > 90:
                E(f, f"bildirim {k} {len(v)} karakter (≤ 90)")
        check_mini(f, d, all_items, taught_by[(d["unit"], d["day"])])
        for t in d.get("tips", []):
            if t.get("type") not in {"hafiza_kancasi", "tuzak", "lgs_taktigi", "kelime_ailesi", "ilginc_bilgi", "mini_dilbilgisi"}:
                E(f, f"bilinmeyen ipucu türü {t.get('type')}")
    for m in errors + warns:
        print(m)
    print(f"\n{len(files)} hafif gün · {len(errors)} ENGEL, {len(warns)} UYARI")
    sys.exit(1 if errors else 0)


main()
