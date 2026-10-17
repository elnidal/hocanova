"""Prototip HTML'ini YAML içerikten üretir.
Kullanım (repo kökünden): python3 prototype/build_prototype.py
Çıktı: prototype/prototip_lgs.html  (template.html içindeki __DATA__ yerine JSON gömülür)
"""
import glob, json, os, yaml
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
C = os.path.join(ROOT, "lgs-pilot", "content")
L = lambda p: yaml.safe_load(open(p, encoding="utf-8"))
units = []
for u in range(1, 11):
    days = sorted(glob.glob(os.path.join(C, "days", f"u{u:02d}_day_*.yaml")))
    if not days:
        continue  # hikâyesi olmayan üniteler (şimdilik 7–10) prototipe girmez
    it = L(os.path.join(C, f"unit_{u:02d}_items.yaml"))
    units.append({"unit": u, "title": it["unit_title"], "items": it["items"], "days": [L(d) for d in days]})
data = {
    "units": units,
    "items": units[0]["items"],  # eski ekranlar için (Ünite 1)
    "placement": L(os.path.join(C, "tests", "placement.yaml")),
    "unit_check": L(os.path.join(C, "tests", "unit_check.yaml")),
    "retention": L(os.path.join(C, "tests", "retention_checks.yaml")),
    "coach": L(os.path.join(C, "coach.yaml")),
}
here = os.path.dirname(os.path.abspath(__file__))
t = open(os.path.join(here, "template.html"), encoding="utf-8").read()
out = os.path.join(here, "prototip_lgs.html")
open(out, "w", encoding="utf-8").write(t.replace("__DATA__", json.dumps(data, ensure_ascii=False), 1))
print("ok", out, [(x["unit"], len(x["days"])) for x in units])
