"""PWA simgelerini üretir (Pillow gerekir). Kullanım: python3 app/scripts/make_icons.py
Çıktı: app/public/icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png, favicon.svg
Tasarım geçicidir: mavi zeminde "HE" (E vurgulu, logodaki gibi). Gerçek logo gelince değiştir."""
import os
from PIL import Image, ImageDraw, ImageFont
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public")
FONT = "/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf"
BG, H_COL, E_COL = (59, 75, 216), (255, 255, 255), (255, 138, 117)

def icon(size, safe=1.0, rounded=True):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if rounded:
        d.rounded_rectangle((0, 0, size, size), radius=int(size * 0.22), fill=BG)
    else:
        d.rectangle((0, 0, size, size), fill=BG)
    f = ImageFont.truetype(FONT, int(size * 0.5 * safe))
    wh, we = d.textlength("H", font=f), d.textlength("E", font=f)
    x = (size - (wh + we)) / 2
    y = size * 0.5 - f.size * 0.56
    d.text((x, y), "H", font=f, fill=H_COL)
    d.text((x + wh, y), "E", font=f, fill=E_COL)
    return img

os.makedirs(OUT, exist_ok=True)
icon(192).save(os.path.join(OUT, "icon-192.png"))
icon(512).save(os.path.join(OUT, "icon-512.png"))
icon(512, safe=0.8, rounded=False).save(os.path.join(OUT, "icon-maskable-512.png"))
icon(180, rounded=False).convert("RGB").save(os.path.join(OUT, "apple-touch-icon.png"))
open(os.path.join(OUT, "favicon.svg"), "w").write(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#3B4BD8"/>'
    '<text x="32" y="44" font-family="Arial Rounded MT Bold,Arial,sans-serif" font-weight="800" font-size="32" text-anchor="middle">'
    '<tspan fill="#fff">H</tspan><tspan fill="#FF8A75">E</tspan></text></svg>')
print("ok")
