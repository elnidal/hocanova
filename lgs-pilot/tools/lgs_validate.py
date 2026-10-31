#!/usr/bin/env python3
"""Hikayenglish LGS pilot doğrulayıcı.

Kullanım:  python3 tools/lgs_validate.py
Gerekli: pyyaml, jsonschema · ENGEL varsa çıkış kodu 1.
"""
import re
import sys
from pathlib import Path

import yaml
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parent.parent
TOKEN = re.compile(r"\{(U\d{1,2}-\d{3})(?:\|([^}]+))?\}")
EN = re.compile(r"<en>(.*?)</en>", re.S)
TR = "a-zçğıöşü"

def load(p):
    with open(p, encoding="utf-8") as f:
        return yaml.safe_load(f)

def low(s):
    return s.replace("I", "ı").replace("İ", "i").lower()

rows = []
def engel(where, rule, msg): rows.append(("ENGEL", where, rule, msg))
def uyari(where, rule, msg): rows.append(("UYARI", where, rule, msg))

def questions_of(doc):
    for st in doc.get("steps", []):
        for k in ("sezdir", "kullan", "sina"):
            yield st["item"], k, st[k]
    for q in doc.get("review", []):
        yield q.get("item"), "review", q

def check_question(where, q, ids_seen):
    if q["id"] in ids_seen: engel(where, "SORU", f"tekrarlanan soru id {q['id']}")
    ids_seen.add(q["id"])
    if q["answer"] >= len(q["options"]): engel(where, "SORU", f"{q['id']}: cevap indeksi dışarıda")
    if len(set(q["options"])) != len(q["options"]): engel(where, "SORU", f"{q['id']}: aynı şık iki kez")
    if "why_wrong" in q and len(q["why_wrong"]) != len(q["options"]) - 1:
        engel(where, "SORU", f"{q['id']}: why_wrong {len(q['why_wrong'])} açıklama, yanlış şık {len(q['options']) - 1}")

