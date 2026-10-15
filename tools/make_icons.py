"""Instagram benzeri uygulama ikonlarini uretir (Pillow).

Calistirma:
    python tools/make_icons.py
"""
from __future__ import annotations

import math
import os

from PIL import Image, ImageDraw, ImageFilter

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "icons")
OUT_DIR = os.path.normpath(OUT_DIR)

# Instagram gradyaninin karakteristik renk duraklari (sol-alt -> sag-ust).
STOPS = [
    (0.00, (254, 218, 117)),   # #feda75
    (0.22, (250, 126, 30)),    # #fa7e1e
    (0.48, (214, 41, 118)),    # #d62976
    (0.74, (150, 47, 191)),    # #962fbf
    (1.00, (79, 91, 213)),     # #4f5bd5
]


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def gradient_at(t: float):
    t = max(0.0, min(1.0, t))
    for i in range(len(STOPS) - 1):
        t0, c0 = STOPS[i]
        t1, c1 = STOPS[i + 1]
        if t0 <= t <= t1:
            k = 0.0 if t1 == t0 else (t - t0) / (t1 - t0)
            return tuple(int(round(lerp(c0[j], c1[j], k))) for j in range(3))
    return STOPS[-1][1]


def build_gradient(size: int) -> Image.Image:
    """Sol-alttan sag-uste capraz gradyan + yumusak radial isik."""
    img = Image.new("RGB", (size, size))
    px = img.load()
    for y in range(size):
        for x in range(size):
            # 45 derece capraz ilerleme, alt-sol = 0, sag-ust = 1
            t = ((x / (size - 1)) * 0.55 + ((size - 1 - y) / (size - 1)) * 0.45)
            px[x, y] = gradient_at(t)

    # Tema karakterini guclendiren hafif radial parlaklik (sag-alt kose).
    glow = Image.new("L", (size, size), 0)
    gd = ImageDraw.Draw(glow)
    cx, cy, r = size * 0.78, size * 0.85, size * 0.60
    gd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=70)
    glow = glow.filter(ImageFilter.GaussianBlur(size * 0.16))
    warm = Image.new("RGB", (size, size), (255, 190, 120))
    img = Image.composite(Image.blend(img, warm, 0.35), img, glow)
    return img


def draw_camera(layer: Image.Image, size: int) -> None:
    """Beyaz cizgili kamera glifi: yuvarlak kare govde + lens + flas noktasi."""
    d = ImageDraw.Draw(layer)
    u = size / 512.0

    body = [130 * u, 130 * u, 382 * u, 382 * u]
    stroke = max(2, int(round(28 * u)))
    d.rounded_rectangle(body, radius=96 * u, outline=(255, 255, 255, 255), width=stroke)

    cx = cy = 256 * u
    lr = 66 * u
    d.ellipse([cx - lr, cy - lr, cx + lr, cy + lr], outline=(255, 255, 255, 255), width=stroke)

    dot = 15 * u
    dx, dy = 334 * u, 178 * u
    d.ellipse([dx - dot, dy - dot, dx + dot, dy + dot], fill=(255, 255, 255, 255))


def make_icon(size: int, radius_ratio: float = 0.235, glyph_scale: float = 1.0) -> Image.Image:
    ss = 2  # supersampling
    big = size * ss
    base = build_gradient(big)

    glyph = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    if glyph_scale != 1.0:
        inner = int(big * glyph_scale)
        g = Image.new("RGBA", (inner, inner), (0, 0, 0, 0))
        draw_camera(g, inner)
        off = (big - inner) // 2
        glyph.paste(g, (off, off), g)
    else:
        draw_camera(glyph, big)

    base = base.convert("RGBA")
    base.alpha_composite(glyph)

    mask = Image.new("L", (big, big), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle([0, 0, big - 1, big - 1], radius=int(big * radius_ratio), fill=255)
    base.putalpha(mask)

    return base.resize((size, size), Image.LANCZOS)


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    targets = [
        ("icon-512.png", 512, 0.235, 1.0),
        ("icon-512-maskable.png", 512, 0.5, 0.72),
        ("icon-192.png", 192, 0.235, 1.0),
        ("apple-touch-icon.png", 180, 0.0, 1.0),
        ("favicon-32.png", 32, 0.235, 1.0),
    ]
    for name, size, radius, scale in targets:
        icon = make_icon(size, radius, scale)
        path = os.path.join(OUT_DIR, name)
        icon.save(path, "PNG", optimize=True)
        print(f"{name}: {size}x{size} -> {path}")

    # Kurulum onizlemesi icin tek bir 512 PNG'den ICO uret.
    ico = make_icon(256, 0.235, 1.0)
    ico.save(os.path.join(OUT_DIR, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48), (256, 256)])
    print("favicon.ico yazildi")


if __name__ == "__main__":
    main()
