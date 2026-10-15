"""Düğün temalı profil görselleri üretir (58 adet, 640x640 JPEG).

Gerçek kişi fotoğrafı içermez: yüzük, kalp, çiçek, davetiye, konfeti, dantel gibi
motiflerle zarif bir "düğün albümü" ızgarası oluşturur. Böylece profil hem temaya
uygun görünür hem de telif/kişilik hakkı sorunu doğmaz.

Kullanım:
    python tools/make-wedding-set.py
"""

from __future__ import annotations

import math
import os
import random

from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT_DIR = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "media"))
SIZE = 640
COUNT = 58

# --- paletler: (arka plan başı, arka plan sonu, vurgu, metin) ---------------
PALETTES = [
    ((247, 231, 228), (232, 180, 184), (183, 110, 121), (120, 62, 72)),    # blush
    ((250, 243, 224), (230, 211, 163), (201, 162, 39), (138, 106, 24)),    # krem/altın
    ((232, 239, 230), (185, 201, 177), (107, 143, 113), (66, 96, 72)),     # adaçayı
    ((230, 238, 245), (182, 201, 220), (91, 124, 153), (52, 78, 102)),     # dumanlı mavi
    ((246, 239, 233), (220, 201, 182), (169, 132, 103), (110, 80, 58)),    # şampanya
    ((243, 230, 233), (203, 176, 187), (123, 45, 66), (86, 28, 44)),       # bordo
]

WORDS_BY_MOTIF = [
    ["Düğün", "Nikâh", "Sonsuza dek", "Anılar"],          # yüzükler
    ["Aşk", "Mutluluk", "Aile", "Kalpler"],               # kalp
    ["Çiçek", "Buket", "Gelinlik", "Zeytin dalı"],        # çiçek dalı
    ["Kına", "Davetiye", "Kutlama", "Konfeti"],           # konfeti
    ["Nikâh", "Gelinlik", "Mekân", "Tak"],                # kemer
    ["Davetiye", "Kayıt", "Davet", "Zarf"],               # davetiye kartı
    ["Anılar", "Teşekkür", "Hatıra", "Albüm"],            # kurdele
    ["Balayı", "Mutluluk", "Sonsuza dek", "Yıldızlar"],   # parıltılar
]

FONT_CANDIDATES = [
    r"C:\Windows\Fonts\georgia.ttf",
    r"C:\Windows\Fonts\times.ttf",
    r"C:\Windows\Fonts\segoeui.ttf",
    r"C:\Windows\Fonts\arial.ttf",
]


def load_font(size: int):
    for path in FONT_CANDIDATES:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                pass
    return ImageFont.load_default()


def lerp(a, b, t):
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


def gradient(size, c0, c1, angle=45):
    """Yumuşak çapraz gradyan."""
    img = Image.new("RGB", (size, size))
    px = img.load()
    rad = math.radians(angle)
    dx, dy = math.cos(rad), math.sin(rad)
    for y in range(size):
        for x in range(size):
            t = (x * dx + y * dy) / (size * (abs(dx) + abs(dy)) or 1)
            px[x, y] = lerp(c0, c1, max(0.0, min(1.0, t)))
    return img


def vignette(img, strength=70):
    """Kenarları hafifçe karartan yumuşak çerçeve."""
    size = img.size[0]
    mask = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(mask)
    d.ellipse([-size * 0.25, -size * 0.25, size * 1.25, size * 1.25], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(size * 0.12))
    dark = Image.new("RGB", (size, size), (0, 0, 0))
    return Image.composite(img, Image.blend(img, dark, strength / 255), mask)


