"""Profil ızgarası için gerçek, lisansı uygun düğün fotoğrafları indirir.

Kaynaklar:
  1) Openverse API (CC0 / Kamu Malı) — hız sınırına takılırsa bekleyip yeniden dener
  2) Wikimedia Commons (kategori tabanlı) — yedek kaynak

Her görsel kareye kırpılıp 640x640 JPEG olarak media/wedding-NN.jpg şeklinde
kaydedilir ve CREDITS.md'ye kaynak/lisans listesi yazılır.

Kullanım:
    python tools/fetch-wedding-photos.py --adet 58
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
MEDIA = os.path.join(ROOT, "media")
UA = "instagram-clone-demo/1.0 (kisisel demo)"
SIZE = 640
MIN_SIDE = 520

OPENVERSE_Q = [
    "wedding ceremony", "bride wedding dress", "wedding rings", "bridal bouquet",
    "wedding cake", "wedding decoration", "newlyweds", "wedding flowers",
    "wedding celebration", "wedding table",
]

COMMONS_CATS = [
    "Wedding ceremonies", "Bridal bouquets", "Wedding cakes", "Wedding rings",
    "Wedding dresses", "Wedding decorations", "Wedding receptions", "Wedding photographs",
]


def get_json(url: str, timeout: int = 30, deneme: int = 4):
    """JSON indirir; 429'da bekleyip yeniden dener."""
    for i in range(deneme):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return json.loads(r.read().decode("utf-8", "replace"))
        except urllib.error.HTTPError as e:
            if e.code in (429, 403, 500, 503) and i < deneme - 1:
                time.sleep(6 * (i + 1))
                continue
            raise
        except Exception:
            if i < deneme - 1:
                time.sleep(3)
                continue
            raise
    return None


def get_bytes(url: str, timeout: int = 60) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def uygun(w, h) -> bool:
    if not w or not h:
        return False
    if min(w, h) < MIN_SIDE:
        return False
    return max(w, h) / max(1, min(w, h)) <= 2.3


def openverse_candidates(adet: int):
    out = []
    for q in OPENVERSE_Q:
        if len(out) >= adet * 3:
            break
        url = "https://api.openverse.org/v1/images/?" + urllib.parse.urlencode({
            "q": q, "license": "cc0,pdm", "page_size": "50", "mature": "false"})
        try:
            data = get_json(url)
        except Exception as e:
            print("  ! Openverse (%s): %s" % (q, str(e)[:60]))
            continue
        for it in (data or {}).get("results", []):
            if not it.get("url") or not uygun(it.get("width"), it.get("height")):
                continue
            out.append({
                "url": it["url"],
                "kaynak": it.get("foreign_landing_url") or it["url"],
                "baslik": (it.get("title") or "")[:110],
                "sanatci": it.get("creator") or "—",
                "lisans": (it.get("license") or "").upper(),
            })
        print("  Openverse '%s' → %d aday" % (q, len(out)))
        time.sleep(4)
    return out


def commons_candidates(adet: int):
    out = []
    for cat in COMMONS_CATS:
        if len(out) >= adet * 3:
            break
        url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({
            "action": "query", "generator": "categorymembers",
            "gcmtitle": "Category:" + cat, "gcmtype": "file", "gcmlimit": "40",
            "prop": "imageinfo", "iiprop": "url|size|mime|extmetadata",
            "iiurlwidth": "1200", "format": "json"})
        try:
            data = get_json(url)
        except Exception as e:
            print("  ! Commons (%s): %s" % (cat, str(e)[:60]))
            continue
        pages = ((data or {}).get("query") or {}).get("pages") or {}
        for p in pages.values():
            ii = (p.get("imageinfo") or [{}])[0]
            if ii.get("mime") not in ("image/jpeg", "image/png"):
                continue
            if not uygun(ii.get("width"), ii.get("height")):
                continue
            meta = ii.get("extmetadata") or {}
            lisans = (meta.get("LicenseShortName") or {}).get("value", "")
            sanatci = (meta.get("Artist") or {}).get("value", "") or "—"
            sanatci = "".join(ch for ch in sanatci if ch == " " or ch.isprintable())[:70]
            out.append({
                "url": ii.get("thumburl") or ii.get("url"),
                "kaynak": ii.get("descriptionurl") or ii.get("url"),
                "baslik": p.get("title", "").replace("File:", "")[:110],
                "sanatci": sanatci,
                "lisans": lisans,
            })
        print("  Commons '%s' → %d aday" % (cat, len(out)))
        time.sleep(2.0)
    return out