def main():
    items = {}
    for uf in sorted((ROOT / "content").glob("unit_*_items.yaml")):
        for i in load(uf)["items"]: items[i["id"]] = i
    G = {i["id"]: i["unit"] * 1000 + i["pilot_day"] for i in items.values() if "pilot_day" in i}   # genel öğretim sırası
    schema = Draft202012Validator(load(ROOT / "schema/lgs_day.schema.yaml"))
    ids_seen = set()
    docs = {}
    for f in sorted((ROOT / "content/days").glob("u*_day_*.yaml")):
        doc = load(f)
        d = doc.get("day"); U = doc.get("unit")
        W = f"Ü{U} Gün {d}"
        g_doc = (U or 0) * 1000 + (d or 0)
        pilot_day = {i: it["pilot_day"] for i, it in items.items() if it.get("unit") == U and "pilot_day" in it}
        errs = list(schema.iter_errors(doc))
        for e in errs: engel(W, "ŞEMA", f"{'/'.join(map(str, e.path))}: {e.message}")
        if errs: continue
        docs[d] = doc
        story_txt = [l["text"] for l in doc["story"]]
        mini = doc.get("mini", [])
        mini_txt = [l["text"] for m in mini for l in m["lines"]] + [m.get("durum", "") for m in mini]
        full = " ".join(story_txt + mini_txt)
        if mini:  # mini sahne denemesi: her yeni birimin kendi sahnesi olmalı ve birim orada geçmeli
            for i in doc["new_items"]:
                m = next((x for x in mini if x["item"] == i), None)
                if not m: engel(W, "MİNİ", f"{items[i]['display']} için mini sahne yok")
                elif not any(re.search(r"\{" + i + r"[}|]", l["text"]) for l in m["lines"]): engel(W, "MİNİ", f"{items[i]['display']} kendi mini sahnesinde geçmiyor")

        # yeni birimler
        exp = sorted(i for i, pd in pilot_day.items() if pd == d)
        if sorted(doc["new_items"]) != exp: engel(W, "BİRİM", f"new_items {doc['new_items']} ≠ pilot_day {exp}")
        if sorted(s["item"] for s in doc["steps"]) != sorted(doc["new_items"]): engel(W, "ADIM", "her yeni birim için bir steps kaydı olmalı")

        # belirteçler
        for txt in story_txt + mini_txt + [l["text"] for l in doc.get("scene", [])]:
            for m in TOKEN.finditer(txt):
                i = m.group(1)
                if i not in items: engel(W, "BELİRTEÇ", f"bilinmeyen {i}")
                elif i not in G: engel(W, "BELİRTEÇ", f"{i} ({items[i]['display']}) öğretim planında yok; belirteç yerine düz metin kullan")
                elif G[i] > g_doc: engel(W, "BELİRTEÇ", f"{i} ({items[i]['display']}) henüz öğretilmedi")

        # tekrar sayısı (≥3 ayrı satır)
        for i in doc["new_items"]:
            k = sum(1 for t in story_txt if re.search(r"\{" + i + r"[}|]", t))
            if k < 3: engel(W, "TEKRAR", f"{items[i]['display']} hikâyede {k} satırda (≥3)")

        # çeviri yasağı: yeni birimler + hikâyede geçen eski birimler
        pre = " ".join([doc["title"], doc["coach"]["start"], doc["notifications"]["morning"], doc["notifications"]["evening"]])
        plain = low(TOKEN.sub(" ", EN.sub(" ", full + " " + pre)))
        present = set(TOKEN.findall(full) and [m.group(1) for m in TOKEN.finditer(full)])
        for i in present:
            if i not in items: continue
            # ban_tr: açık yasak listesi (regex) · meaning_ban: açık yasak listesi (düz metin) · yoksa meaning_tr parçaları
            if items[i].get("ban_tr"): pats = [low(b) for b in items[i]["ban_tr"]]
            elif items[i].get("meaning_ban"): pats = [re.escape(low(b)) for b in items[i]["meaning_ban"]]
            else:
                pats = []
                for part in re.split(r"[,/;]", re.sub(r"\(.*?\)", "", items[i]["meaning_tr"])):
                    p = re.sub(r"^-", "", low(part.replace("…", "").replace("?", "").replace(".", "").strip()))
                    if len(p) >= 3: pats.append(re.escape(p))
            for p in pats:
                m = re.search(r"(?<![" + TR + r"])" + p, plain)
                if m:
                    uyari(W, "ÇEVİRİ", f"{items[i]['display']} karşılığı \"{m.group(0)}\" hikâyede geçiyor olabilir")

        # belirteç dışında BÜYÜK HARFLİ İngilizce
        bare = TOKEN.sub("", EN.sub("", full))
        for w in set(re.findall(r"\b[A-Z]{3,}\b", bare)):
            uyari(W, "BELİRTEÇSİZ", f"büyük harfli kelime belirteçsiz: {w}")

        # tekrar takvimi: d-1 → hatırlama sorusu · d-3 → yeni bağlamda (hikâyede) geçmeli
        rev_items = {q.get("item") for q in doc.get("review", [])}
        for i, pd in pilot_day.items():
            if pd == d - 1 and i not in rev_items:
                uyari(W, "TAKVİM", f"{items[i]['display']} (Gün {pd}) için hatırlama sorusu yok")
            if pd == d - 3 and not re.search(r"\{" + i + r"[}|]", full):
                uyari(W, "TAKVİM", f"{items[i]['display']} (Gün {pd}) bugünün hikâyesinde yeni bağlamda geçmiyor")
        for back, need in ((7, 3), (14, 2)):
            pool = [i for i, pd in pilot_day.items() if pd == d - back]
            got = [q for q in doc.get("review", []) if q.get("item") in pool and q.get("lgs_like")]
            if pool and len(got) < min(need, len(pool)):
                uyari(W, "TAKVİM", f"Gün {d-back} birimlerinden en az {need} LGS tarzı tekrar sorusu bekleniyor ({len(got)} var, lgs_like: true)")
        for q in doc.get("review", []):
            it = q.get("item")
            if not it: engel(W, "TEKRAR", f"{q['id']}: review sorusunda item zorunlu")
            elif it not in G or G[it] >= g_doc: engel(W, "TEKRAR", f"{q['id']}: {it} henüz öğretilmedi")

        # sorular
        for it, kind, q in questions_of(doc):
            check_question(W, q, ids_seen)
            if kind == "sezdir":
                if q["type"] != "meaning" or "context" not in q: engel(W, "SEZDİR", f"{q['id']}: meaning + context gerekli")
                else:
                    line = next((l["text"] for l in doc["story"] if l["id"] == q["context"]), "")
                    if not re.search(r"\{" + it + r"[}|]", line): engel(W, "SEZDİR", f"{q['id']}: bağlam satırında birim yok")
            if kind in ("kullan", "sina") and "<en>" not in (q.get("stem") or q.get("prompt") or ""):
                uyari(W, "DİL", f"{q['id']}: Kullan/Sına sorusunun metni İngilizce olmalı")

        # hap bilgiler
        for t in doc.get("tips", []):
            for r in t["refs"]:
                if r not in items: engel(W, "HAP", f"bilinmeyen ref {r}")
                elif G.get(r, 10**6) > g_doc: uyari(W, "HAP", f"ref {r} henüz öğretilmedi")
        if len(doc.get("tips", [])) < 1: uyari(W, "HAP", "hap bilgi yok")

    # testler
    tdir = ROOT / "content/tests"
    for f in sorted(tdir.glob("*.yaml")):
        doc = load(f)
        for sec in doc.get("sections", []):
            for q in sec.get("questions", []):
                check_question(f.name, q, ids_seen)
                if q.get("item") and q["item"] not in items: engel(f.name, "TEST", f"{q['id']}: bilinmeyen {q['item']}")

    if not rows: print("Bulgu yok ✓")
    for r in rows: print(f"{r[0]:5} | {r[1]} | {r[2]:10} | {r[3]}")
    print(f"\nToplam: {sum(r[0]=='ENGEL' for r in rows)} ENGEL, {sum(r[0]=='UYARI' for r in rows)} UYARI")
    sys.exit(1 if any(r[0] == "ENGEL" for r in rows) else 0)

if __name__ == "__main__":
    main()
