#!/usr/bin/env python3
"""Ünite kaynak dosyaları: doğrula + okunur .md üret.

Kullanım:
  python3 tools/kaynak_tool.py            # tüm units/unit_XX_kaynak.yaml → doğrula + units/unit_XX_kaynak.md
  python3 tools/kaynak_tool.py --check    # yalnız doğrula
Gerekli: pyyaml, jsonschema. Items dosyaları: ../lgs-pilot/content/unit_XX_items.yaml (ya da --items DİZİN)
"""
import re, sys, argparse
from pathlib import Path
import yaml
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parent.parent
ID = re.compile(r"U\d{1,2}-\d{3}")

def load(p):
    with open(p, encoding="utf-8") as f: return yaml.safe_load(f)

def all_ids(obj):
    if isinstance(obj, str): return set(ID.findall(obj)) if ID.fullmatch(obj.strip()) else set()
    if isinstance(obj, dict): return set().union(*[all_ids(v) for v in obj.values()]) if obj else set()
    if isinstance(obj, list): return set().union(*[all_ids(v) for v in obj]) if obj else set()
    return set()

def md(doc, items):
    D = lambda i: f"{items[i]['display']}" if i in items else i
    L = []; a = L.append
    a(f"# Ünite {doc['unit']} · {doc['title']} — kaynak dosyası ({doc['status']})\n")
    if doc.get("summary_tr"): a(doc["summary_tr"].strip() + "\n")
    c = doc["curriculum"]
    a("## 1. Müfredat\n")
    a("| Kod | Kazanım |\n|---|---|")
    for o in c["outcomes"]: a(f"| {o['code']} | {o['text_tr']} |")
    a("\n### İşlevler\n")
    for f in c["functions"]:
        a(f"**{f['id']} · {f['name_tr']}** (LGS ağırlığı: {f['lgs_weight']})")
        a("- Kalıplar: " + " · ".join(f"*{e}*" for e in f["exponents"]))
        if f.get("responses"): a("- Cevaplar: " + " · ".join(f"*{e}*" for e in f["responses"]))
        if f.get("items"): a("- Birimler: " + ", ".join(D(i) for i in f["items"]))
        if f.get("note_tr"): a(f"- Not: {f['note_tr']}")
        a("")
    t = doc["tasnif"]
    a("## 2. Tasnif\n")
    a(f"Öğretim birimi: **{t['teaching_units']}** · birimler: `{t['items_file']}`\n")
    a("| Sınıf | Sayı |\n|---|---|")
    for k, v in t["counts"].items(): a(f"| {k} | {v} |")
    for r in t.get("rules_tr", []): a(f"- {r}")
    for k, v in (t.get("excluded_examples") or {}).items():
        if v: a(f"- **{k}**: {', '.join(v)}")
    a("\n### Temalar\n")
    for th in doc["themes"]:
        a(f"- **{th['name']}** ({len(th['items'])}): " + ", ".join(D(i) for i in th["items"]) + (f" — {th['note_tr']}" if th.get("note_tr") else ""))
    a("\n## 3. Dilbilgisi\n")
    for g in doc["grammar"]:
        a(f"### {g['id']} · {g['name_tr']}\n")
        a(f"`{g['form']}`\n")
        if g.get("explain_tr"): a(g["explain_tr"].strip() + "\n")
        for e in g["examples"]: a(f"- *{e}*")
        if g.get("common_errors"):
            a("\n| Yanlış | Doğru | Neden |\n|---|---|---|")
            for e in g["common_errors"]: a(f"| ~~{e['wrong']}~~ | {e['right']} | {e.get('why_tr','')} |")
        a(f"\n> **LGS:** {g['lgs_note']}\n")
    a("## 4. İfadeler\n")
    a("| İngilizce | Türkçe | Ne zaman | Cevap |\n|---|---|---|---|")
    for e in doc["expressions"]: a(f"| {e['en']} | {e['tr']} | {e['use']} | {' / '.join(e.get('reply', []))} |")
    if doc.get("collocations"):
        a("\n## 5. Eşdizimler\n")
        for c_ in doc["collocations"]: a(f"- **{D(c_['item'])}**: " + " · ".join(c_["pairs"]))
    if doc.get("word_families"):
        a("\n## 6. Kelime aileleri\n")
        for w in doc["word_families"]: a(f"- **{w['root']}**: " + " · ".join(f"{x['form']} ({x['pos']}, {x['tr']})" for x in w["forms"]))
    if doc.get("synonym_sets") or doc.get("opposites"):
        a("\n## 7. Eşanlamlılar ve karşıtlar\n")
        for s in doc.get("synonym_sets", []): a(f"- {' / '.join(s['words'])}: {s['difference_tr']}")
        for o in doc.get("opposites", []): a(f"- {o['a']} ↔ {o['b']}" + (f" ({o['note_tr']})" if o.get("note_tr") else ""))
    a("\n## 8. Tuzaklar\n")
    a("| Konu | Tür | Tuzak | İpucu |\n|---|---|---|---|")
    for x in doc["traps"]: a(f"| {x['about']} | {x.get('kind','')} | {x['trap_tr']} | {x['tip_tr']} |")
    lf = doc["lgs_focus"]
    a("\n## 9. LGS odağı\n")
    a("**Ne soruluyor?**\n"); [a(f"- {w}") for w in lf["what_is_tested"]]
    a("\n**En kritik birimler:** " + ", ".join(D(i) for i in lf["priority_items"]) + "\n")
    a("### Soru kalıpları (özgün örnekler, ilk şık doğru)\n")
    for q in lf["question_patterns"]:
        a(f"**{q['type']}** — {q['description_tr']}\n")
        a(f"> {q['sample_stem']}")
        for k, o in enumerate(q.get("sample_options", [])): a(f">  {'ABCD'[k]}) {o}{'  ✓' if k == 0 else ''}")
        a(f"\nÇeldirici mantığı: {q['distractor_logic_tr']}\n")
    a("### Taktikler\n"); [a(f"- {x}") for x in lf["tactics"]]
    if lf.get("exam_vocabulary"):
        a("\n### Soru kökü kelimeleri\n"); a(" · ".join(f"*{e['en']}* = {e['tr']}" for e in lf["exam_vocabulary"]))
    if doc.get("cross_unit"):
        a("\n## 10. Ünitelerarası bağlar\n")
        for x in doc["cross_unit"]: a(f"- {x['item']} → {x['links_to']}: {x['note_tr']}")
    a("\n## 11. Hikâye kancaları\n")
    for s in doc["story_hooks"]:
        a(f"- {s['situation_tr']}  \n  Birimler: {', '.join(D(i) for i in s['items'])}" + (f"  \n  Espri: {s['comedy_tr']}" if s.get("comedy_tr") else ""))
    if doc.get("mini_lessons"):
        a("\n## 12. Hap bilgiler\n")
        for m in doc["mini_lessons"]: a(f"- **{m['type']}**: {m['text_tr']}")
    if doc.get("phrase_bank"):
        a("\n## 13. Kalıp cümle havuzu (ders kitabı)\n")
        a("Öğretim birimi sayılmaz; sahne diyaloglarında ve soru köklerinde kullanılır.\n")
        cur = None
        for x in doc["phrase_bank"]:
            if x.get("function") != cur:
                cur = x.get("function"); a(f"\n**{cur}**\n")
            a(f"- *{x['en']}* — {x['tr']}" + (f"  ({', '.join(D(i) for i in x['items'])})" if x.get("items") else ""))
    if doc.get("sources"):
        a("\n## Kaynaklar\n"); [a(f"- {s['code']}: {s['name']}" + (f" ({s['rows']} satır)" if s.get("rows") else "")) for s in doc["sources"]]
    if doc.get("open_questions"):
        a("\n## Açık sorular\n"); [a(f"- {q}") for q in doc["open_questions"]]
    return "\n".join(L) + "\n"

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--check", action="store_true")
    ap.add_argument("--items", default=str(ROOT.parent / "lgs-pilot/content"))
    A = ap.parse_args()
    items = {}
    for f in sorted(Path(A.items).glob("unit_*_items.yaml")):
        for i in load(f)["items"]: items[i["id"]] = i
    V = Draft202012Validator(load(ROOT / "schema/unit_kaynak.schema.yaml"))
    bad = 0
    for f in sorted((ROOT / "units").glob("unit_*_kaynak.yaml")):
        doc = load(f)
        errs = [f"{'/'.join(map(str, e.path))}: {e.message}" for e in V.iter_errors(doc)]
        unknown = sorted(i for i in all_ids(doc) if i not in items)
        own = {i for i, it in items.items() if it["unit"] == doc.get("unit")}
        missing = sorted(own - all_ids(doc.get("themes", [])))
        for e in errs: print(f"ENGEL | {f.name} | şema | {e}")
        for i in unknown: print(f"ENGEL | {f.name} | id | bilinmeyen {i}")
        for i in missing: print(f"UYARI | {f.name} | tema | {i} hiçbir temada yok")
        bad += len(errs) + len(unknown)
        if not errs and not A.check:
            f.with_suffix(".md").write_text(md(doc, items), encoding="utf-8")
            print(f"ok    | {f.name} → {f.with_suffix('.md').name}")
    if not A.check: sinav_dili_md()
    sys.exit(1 if bad else 0)



