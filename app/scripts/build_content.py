"""YAML içeriği uygulamanın okuyacağı JSON'a çevirir.
Kullanım (repo kökünden): python3 app/scripts/build_content.py
Çıktı: app/public/content/index.json + unit_XX.json (ünite başına tembel yüklenir)
"""
import glob, json, os, yaml
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
C = os.path.join(ROOT, "lgs-pilot", "content")
OUT = os.path.join(ROOT, "app", "public", "content")
L = lambda p: yaml.safe_load(open(p, encoding="utf-8"))
GLOSS = L(os.path.join(C, "gloss_tr.yaml")) or {}  # hikâyede ilk geçişte gösterilen kısa Türkçe karşılıklar
def dump(name, obj):
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))
os.makedirs(OUT, exist_ok=True)
for old in glob.glob(os.path.join(OUT, "*.json")):
    os.remove(old)
units = []
for u in range(1, 11):
    it = L(os.path.join(C, f"unit_{u:02d}_items.yaml"))
    days = [L(d) for d in sorted(glob.glob(os.path.join(C, "days", f"u{u:02d}_day_*.yaml")))]
    days += [L(d) for d in sorted(glob.glob(os.path.join(C, "light", f"u{u:02d}_day_*.yaml")))]  # hafif mod (hikâyesiz)
    days.sort(key=lambda d: d["day"])
    for i in it["items"]:
        if i["id"] in GLOSS:
            i["gloss_tr"] = GLOSS[i["id"]]
    dump(f"unit_{u:02d}.json", {"unit": u, "title": it["unit_title"], "items": it["items"], "days": days})
    units.append({"unit": u, "title": it["unit_title"], "itemCount": len(it["items"]), "dayCount": len(days)})
# Sınav Dili ek dersi: kilit etiketi ("Ü1 G3" / "Ü1 sonu") sayıya çevrilir, derslerin açılma sırasına dizilir.
import re
def unlock(t):
    m = re.match(r"Ü(\d+)\s+(?:G(\d+)|sonu)", t or "")
    return {"unit": int(m.group(1)), "day": int(m.group(2)) if m.group(2) else None, "label": t} if m else None
exam = []
for f in sorted(glob.glob(os.path.join(C, "exam_course", "sd_*.yaml"))):
    d = L(f)
    d["unlock"] = unlock(d.pop("unlock_after", None))
    exam.append(d)
exam.sort(key=lambda d: (d["unlock"]["unit"], d["unlock"]["day"] or 999, d["id"]) if d["unlock"] else (99, 0, d["id"]))
dump("exam_course.json", exam)
dump("index.json", {
    "units": units,
    "placement": L(os.path.join(C, "tests", "placement.yaml")),
    "unit_check": L(os.path.join(C, "tests", "unit_check.yaml")),
    "retention": L(os.path.join(C, "tests", "retention_checks.yaml")),
    "coach": L(os.path.join(C, "coach.yaml")),
})
print("ok", [(x["unit"], x["itemCount"], x["dayCount"]) for x in units], "sınav dili:", len(exam))
