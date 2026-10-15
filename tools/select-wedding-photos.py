"""Havuzdan seçilen fotoğrafları profil ızgarasına yerleştirir.

Kullanım:
    python tools/select-wedding-photos.py --sec 12,45,3,88,...

Seçilen sıra numaraları (havuzdaki 1 tabanlı indeksler) sırayla
media/wedding-01.jpg, wedding-02.jpg … olarak kopyalanır ve CREDITS.md
kaynak/lisans listesi bu seçime göre yeniden yazılır.
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import sys

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
POOL_DIR = os.path.join(ROOT, "media", "_aday")
POOL_JSON = os.path.join(ROOT, "tools", "_pool.json")
MEDIA = os.path.join(ROOT, "media")


def main() -> None:
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
    ap = argparse.ArgumentParser()
    ap.add_argument("--sec", required=True, help="virgülle ayrılmış havuz indeksleri (1 tabanlı)")
    args = ap.parse_args()

    with open(POOL_JSON, encoding="utf-8") as f:
        havuz = json.load(f)

    secim = []
    for p in args.sec.replace(" ", "").split(","):
        if not p:
            continue
        i = int(p)
        if 1 <= i <= len(havuz):
            secim.append(havuz[i - 1])
    if not secim:
        print("Geçerli seçim yok.")
        sys.exit(1)

    for n, k in enumerate(secim, start=1):
        kaynak = os.path.join(POOL_DIR, k["dosya"])
        hedef = os.path.join(MEDIA, "wedding-%02d.jpg" % n)
        if not os.path.exists(kaynak):
            print("  ! eksik: %s" % kaynak)
            continue
        shutil.copyfile(kaynak, hedef)
        print("  %2d → wedding-%02d.jpg  (%s)" % (n, n, k["baslik"][:52]))
        k["yeni"] = "media/wedding-%02d.jpg" % n

    satirlar = [
        "# Görsel kaynakları",
        "",
        "Profil ızgarasındaki fotoğraflar **Wikimedia Commons** üzerinden alınmış,",
        "özgür lisanslı (CC0 / kamu malı / CC BY / CC BY-SA) düğün fotoğraflarıdır.",
        "CC BY ve CC BY-SA lisanslarında atıf bu liste ile sağlanır.",
        "",
        "**Bunlar yer tutucudur** — kendi fotoğraflarını koymak için:",
        "`python tools/import-photos.py` (bkz. PROFILINI-DOLDUR.md).",
        "",
        "| Dosya | Başlık | Sanatçı | Lisans | Kaynak |",
        "|---|---|---|---|---|",
    ]
    for k in secim:
        satirlar.append("| %s | %s | %s | %s | %s |" % (
            k.get("yeni", k["dosya"]),
            k["baslik"].replace("|", "/"),
            k["sanatci"].replace("|", "/")[:80].replace("\n", " "),
            k["lisans"].replace("|", "/"),
            k["kaynak"]))
    with open(os.path.join(ROOT, "CREDITS.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(satirlar) + "\n")

    print("\n%d fotoğraf yerleştirildi. Kaynak listesi: CREDITS.md" % len(secim))
    print("Sonraki: node tools/build-single.js")


if __name__ == "__main__":
    main()
