"""Kendi fotoğraflarını profildeki ızgaraya aktarır.

Ne yapar:
  1) `fotograflar/` klasöründeki görselleri okur (jpg/jpeg/png/webp)
  2) Her birini ortadan kareye kırpar, 720x720'ye küçültür, meta verileri temizler
  3) media/photo-01.jpg, photo-02.jpg … olarak kaydeder
  4) js/data.js içindeki KENDI_FOTOGRAFLARIM listesini bu dosyalarla doldurur
     (böylece ızgaradaki yer tutucuların yerini senin fotoğrafların alır)

Kullanım:
    python tools/import-photos.py                 # fotograflar/ klasöründen
    python tools/import-photos.py D:\\dugun       # başka bir klasörden
    python tools/import-photos.py --adet 30       # yalnızca ilk 30 fotoğraf
    python tools/import-photos.py --hepsi         # 58'den fazlasını da al (ızgara büyür)

Sonrasında:
    node tools/build-single.js    # tek dosyalık sürümü tazele
    git add -A && git commit -m "Kendi fotoğraflarımı ekle" && git push
"""

from __future__ import annotations

import argparse
import os
import re
import sys

from PIL import Image

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
MEDIA = os.path.join(ROOT, "media")
DATA_JS = os.path.join(ROOT, "js", "data.js")
VARSAYILAN_KLASOR = os.path.join(ROOT, "fotograflar")

UZANTILAR = (".jpg", ".jpeg", ".png", ".webp")
IZGARA_ADEDI = 58       # profildeki gönderi sayısı
BOYUT = 720


def dogal_sira(ad: str):
    """foto2 < foto10 gibi doğal sıralama."""
    return [int(p) if p.isdigit() else p.lower() for p in re.split(r"(\d+)", ad)]


def kare_yap(im: Image.Image, boyut: int) -> Image.Image:
    w, h = im.size
    kenar = min(w, h)
    sol, ust = (w - kenar) // 2, (h - kenar) // 2
    return im.crop((sol, ust, sol + kenar, ust + kenar)).resize((boyut, boyut), Image.LANCZOS)


def listeyi_yaz(yollar):
    """js/data.js içindeki KENDI_FOTOGRAFLARIM listesini günceller."""
    with open(DATA_JS, encoding="utf-8") as f:
        kaynak = f.read()

    satirlar = ["  var KENDI_FOTOGRAFLARIM = ["]
    for i, y in enumerate(yollar):
        son = "," if i < len(yollar) - 1 else ""
        satirlar.append('    "%s"%s' % (y, son))
    satirlar.append("  ];")
    yeni = "\n".join(satirlar)

    desen = re.compile(r"  var KENDI_FOTOGRAFLARIM = \[[\s\S]*?\n  \];")
    if not desen.search(kaynak):
        print("HATA: js/data.js içinde KENDI_FOTOGRAFLARIM listesi bulunamadı.")
        sys.exit(1)
    kaynak = desen.sub(lambda _m: yeni, kaynak, count=1)
    with open(DATA_JS, "w", encoding="utf-8") as f:
        f.write(kaynak)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("klasor", nargs="?", default=VARSAYILAN_KLASOR)
    ap.add_argument("--adet", type=int, default=IZGARA_ADEDI)
    ap.add_argument("--hepsi", action="store_true", help="ızgara sayısından fazlasını da al")
    args = ap.parse_args()

    klasor = os.path.abspath(args.klasor)
    if not os.path.isdir(klasor):
        print("Klasör bulunamadı: %s" % klasor)
        print("Fotoğraflarını bu klasöre koyup tekrar çalıştır.")
        sys.exit(1)

    dosyalar = sorted(
        [f for f in os.listdir(klasor) if f.lower().endswith(UZANTILAR)],
        key=dogal_sira,
    )
    if not dosyalar:
        print("Klasörde görsel yok: %s" % klasor)
        sys.exit(1)

    sinir = len(dosyalar) if args.hepsi else min(len(dosyalar), args.adet)
    print("%d görsel bulundu; %d tanesi aktarılacak." % (len(dosyalar), sinir))
    if len(dosyalar) > sinir:
        print("  (%d fazlası atlandı — hepsini almak için --hepsi kullan)"
              % (len(dosyalar) - sinir))

    os.makedirs(MEDIA, exist_ok=True)
    yollar = []
    for i, ad in enumerate(dosyalar[:sinir], start=1):
        try:
            with Image.open(os.path.join(klasor, ad)) as im:
                im = im.convert("RGB")
                kare = kare_yap(im, BOYUT)
                cikti = "media/photo-%02d.jpg" % i
                kare.save(os.path.join(MEDIA, "photo-%02d.jpg" % i), "JPEG",
                          quality=82, optimize=True, progressive=True)
                yollar.append(cikti)
                print("  %2d/%d  %s → %s" % (i, sinir, ad, cikti))
        except Exception as e:
            print("  ! %s atlandı: %s" % (ad, str(e)[:60]))

    if not yollar:
        print("Hiçbir fotoğraf aktarılamadı.")
        sys.exit(1)

    listeyi_yaz(yollar)
    print("\n%d fotoğraf aktarıldı ve js/data.js güncellendi." % len(yollar))
    if len(yollar) < IZGARA_ADEDI:
        print("Not: %d fotoğraf kaldı, onlar için yer tutucu görseller kullanılmaya devam eder."
              % (IZGARA_ADEDI - len(yollar)))
    print("\nSonraki adımlar:")
    print("  node tools/build-single.js")
    print('  git add -A && git commit -m "Kendi fotoğraflarımı ekle" && git push')


if __name__ == "__main__":
    main()
