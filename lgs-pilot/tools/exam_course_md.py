#!/usr/bin/env python3
"""Sınav Dili ek dersini tek okunur .md dosyasına çevirir."""
import yaml
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
L = ["# LGS Sınav Dili — ek ders (taslak)\n", "Doğru cevap her zaman A şıkkıdır (✓); uygulama şıkları karıştırır.\n"]
mods = {"A": "Modül A — Soru kökleri", "B": "Modül B — İşleve göre kalıp ifadeler", "C": "Modül C — Soru tipi atölyesi"}
cur = None
def q(x, a):
    if x.get("context"): a("> " + x["context"].replace("\n", "  \n> "))
    a(f"\n**{x['prompt']}**" + (f" `{x['stem_id']}`" if x.get("stem_id") else ""))
    for k, o in enumerate(x["options"]): a(f"- {'ABCD'[k]}) {o}{' ✓' if k == 0 else ''}")
    a(f"\n_{x['explain_tr']}_\n")
for f in sorted((ROOT / "content/exam_course").glob("sd_*.yaml")):
    d = yaml.safe_load(open(f)); a = L.append
    if d["module"] != cur: cur = d["module"]; a(f"\n## {mods[cur]}\n")
    a(f"### {d['id']} · {d['title']}  \n_Açılış: {d['unlock_after']} · {d['minutes']} dk_\n")
    a(d["intro_tr"] + "\n")
    for c in d["cards"]:
        a(f"**{c['title_tr']}** — {c['body_tr']}")
        for e in c.get("examples_en", []): a(f"- *{e}*")
        a("")
    a("**Çözümlü örnek**\n"); q(d["worked_example"], a)
    a("**Alıştırma**\n")
    for i, x in enumerate(d["practice"], 1): a(f"{i}."); q(x, a)
    a("**Taktik:** " + " · ".join(d["tips"]) + "\n")
(ROOT / "content/exam_course/SINAV_DILI_DERSLERI.md").write_text("\n".join(L), encoding="utf-8"); print("ok")
