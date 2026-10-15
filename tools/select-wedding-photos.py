"""Havuzdan seçilen fotoğrafları profil ızgarasına yerleştirir.

Kullanım:
    python tools/select-wedding-photos.py --sec 12,45,3,n009,88,...

- Sayılar ilk havuzdaki (tools/_pool.json) 1 tabanlı indekslerdir.
- "n012" gibi n ile başlayanlar ikinci havuzdan (tools/_aday2.json) seçilir.
- Seçilenler sırayla media/wedding-01.jpg, wedding-02.jpg … olarak kopyalanır ve
  CREDITS.md kaynak/lisans listesi bu seçime göre yeniden yazılır.
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import sys

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
HOVUZLAR = {
    "": (os.path.join(ROOT, "media", "_aday"), os.path.join(ROOT, "tools", "_pool.json")),
    "n": (os.path.join(ROOT, "media", "_aday2"), os.path.join(ROOT, "tools", "_aday2.json")),
}
MEDIA = os.path.join(ROOT, "media")


def havuz_yukle(on_ek: str):
    dizin, json_yolu = HOVUZLAR[on_ek]
    if not os.path.exists(json_yolu):
        return [], dizin
    with open(json_yolu, encoding="utf-8") as f:
        return json.load(f), dizin


def main() -> None:
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
    ap = argparse.ArgumentParser()
    ap.add_argument("--sec", required=True,
                    help="virgülle ayrılmış indeksler; ikinci havuz için n012 gibi")
    args = ap.parse_args()

    secim = []
    for ham in args.sec.replace(" ", "").split(","):
        if not ham:
            continue
        on_ek = "n" if ham[:1].lower() == "n" else ""
        try:
            i = int(ham[1:] if on_ek else ham)
        except ValueError:
            continue
        havuz, dizin = havuz_yukle(on_ek)
        if 1 <= i <= len(havuz):
            k = dict(havuz[i - 1])
            k["_dizin"] = dizin
            secim.append(k)
    if not secim:
        print("Geçerli seçim yok.")
        sys.exit(1)

    for n, k in enumerate(secim, start=1):
        kaynak = os.path.join(k["_dizin"], k["dosya"])
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