def square_crop(im: Image.Image, size: int) -> Image.Image:
    w, h = im.size
    side = min(w, h)
    left, top = (w - side) // 2, (h - side) // 2
    return im.crop((left, top, left + side, top + side)).resize((size, size), Image.LANCZOS)


def main() -> None:
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
    ap = argparse.ArgumentParser()
    ap.add_argument("--adet", type=int, default=58)
    args = ap.parse_args()
    adet = max(1, min(80, args.adet))

    print("Gerçek düğün fotoğrafları aranıyor (yalnızca özgür lisanslı)…")
    adaylar = openverse_candidates(adet)
    if len(adaylar) < adet:
        print("  Openverse yetersiz/limitli → Wikimedia Commons ekleniyor")
        adaylar += commons_candidates(adet)

    # tekrarları at
    gorulen, benzersiz = set(), []
    for a in adaylar:
        if a["url"] in gorulen:
            continue
        gorulen.add(a["url"])
        benzersiz.append(a)
    print("  toplam aday: %d" % len(benzersiz))
    os.makedirs(os.path.join(ROOT, "tools"), exist_ok=True)
    with open(os.path.join(ROOT, "tools", "_aday.json"), "w", encoding="utf-8") as f:
        json.dump(benzersiz, f, ensure_ascii=False, indent=1)
    if not benzersiz:
        print("Kaynak bulunamadı.")
        sys.exit(1)

    kayitlar, n = [], 0
    for a in benzersiz:
        if n >= adet:
            break
        try:
            raw = get_bytes(a["url"])
            if len(raw) > 9_000_000:
                continue
            im = Image.open(io.BytesIO(raw))
            im.load()
            im = im.convert("RGB")
            if min(im.size) < MIN_SIDE:
                continue
            n += 1
            kare = square_crop(im, SIZE)
            kare.save(os.path.join(MEDIA, "wedding-%02d.jpg" % n), "JPEG",
                      quality=82, optimize=True, progressive=True)
            a["dosya"] = "media/wedding-%02d.jpg" % n
            kayitlar.append(a)
            print("  %2d/%d  %s" % (n, adet, a["baslik"][:56]))
        except Exception as e:
            print("  ! indirilemedi: %s" % str(e)[:60])

    satirlar = [
        "# Görsel kaynakları",
        "",
        "Profil ızgarasındaki fotoğraflar **Openverse** (CC0 / Kamu Malı) ve",
        "**Wikimedia Commons** (özgür lisanslar) üzerinden alınmıştır. Kullanılan her",
        "görselin kaynağı ve lisansı aşağıda listelenmiştir; CC BY / CC BY-SA lisanslı",
        "görsellerde atıf bu listeyle sağlanır. Bunlar yer tutucudur — kendi",
        "fotoğraflarınla değiştirmek için `python tools/import-photos.py` kullan.",
        "",
        "| Dosya | Başlık | Sanatçı | Lisans | Kaynak |",
        "|---|---|---|---|---|",
    ]
    for k in kayitlar:
        satirlar.append("| %s | %s | %s | %s | %s |" % (
            k["dosya"], k["baslik"].replace("|", "/"), k["sanatci"].replace("|", "/"),
            k["lisans"].replace("|", "/"), k["kaynak"]))
    with open(os.path.join(ROOT, "CREDITS.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(satirlar) + "\n")

    print("\n%d fotoğraf media/wedding-*.jpg olarak kaydedildi." % len(kayitlar))
    print("Kaynak listesi: CREDITS.md")


if __name__ == "__main__":
    main()
