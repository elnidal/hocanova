import json, subprocess, sys, os, shutil
from pathlib import Path
from playwright.sync_api import sync_playwright

D = Path(__file__).parent
FPS = 30
data = json.load(open(D / "data.json"))
out = sys.argv[1] if len(sys.argv) > 1 else str(D / "reel.mp4")
frames = D / "frames"
shutil.rmtree(frames, ignore_errors=True); frames.mkdir()
html = (D / "reel.html").read_text().replace("__DATA__", json.dumps(data["words"], ensure_ascii=False))
(D / "_build.html").write_text(html)

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1080, "height": 1920})
    pg.goto((D / "_build.html").as_uri())
    pg.wait_for_timeout(300)
    total = pg.evaluate("TOTAL")
    n = int(total * FPS)
    for i in range(n):
        pg.evaluate(f"seek({i / FPS})")
        pg.screenshot(path=str(frames / f"f{i:05d}.jpg"), type="jpeg", quality=92)
    b.close()

# audio: ticks + ding per word
HOOK, PER = 2.6, 6.6
ev = []
for k in range(len(data["words"])):
    a = HOOK + k * PER
    ev += [("tick", a + 1.2), ("tick", a + 2.2), ("tick", a + 3.2), ("ding", a + 4.2)]
ev.append(("ding", total - 3.4))
a_dir = D / "aud"; a_dir.mkdir(exist_ok=True)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", "sine=f=1100:d=0.07", "-af", "afade=t=out:st=0.03:d=0.04,volume=0.5", str(a_dir / "tick.wav")], check=True)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", "sine=f=1318:d=0.5", "-f", "lavfi", "-i", "sine=f=1975:d=0.5",
                "-filter_complex", "amix=inputs=2,afade=t=out:st=0.05:d=0.45,volume=0.9", str(a_dir / "ding.wav")], check=True)
inputs, filt = [], []
for j, (kind, t) in enumerate(ev):
    inputs += ["-i", str(a_dir / f"{kind}.wav")]
    ms = int(t * 1000)
    filt.append(f"[{j+1}:a]adelay={ms}|{ms}[a{j}]")
mix = "".join(f"[a{j}]" for j in range(len(ev)))
fc = ";".join(filt) + f";{mix}amix=inputs={len(ev)}:normalize=0,apad[aout]"
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", str(frames / "f%05d.jpg"), *inputs,
                "-filter_complex", fc, "-map", "0:v", "-map", "[aout]", "-shortest",
                "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium", "-r", str(FPS),
                "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", out], check=True)
print("ok", out, n, "frames", round(total, 1), "s")
