"""Havuzun devamından (sonraki sayfalar) insansız aday fotoğraflar indirir."""

from __future__ import annotations

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
POOL = os.path.join(ROOT, "media", "_aday2")
UA = "instagram-clone-demo/1.0 (kisisel demo)"
API = "https://commons.wikimedia.org/w/api.php"
CATS = ["Wedding decorations", "Wedding cakes", "Bridal bouquets", "Wedding rings", "Wedding ceremonies"]
SIZE, MIN_SIDE, ATLA = 640, 520, 40   # ilk 40 zaten indirildi


def api(params, deneme=4):
    url = API + "?" + urllib.parse.urlencode(dict(params, format="json"))
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


def indir(url, deneme=3):
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


def kare(im, boyut):
    w, h = im.size
    k = min(w, h)
    return im.crop(((w - k) // 2, (h - k) // 2, (w - k) // 2 + k, (h - k) // 2 + k)).resize((boyut, boyut), Image.LANCZOS)


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
    os.makedirs(POOL, exist_ok=True)
    kayitlar, n = [], 0
    for cat in CATS:
        devam, atlandi = None, 0
        for tur in range(4):
            p = {"action": "query", "generator": "categorymembers", "gcmtitle": "Category:" + cat,
                 "gcmtype": "file", "gcmlimit": "50", "prop": "imageinfo",
                 "iiprop": "url|size|mime|extmetadata", "iiurlwidth": "1200"}
            if devam:
                p["gcmcontinue"] = devam
            try:
                data = api(p)
            except Exception as e:
                print("  !", cat, str(e)[:50]); break
            for x in ((data or {}).get("query") or {}).get("pages", {}).values():
                ii = (x.get("imageinfo") or [{}])[0]
                if ii.get("mime") not in ("image/jpeg", "image/png"):
                    continue
                w, h = ii.get("width") or 0, ii.get("height") or 0
                if min(w, h) < MIN_SIDE or max(w, h) / max(1, min(w, h)) > 2.3:
                    continue
                atlandi += 1
                if atlandi <= ATLA:      # ilk sayfayı atla (zaten indirildi)
                    continue
                meta = ii.get("extmetadata") or {}
                a = {"kategori": cat, "url": ii.get("thumburl") or ii.get("url"),
                     "kaynak": ii.get("descriptionurl") or ii.get("url"),
                     "baslik": x.get("title", "").replace("File:", "")[:110],
                     "sanatci": (meta.get("Artist") or {}).get("value", "") or "—",
                     "lisans": (meta.get("LicenseShortName") or {}).get("value", "")}
                try:
                    raw = indir(a["url"])
                    im = Image.open(io.BytesIO(raw)); im.load()
                    if min(im.size) < MIN_SIDE:
                        continue
                    n += 1
                    ad = "n%03d.jpg" % n
                    kare(im.convert("RGB"), SIZE).save(os.path.join(POOL, ad), "JPEG",
                                                      quality=82, optimize=True, progressive=True)
                    a["dosya"] = ad
                    kayitlar.append(a)
                except Exception:
                    continue
                if n >= 28:
                    break
            devam = ((data or {}).get("continue") or {}).get("gcmcontinue")
            if not devam or n >= 28:
                break
            time.sleep(1.5)
        print("  %-22s → toplam %d" % (cat, n))
        if n >= 28:
            break
        time.sleep(1.5)
    with open(os.path.join(ROOT, "tools", "_aday2.json"), "w", encoding="utf-8") as f:
        json.dump(kayitlar, f, ensure_ascii=False, indent=1)
    print("\n%d yeni aday: media/_aday2/" % len(kayitlar))


if __name__ == "__main__":
    main()
