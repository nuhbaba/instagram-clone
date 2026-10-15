"""Denge bir aday havuzu indirir (düğün fotoğrafları, özgür lisanslı).

Kategorilerden sırayla (round-robin) indirir; böylece havuz yalnızca buket
fotoğraflarından oluşmaz. İndirilenler media/_aday/ içine konur, meta veriler
tools/_pool.json dosyasına yazılır ve CREDITS için kullanılır.

Kullanım:
    python tools/build-wedding-pool.py --adet 150
"""

from __future__ import annotations

import argparse
import io
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

from PIL import Image

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
POOL_DIR = os.path.join(ROOT, "media", "_aday")
UA = "instagram-clone-demo/1.0 (kisisel demo)"
SIZE = 640
MIN_SIDE = 520
PER_CAT = 40
API = "https://commons.wikimedia.org/w/api.php"

CATS = [
    "Wedding ceremonies", "Bridal bouquets", "Wedding cakes", "Wedding rings",
    "Wedding dresses", "Wedding decorations", "Wedding receptions",
    "Wedding photographs",
]


def api(params: dict, deneme: int = 4):
    params = dict(params, format="json")
    url = API + "?" + urllib.parse.urlencode(params)
    for i in range(deneme):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=35) as r:
                return json.loads(r.read().decode("utf-8", "replace"))
        except urllib.error.HTTPError as e:
            if e.code in (429, 503) and i < deneme - 1:
                time.sleep(8 * (i + 1))
                continue
            raise
    return None


def indir(url: str, deneme: int = 3) -> bytes:
    for i in range(deneme):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=70) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code in (429, 503) and i < deneme - 1:
                time.sleep(7 * (i + 1))
                continue
            raise
    raise RuntimeError("indirilemedi")


def kare(im: Image.Image, boyut: int) -> Image.Image:
    w, h = im.size
    kenar = min(w, h)
    sol, ust = (w - kenar) // 2, (h - kenar) // 2
    return im.crop((sol, ust, sol + kenar, ust + kenar)).resize((boyut, boyut), Image.LANCZOS)


def kategori_adaylari(cat: str):
    out = []
    devam = None
    while len(out) < PER_CAT:
        p = {
            "action": "query", "generator": "categorymembers", "gcmtitle": "Category:" + cat,
            "gcmtype": "file", "gcmlimit": "50", "prop": "imageinfo",
            "iiprop": "url|size|mime|extmetadata", "iiurlwidth": "1200",
        }
        if devam:
            p["gcmcontinue"] = devam
        try:
            data = api(p)
        except Exception as e:
            print("  ! %s: %s" % (cat, str(e)[:60]))
            break
        pages = ((data or {}).get("query") or {}).get("pages") or {}
        for x in pages.values():
            ii = (x.get("imageinfo") or [{}])[0]
            if ii.get("mime") not in ("image/jpeg", "image/png"):
                continue
            w, h = ii.get("width") or 0, ii.get("height") or 0
            if min(w, h) < MIN_SIDE or max(w, h) / max(1, min(w, h)) > 2.3:
                continue
            meta = ii.get("extmetadata") or {}
            out.append({
                "kategori": cat,
                "url": ii.get("thumburl") or ii.get("url"),
                "kaynak": ii.get("descriptionurl") or ii.get("url"),
                "baslik": x.get("title", "").replace("File:", "")[:110],
                "sanatci": (meta.get("Artist") or {}).get("value", "") or "—",
                "lisans": (meta.get("LicenseShortName") or {}).get("value", ""),
            })
        devam = ((data or {}).get("continue") or {}).get("gcmcontinue")
        if not devam:
            break
        time.sleep(1.5)
    return out


def main() -> None:
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
    ap = argparse.ArgumentParser()
    ap.add_argument("--adet", type=int, default=150)
    args = ap.parse_args()

    os.makedirs(POOL_DIR, exist_ok=True)
    print("Aday listeleri toplanıyor…")
    kuyruk = []          # kategori bazlı listeler (round-robin için)
    for cat in CATS:
        l = kategori_adaylari(cat)
        print("  %-22s %d aday" % (cat, len(l)))
        kuyruk.append(l)
        time.sleep(1.5)

    kayitlar = []
    n = 0
    idx = 0
    while n < args.adet:
        ilerleme = False
        for l in kuyruk:
            if idx < len(l):
                ilerleme = True
                a = l[idx]
                try:
                    raw = indir(a["url"])
                    if len(raw) > 9_000_000:
                        continue
                    im = Image.open(io.BytesIO(raw))
                    im.load()
                    im = im.convert("RGB")
                    if min(im.size) < MIN_SIDE:
                        continue
                    n += 1
                    ad = "p%03d.jpg" % n
                    kare(im, SIZE).save(os.path.join(POOL_DIR, ad), "JPEG",
                                        quality=82, optimize=True, progressive=True)
                    a["dosya"] = ad
                    kayitlar.append(a)
                    if n % 10 == 0:
                        print("  %d/%d indirildi" % (n, args.adet))
                except Exception as e:
                    print("  ! atlandı (%s): %s" % (a["baslik"][:32], str(e)[:40]))
        idx += 1
        if not ilerleme:
            break
        time.sleep(0.8)

    with open(os.path.join(ROOT, "tools", "_pool.json"), "w", encoding="utf-8") as f:
        json.dump(kayitlar, f, ensure_ascii=False, indent=1)
    print("\n%d fotoğraf havuza indirildi: media/_aday/" % len(kayitlar))
    print("Meta veri: tools/_pool.json")


if __name__ == "__main__":
    main()