def sinav_dili_md():
    p = ROOT / "exam/sinav_dili.yaml"
    if not p.exists(): return
    d = load(p); L = []; a = L.append
    a("# Sınav Dili — LGS İngilizce soru kökleri\n")
    a("Kelime ünitelerinden bağımsız modül. Örnek sorular özgündür; ✓ doğru cevap.\n")
    a("## Sınav hakkında\n"); [a(f"- {x}") for x in d["exam_facts"]]
    a("\n## Soru kökleri\n")
    for s in d["stems"]:
        a(f"### {s['id']} · {s['en']}\n")
        a(f"**{s['tr']}** · tür: `{s['question_type']}` · üniteler: {', '.join(map(str, s['units']))}\n")
        if s.get("variants"): a("Diğer biçimler: " + " · ".join(f"*{v}*" for v in s["variants"]) + "\n")
        a(f"- Ne sorar: {s['asks_tr']}\n- Taktik: {s['strategy_tr']}\n- Tuzak: {s['traps_tr']}\n")
        ex = s["example"]
        a("> " + ex["context"].replace("\n", "  \n> "))
        for k, o in enumerate(ex["options"]): a(f">  {'ABCD'[k]}) {o}{'  ✓' if k == ex['answer'] else ''}")
        a(f"\n{ex['explain_tr']}\n")
    a("## Taktikler\n"); [a(f"{i}. {t['tr']}") for i, t in enumerate(d["tactics"], 1)]
    a("\n## Soru kökü kelimeleri\n"); a("| İngilizce | Türkçe |\n|---|---|"); [a(f"| {v['en']} | {v['tr']} |") for v in d["exam_vocabulary"]]
    t = d["track"]; a(f"\n## Mini ders yolu: {t['name']}\n"); a(t["design_tr"].strip() + "\n")
    a("| # | Ders | Kökler | Açılış |\n|---|---|---|---|"); [a(f"| {l['sira']} | {l['title']} | {', '.join(l['stems'])} | {l['unlock_after']} |") for l in t["lessons"]]
    ids = {s["id"] for s in d["stems"]}
    for l in t["lessons"]:
        for x in l["stems"]: assert x in ids, x
    for s in d["stems"]:
        e = s["example"]; assert e["answer"] == 0 and 3 <= len(e["options"]) <= 4 and len(set(e["options"])) == len(e["options"]), s["id"]
    (ROOT / "exam/sinav_dili.md").write_text("\n".join(L) + "\n", encoding="utf-8"); print("ok    | sinav_dili.yaml → sinav_dili.md")

if __name__ == "__main__":
    main()
