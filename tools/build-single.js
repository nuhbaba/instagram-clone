/* ==========================================================================
   tools/build-single.js — Tek dosyalık sürüm üretir
   CSS ve tüm JS dosyalarını index.html içine gömer; çıktı, sunucu ya da
   internet klasörü olmadan telefondan açılabilecek tek bir HTML dosyasıdır.

   Çalıştırma:
     node tools/build-single.js
   ========================================================================== */
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const outFile = path.join(root, "Instagram-TekDosya.html");

const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

let html = read("index.html");
const css = read("css/styles.css");
const jsFiles = ["js/icons.js", "js/data.js", "js/store.js", "js/components.js", "js/app.js"];

const js = jsFiles
  .map((f) => "/* ===================== " + f + " ===================== */\n" + read(f))
  .join("\n\n");

/* --- media/ altındaki yerel görselleri data URI'ye çevir; tek dosya
       kendi kendine yetsin (ör. profil fotoğrafı) --- */
const mediaStats = [];
const jsInlined = (() => {
  const dir = path.join(root, "media");
  if (!fs.existsSync(dir)) return js;
  let out = js;
  for (const name of fs.readdirSync(dir)) {
    const ref = "media/" + name;
    if (!out.includes(ref)) continue;
    const ext = path.extname(name).toLowerCase();
    const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".svg" ? "image/svg+xml" : "image/jpeg";
    const buf = fs.readFileSync(path.join(dir, name));
    out = out.split(ref).join("data:" + mime + ";base64," + buf.toString("base64"));
    mediaStats.push(name + " (" + (buf.length / 1024).toFixed(1) + " KB)");
  }
  return out;
})();

/* --- favicon'u data URI olarak göm (dosya bağımlılığı kalmasın) --- */
const faviconB64 = fs.readFileSync(path.join(root, "icons/favicon-32.png")).toString("base64");
const faviconUri = "data:image/png;base64," + faviconB64;

/* --- başlıktaki dosya bağlantılarını çıkar ---
   NOT: Değiştirme metinleri MUTLAKA fonksiyonla verilir. String.replace'te
   replacement içindeki "$$" tek "$"a, "$&" eşleşmeye dönüşür; bu da gömülen
   kaynak kodunu bozar (ör. "var $$ =" tanımını "var $ =" yapar). */
const put = (re, text) => { html = html.replace(re, () => text); };

put(/\s*<link rel="manifest"[^>]*>/i, "");
put(/\s*<link rel="apple-touch-icon"[^>]*>/i, "");
put(/\s*<link rel="icon"[^>]*>/i, '\n<link rel="icon" href="' + faviconUri + '" />');
put(/\s*<link rel="stylesheet" href="css\/styles\.css" \/>/i, "\n<style>\n" + css + "\n</style>");

/* --- gömülü script bloğuyla değiştir (dosya tarayıcıda çalışmadığı için
       servis çalışanı kapatılır) --- */
const scriptBlock = /<script src="js\/icons\.js"><\/script>[\s\S]*?<script src="js\/app\.js"><\/script>/;
if (!scriptBlock.test(html)) {
  console.error("HATA: script bloğu index.html içinde bulunamadı.");
  process.exit(1);
}
const inlineJS = "/* Tek dosyalık sürüm: servis çalışanı gerekmez */\nwindow.IG_NO_SW = true;\n\n" + jsInlined + "\n";
put(scriptBlock, "<script>\n" + inlineJS + "</script>");

/* --- tek dosyaya not ekle --- */
put(
  "<!DOCTYPE html>",
  "<!--\n  Instagram — Benzeri Uygulama · TEK DOSYA sürümü\n" +
    "  Bu dosya kendi kendine yeter: CSS ve JavaScript içine gömülüdür.\n" +
    "  Telefona kopyalayıp tarayıcıda açmanız yeterli. PWA olarak kurmak\n" +
    "  (Ana ekrana ekle) için projeyi bir sunucudan yayınlayın.\n" +
    "  Üretim tarihi: " + new Date().toISOString().slice(0, 10) + "\n" +
    "  Kaynak: tools/build-single.js\n-->\n<!DOCTYPE html>"
);

/* --- güvenlik kontrolü: gömülen kod kaynakla birebir aynı olmalı ------- */
const embedded = html.match(/<script>([\s\S]*)<\/script>/);
const cssEmbedded = html.match(/<style>([\s\S]*)<\/style>/);
if (!embedded || embedded[1] !== "\n" + inlineJS) {
  console.error("HATA: gömülen JavaScript kaynakla birebir aynı değil (kaçış sorunu?).");
  process.exit(1);
}
if (!cssEmbedded || cssEmbedded[1] !== "\n" + css + "\n") {
  console.error("HATA: gömülen CSS kaynakla birebir aynı değil.");
  process.exit(1);
}
if (!/var \$\$ = /.test(embedded[1])) {
  console.error("HATA: '$' / '$$' tanımları gömülü kodda bozulmuş.");
  process.exit(1);
}

fs.writeFileSync(outFile, html, "utf8");

const kb = (n) => (n / 1024).toFixed(1) + " KB";
console.log("Tek dosya üretildi:", path.relative(root, outFile), "→", kb(Buffer.byteLength(html)));
console.log("  CSS:", kb(Buffer.byteLength(css)));
console.log("  JS :", kb(Buffer.byteLength(js)), "(" + jsFiles.length + " dosya)");
console.log("  Gömülen yerel görsel:", mediaStats.length ? mediaStats.join(", ") : "yok");

// Yalnızca HTML kabuğunda kalan dış başvuruları ara (JS içindeki metinler hariç)
const shell = html.split("<script>")[0];
const dis = (shell.match(/(?:src|href)="(?!data:|https?:|#)[^"]+"/g) || []);
console.log("  Kalan dış dosya başvurusu:", dis.length ? dis.join(", ") : "yok ✓");
