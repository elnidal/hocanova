"""Hafif mod günlerinin doğrulayıcısı (hikâyesiz): python3 lgs-pilot/tools/light_validate.py
Denetler: zorunlu alanlar, birimler items dosyasında var mı, id biçimi, answer: 0, şık sayısı/tekrarı,
İngiliz yazımı, Present Perfect şüphesi (UYARI), bildirim ≤ 90, Sına'da LGS işaretleri, her birimin kart+kullan+sına'sı."""
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
    if not re.fullmatch(rf"{day_prefix}-\d{{3}}-{'k' if role == 'kullan' else 's'}", qid):
        E(f, f"{qid}: id biçimi {day_prefix}-NNN-{'k' if role == 'kullan' else 's'} olmalı")
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
    if role == "sina":
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


def main():
    files = sorted(glob.glob(os.path.join(ROOT, "content", "light", "u*_day_*.yaml")))
    ids = set()
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
        if not 1 <= len(step_items) <= 8:
            W(f, f"gün başına {len(step_items)} birim (hedef 4–6)")
        for s in d.get("steps", []):
            if s["item"] not in items:
                E(f, f"{s['item']} items dosyasında yok")
            c = s.get("card") or {}
            if not c.get("example_en") or not c.get("example_tr"):
                E(f, f"{s['item']}: kartta example_en ve example_tr olmalı")
            for role in ("kullan", "sina"):
                if role not in s:
                    E(f, f"{s['item']}: {role} yok")
                    continue
                check_q(f, s[role], role, prefix)
                if s[role]["id"] in ids:
                    E(f, f"tekrarlanan id {s[role]['id']}")
                ids.add(s[role]["id"])
        for k, v in (d.get("notifications") or {}).items():
            if len(v) > 90:
                E(f, f"bildirim {k} {len(v)} karakter (≤ 90)")
        for t in d.get("tips", []):
            if t.get("type") not in {"hafiza_kancasi", "tuzak", "lgs_taktigi", "kelime_ailesi", "ilginc_bilgi", "mini_dilbilgisi"}:
                E(f, f"bilinmeyen ipucu türü {t.get('type')}")
    for m in errors + warns:
        print(m)
    print(f"\n{len(files)} hafif gün · {len(errors)} ENGEL, {len(warns)} UYARI")
    sys.exit(1 if errors else 0)


main()
