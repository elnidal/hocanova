#!/usr/bin/env python3
"""Sınav Dili ek dersi doğrulayıcı: şema, id tekilliği, şık tekrarı, birim/stem varlığı."""
import re, sys, yaml
from pathlib import Path
from jsonschema import Draft202012Validator
ROOT = Path(__file__).resolve().parent.parent
V = Draft202012Validator(yaml.safe_load(open(ROOT / "schema/exam_lesson.schema.yaml")))
items = {i["id"] for f in (ROOT / "content").glob("unit_*_items.yaml") for i in yaml.safe_load(open(f))["items"]}
stems = {s["id"] for s in yaml.safe_load(open(ROOT.parent / "lgs-kaynak/exam/sinav_dili.yaml"))["stems"]}
bad = 0; ids = set(); n = 0
for f in sorted((ROOT / "content/exam_course").glob("sd_*.yaml")):
    d = yaml.safe_load(open(f)); n += 1
    for e in V.iter_errors(d): print(f"ENGEL | {f.name} | şema | {'/'.join(map(str,e.path))}: {e.message}"); bad += 1
    if f.stem.upper().replace("SD_", "SD-") != d.get("id"): print(f"ENGEL | {f.name} | id dosya adıyla uyuşmuyor"); bad += 1
    for q in [d.get("worked_example", {})] + d.get("practice", []):
        if not q: continue
        if q.get("id") in ids: print(f"ENGEL | {f.name} | tekrarlanan id {q['id']}"); bad += 1
        ids.add(q.get("id"))
        if len(set(q.get("options", []))) != len(q.get("options", [])): print(f"ENGEL | {f.name} | {q['id']} aynı şık"); bad += 1
        if q.get("stem_id") and q["stem_id"] not in stems: print(f"ENGEL | {f.name} | {q['id']} bilinmeyen stem"); bad += 1
        for i in q.get("items", []):
            if i not in items: print(f"ENGEL | {f.name} | {q['id']} bilinmeyen birim {i}"); bad += 1
print(f"\n{n} ders · {len(ids)} soru · {bad} ENGEL"); sys.exit(1 if bad else 0)
