"""Bir fotoğraf kolajını (3x3 ızgara) ayrı karelere böler ve profile yerleştirir.

Kullanım:
    python tools/split-collage.py --kaynak "C:\\yol\\kolaj.jpg"
    python tools/split-collage.py --kaynak kolaj.jpg --sira 3,1,9,7,4,2,6,8,5

- Ayırıcı çizgileri otomatik bulur (ince boşluk/çerçeve varsa onları atlar)
- Kareleri kareye kırpar, 720x720'ye büyütür, hafif keskinleştirir
- Seçilen sırayla media/photo-01.jpg … photo-09.jpg olarak kaydeder
- Böylece bu fotoğraflar profil ızgarasının ilk 9 karesi olur
  (js/data.js içindeki KENDI_FOTOGRAFLARIM listesi bunları kullanır)

Not: 58'den fazla fotoğraf gerekiyorsa kareleri 3x3 yerine farklı düzenlerde
bölmek gerekir; bu betik 3x3 için yazıldı.
"""

from __future__ import annotations

import argparse
import os
import sys

from PIL import Image, ImageFilter, ImageStat

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
MEDIA = os.path.join(ROOT, "media")
BOYUT = 720


def ayirici_gruplari(im: Image.Image, eksen: str, esik: float = 6.0):
    """Tek renge yakın (ayırıcı) satır/kolon gruplarını bulur."""
    w, h = im.size
    degerler = []
    if eksen == "x":
        for x in range(w):
            degerler.append(ImageStat.Stat(im.crop((x, 0, x + 1, h))).stddev[0])
    else:
        for y in range(h):
            degerler.append(ImageStat.Stat(im.crop((0, y, w, y + 1))).stddev[0])
    gruplar, bas = [], None
    for i, v in enumerate(degerler):
        if v < esik:
            if bas is None:
                bas = i
        else:
            if bas is not None:
                gruplar.append((bas, i - 1))
                bas = None
    if bas is not None:
        gruplar.append((bas, len(degerler) - 1))
    return [g for g in gruplar if 0 < g[0] and g[1] < len(degerler) - 1]


def main() -> None:
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
    ap = argparse.ArgumentParser()
    ap.add_argument("--kaynak", required=True, help="kolaj dosyasının yolu")
    ap.add_argument("--sira", default="3,1,9,7,4,2,6,8,5",
                    help="ızgara sırası: kolajdaki kare numaraları (sol üstten 1)")
    ap.add_argument("--kirp", type=int, default=4, help="ayırıcıdan içeri doğru pay (px)")
    args = ap.parse_args()

    if not os.path.exists(args.kaynak):
        print("Dosya bulunamadı:", args.kaynak)
        sys.exit(1)

    im = Image.open(args.kaynak).convert("RGB")
    w, h = im.size
    kx = ayirici_gruplari(im, "x")
    ky = ayirici_gruplari(im, "y")
    dx = [0] + [(g[0] + g[1]) // 2 for g in kx] + [w]
    dy = [0] + [(g[0] + g[1]) // 2 for g in ky] + [h]
    print("ayırıcılar → x: %s · y: %s" % (kx, ky))

    kareler = []
    for r in range(3):
        for c in range(3):
            kutu = (dx[c] + args.kirp, dy[r] + args.kirp, dx[c + 1] - args.kirp, dy[r + 1] - args.kirp)
            kareler.append(im.crop(kutu))
    print("ayrılan kare sayısı:", len(kareler))

    sira = [int(x) for x in args.sira.replace(" ", "").split(",") if x]
    os.makedirs(MEDIA, exist_ok=True)
    yollar = []
    for n, idx in enumerate(sira, start=1):
        t = kareler[idx - 1]
        tw, th = t.size
        kenar = min(tw, th)
        sol, ust = (tw - kenar) // 2, (th - kenar) // 2
        t = t.crop((sol, ust, sol + kenar, ust + kenar)).resize((BOYUT, BOYUT), Image.LANCZOS)
        t = t.filter(ImageFilter.UnsharpMask(radius=1.6, percent=90, threshold=3))
        yol = os.path.join(MEDIA, "photo-%02d.jpg" % n)
        t.save(yol, "JPEG", quality=88, optimize=True, progressive=True)
        yollar.append("media/photo-%02d.jpg" % n)
        print("  photo-%02d.jpg ← kolaj karesi %d (%.1f KB)" % (n, idx, os.path.getsize(yol) / 1024))

    print("\n%d fotoğraf hazır." % len(yollar))
    print("Şimdi js/data.js içindeki KENDI_FOTOGRAFLARIM listesini bu dosyalarla güncelle:")
    print("  " + ", ".join('"%s"' % y for y in yollar))
    print("Ardından: node tools/build-single.js")


if __name__ == "__main__":
    main()