def paper_noise(img, amount=6):
    """Hafif kağıt dokusu."""
    size = img.size[0]
    rnd = random.Random(7)
    noise = Image.new("L", (size // 2, size // 2))
    noise.putdata([rnd.randint(120, 136) for _ in range((size // 2) ** 2)])
    noise = noise.resize((size, size), Image.BILINEAR)
    return Image.blend(img, Image.merge("RGB", (noise, noise, noise)), amount / 255)


def draw_rings(d, cx, cy, r, accent, w):
    d.ellipse([cx - r - r * 0.42, cy - r, cx + r * 0.58, cy + r], outline=accent, width=w)
    d.ellipse([cx - r * 0.58, cy - r, cx + r + r * 0.42, cy + r], outline=accent, width=w)


def draw_heart(d, cx, cy, s, color):
    """Parametrik kalp eğrisi — tam tur (0..2π) örneklenir."""
    pts = []
    steps = 360
    for i in range(steps + 1):
        t = 2 * math.pi * i / steps
        x = 16 * math.sin(t) ** 3
        y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        pts.append((cx + x * s / 17.0, cy - y * s / 17.0))
    d.polygon(pts, fill=color)


def draw_branch(d, cx, cy, s, color, accent):
    d.line([(cx - s, cy + s), (cx + s * 0.15, cy - s)], fill=color, width=max(2, int(s * 0.07)))
    for i in range(7):
        t = i / 6
        x = cx - s + (s * 1.15) * t
        y = cy + s - (s * 2) * t
        rr = s * (0.30 - 0.16 * t)
        side = -1 if i % 2 else 1
        d.ellipse([x + side * rr - rr, y - rr * 0.6, x + side * rr + rr, y + rr * 0.6], fill=color)
    for i in range(4):
        t = i / 3
        x = cx - s * 0.8 + s * 0.9 * t
        y = cy + s * 0.7 - s * 1.5 * t
        d.ellipse([x - s * 0.12, y - s * 0.12, x + s * 0.12, y + s * 0.12], fill=accent)


def draw_confetti(d, cx, cy, s, accent, rnd):
    for _ in range(46):
        x = rnd.uniform(cx - s, cx + s)
        y = rnd.uniform(cy - s, cy + s)
        r = rnd.uniform(s * 0.012, s * 0.045)
        col = lerp(accent, (255, 255, 255), rnd.uniform(0.0, 0.55))
        if rnd.random() < 0.5:
            d.ellipse([x - r, y - r, x + r, y + r], fill=col)
        else:
            d.line([(x, y), (x + r * 3.2, y + r * (1 if rnd.random() < 0.5 else -1))], fill=col, width=max(2, int(r)))


def draw_arch(d, cx, cy, s, accent, w):
    d.arc([cx - s, cy - s * 1.15, cx + s, cy + s * 0.85], start=180, end=360, fill=accent, width=w)
    d.line([(cx - s, cy - s * 0.15), (cx - s, cy + s)], fill=accent, width=w)
    d.line([(cx + s, cy - s * 0.15), (cx + s, cy + s)], fill=accent, width=w)
    # dantel noktaları
    for i in range(16):
        t = i / 15
        x = cx - s + 2 * s * t
        y = cy - s * 0.15 - math.sin(math.pi * t) * s * 0.85
        r = s * 0.028
        d.ellipse([x - r, y - r, x + r, y + r], fill=accent)


def draw_card(d, cx, cy, s, accent, word_font, text_color, border):
    box = [cx - s * 0.78, cy - s * 0.82, cx + s * 0.78, cy + s * 0.82]
    d.rounded_rectangle(box, radius=int(s * 0.06), fill=(255, 255, 255), outline=border, width=3)
    d.rounded_rectangle([box[0] + 12, box[1] + 12, box[2] - 12, box[3] - 12],
                        radius=int(s * 0.05), outline=accent, width=1)
    d.line([(cx - s * 0.42, cy - s * 0.05), (cx + s * 0.42, cy - s * 0.05)], fill=accent, width=2)
    d.line([(cx - s * 0.28, cy + s * 0.12), (cx + s * 0.28, cy + s * 0.12)], fill=accent, width=1)
    d.line([(cx - s * 0.34, cy + s * 0.28), (cx + s * 0.34, cy + s * 0.28)], fill=accent, width=1)
    d.ellipse([cx - s * 0.07, cy - s * 0.42, cx + s * 0.07, cy - s * 0.28], outline=accent, width=2)


def draw_ribbon(d, cx, cy, s, accent, word_font, text_color):
    band = [cx - s * 1.05, cy - s * 0.30, cx + s * 1.05, cy + s * 0.30]
    d.polygon([(band[0], band[1]), (band[2], band[1] + s * 0.06), (band[2], band[3]),
               (band[0], band[3] + s * 0.06)], fill=accent)
    d.polygon([(band[0], band[1]), (band[0] - s * 0.22, band[1] + s * 0.12),
               (band[0] - s * 0.22, band[3] - s * 0.06), (band[0], band[3])], fill=lerp(accent, (0, 0, 0), 0.25))
    d.polygon([(band[2], band[1] + s * 0.06), (band[2] + s * 0.22, band[1] + s * 0.18),
               (band[2] + s * 0.22, band[3]), (band[2], band[3])], fill=lerp(accent, (0, 0, 0), 0.25))


def draw_sparkles(d, cx, cy, s, accent, rnd):
    for _ in range(18):
        x = rnd.uniform(cx - s, cx + s)
        y = rnd.uniform(cy - s, cy + s)
        r = rnd.uniform(s * 0.05, s * 0.15)
        col = lerp(accent, (255, 255, 255), rnd.uniform(0, 0.5))
        d.line([(x - r, y), (x + r, y)], fill=col, width=3)
        d.line([(x, y - r), (x, y + r)], fill=col, width=3)


def make_image(index: int) -> Image.Image:
    p0, p1, accent, text_color = PALETTES[index % len(PALETTES)]
    rnd = random.Random(index * 977 + 13)
    img = gradient(SIZE, p0, p1, angle=38 + (index % 5) * 12)
    d = ImageDraw.Draw(img)

    cx = cy = SIZE / 2
    s = SIZE * 0.30
    w = max(3, int(SIZE * 0.012))
    motif = index % 8

    # motifin arkasına yumuşak beyaz ışık (kontrast için)
    glow = Image.new("L", (SIZE, SIZE), 0)
    ImageDraw.Draw(glow).ellipse([cx - s * 1.35, cy - s * 1.25, cx + s * 1.35, cy + s * 1.25], fill=105)
    glow = glow.filter(ImageFilter.GaussianBlur(SIZE * 0.10))
    img = Image.composite(Image.new("RGB", (SIZE, SIZE), (255, 255, 255)), img, glow)
    d = ImageDraw.Draw(img)

    if motif == 0:
        draw_rings(d, cx, cy - s * 0.12, s * 0.72, accent, w)
    elif motif == 1:
        draw_heart(d, cx, cy - s * 0.05, s * 1.15, accent)
    elif motif == 2:
        draw_branch(d, cx, cy, s * 1.15, lerp(accent, (255, 255, 255), 0.25), accent)
    elif motif == 3:
        draw_confetti(d, cx, cy, s * 1.25, accent, rnd)
    elif motif == 4:
        draw_arch(d, cx, cy, s * 1.05, accent, w)
    elif motif == 5:
        draw_card(d, cx, cy, s * 1.15, accent, load_font(34), text_color, text_color)
    elif motif == 6:
        draw_ribbon(d, cx, cy, s * 1.1, lerp(accent, (255, 255, 255), 0.55), load_font(38), text_color)
    else:
        draw_sparkles(d, cx, cy, s * 1.2, accent, rnd)

    # alt ortada, motifle uyumlu tema sözcüğü
    group = WORDS_BY_MOTIF[motif]
    word = group[(index // 8) % len(group)]
    font = load_font(42)
    bbox = d.textbbox((0, 0), word, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text((cx - tw / 2, SIZE - s * 0.62 - th), word, font=font, fill=text_color)

    # ince iç çerçeve
    d.rounded_rectangle([16, 16, SIZE - 16, SIZE - 16], radius=18, outline=lerp(accent, (255, 255, 255), 0.55), width=2)

    img = vignette(img, 42)
    img = paper_noise(img, 5)
    return img


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    total = 0
    for i in range(1, COUNT + 1):
        img = make_image(i - 1)
        path = os.path.join(OUT_DIR, "wedding-%02d.jpg" % i)
        img.save(path, "JPEG", quality=78, optimize=True, progressive=True)
        total += os.path.getsize(path)
    print("%d görsel üretildi: %s" % (COUNT, OUT_DIR))
    print("toplam boyut: %.1f KB (ortalama %.1f KB)" % (total / 1024, total / 1024 / COUNT))


if __name__ == "__main__":
    main()
