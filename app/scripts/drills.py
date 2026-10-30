"""Kelimeyi her yönüyle soran alıştırma soruları (build_content.py çağırır).

Elle yazılmaz; items + ünite kaynak dosyasından (word_families, opposites, synonym_sets) üretilir.
Tipler (soru kimliği <ID>-<tip>):
  anlam  İngilizce ifade → Türkçe anlam
  ceviri Türkçe anlam → İngilizce ifade (çeldiriciler önce aynı kelime ailesinden)
  dinle  sesi dinle → yazılışını seç (q.listen)
  zit    zıt anlamlısını seç (yalnız kaynakta karşıtı olan kelimeler)
Kurallar: doğru cevap options[0], answer 0; 4 şık. Çeldirici seçimi kelime kimliğiyle tohumlanır, her derlemede aynı çıkar.
Tek savunulabilir cevap için: aynı eş anlamlı grubundaki ve anlamı ortak kök taşıyan ifadeler çeldirici olamaz.
"""
import random, re

def _roots(text):
    """Anlamdaki 4+ harfli kelimelerin ilk 5 harfi: 'pişirmek' ile 'pişirme' aynı kök sayılır."""
    return {w[:5] for w in re.findall(r"[a-zçğıöşü]+", (text or "").lower()) if len(w) >= 4}

def _norm(s):
    return re.sub(r"[^a-z' ]", "", (s or "").lower()).strip()

def _first(display):
    """Eş anlamlı grupta ('delicious / tasty / yummy') dinleme sorusu ilk biçimi okur."""
    return display.split(" / ")[0].strip()

def build(items, kaynak):
    by_id = {i["id"]: i for i in items}
    by_display = {_norm(i["display"]): i for i in items}
    # aynı eş anlamlı grubundakiler birbirinin çeldiricisi olamaz
    syn = {}
    for s in (kaynak or {}).get("synonym_sets") or []:
        group = {by_display[_norm(w)]["id"] for w in s.get("words", []) if _norm(w) in by_display} | set(s.get("items") or [])
        for i in group:
            syn.setdefault(i, set()).update(group)
    family = {}  # item id → aynı ailedeki diğer biçimler [(form, tr)]
    for f in (kaynak or {}).get("word_families") or []:
        forms = [x for x in f.get("forms", []) if x.get("form") and x.get("tr")]
        for x in forms:
            if x.get("item") in by_id:
                family[x["item"]] = [(y["form"], y["tr"]) for y in forms if y is not x and _norm(y["form"]) != _norm(x["form"])]

    def ok_pair(a, b):
        return (a["id"] != b["id"] and b["id"] not in syn.get(a["id"], ())
                and _norm(a["display"]) != _norm(b["display"])
                and not (_roots(a["meaning_tr"]) & _roots(b["meaning_tr"])))

    def others(it, rng, n=3):
        pool = [x for x in items if x["kind"] == it["kind"] and ok_pair(it, x)]
        if len(pool) < n:  # az sayıda kalıp/tuzak olan ünitelerde türü gevşet
            pool += [x for x in items if x["kind"] != it["kind"] and ok_pair(it, x)]
        rng.shuffle(pool)
        out = []
        for x in pool:  # çeldiriciler de birbirine çok benzemesin
            if all(ok_pair(x, y) for y in out):
                out.append(x)
            if len(out) == n:
                break
        return out

    drills = []
    for it in items:
        rng = random.Random(it["id"])
        dist = others(it, rng)
        if len(dist) < 3:
            continue
        en, tr = it["display"], it["meaning_tr"]
        drills.append({"id": f"{it['id']}-anlam", "item": it["id"], "type": "anlam",
                       "prompt": "Bu ifade ne anlama gelir?", "stem": f"<en>{en}</en>",
                       "options": [tr] + [d["meaning_tr"] for d in dist], "answer": 0,
                       "explain": f"{en} = {tr}"})
        fam = [(f, t) for f, t in family.get(it["id"], []) if not (_roots(t) & _roots(tr))]
        opts = [f for f, _ in fam][:2]
        opts += [d["display"] for d in dist if _norm(d["display"]) not in {_norm(o) for o in opts}][:3 - len(opts)]
        drills.append({"id": f"{it['id']}-ceviri", "item": it["id"], "type": "ceviri",
                       "prompt": "İngilizcesi hangisi?", "stem": tr,
                       "options": [en] + opts, "answer": 0,
                       "explain": f"{en} = {tr}" + (f". Aynı aileden: {', '.join(f'{f} = {t}' for f, t in fam[:2])}" if fam[:2] and opts[0] == fam[0][0] else "")})
        drills.append({"id": f"{it['id']}-dinle", "item": it["id"], "type": "dinle",
                       "prompt": "Dinle ve duyduğun ifadeyi seç.", "listen": _first(en),
                       "options": [_first(en)] + [_first(d["display"]) for d in dist], "answer": 0,
                       "explain": f"Duyduğun: {_first(en)} ({tr})"})
    for o in (kaynak or {}).get("opposites") or []:
        if re.search(r"zıt(ı)? yok", o.get("note_tr") or ""):  # tek bir karşıtı olmayan çiftler soru olmaz
            continue
        for a, b in ((o.get("a"), o.get("b")), (o.get("b"), o.get("a"))):
            it = by_display.get(_norm(a))
            if not it or not b:
                continue
            rng = random.Random(f"{it['id']}-zit")
            dist = [d["display"] for d in others(it, rng, 6) if _norm(d["display"]) not in (_norm(a), _norm(b))][:3]
            if len(dist) < 3:
                continue
            drills.append({"id": f"{it['id']}-zit", "item": it["id"], "type": "zit",
                           "prompt": "Zıt anlamlısı hangisi?", "stem": f"<en>{a}</en>",
                           "options": [b] + dist, "answer": 0,
                           "explain": o.get("note_tr") or f"{a} ↔ {b}"})
    out, seen = [], set()
    for q in drills:  # 4 farklı şık ve tekil kimlik yoksa soru düşer
        if q["id"] in seen or len({_norm(o) or o for o in q["options"]}) < 4:
            continue
        seen.add(q["id"])
        out.append(q)
    return out
