/* ==========================================================================
   tools/screen-test.js — Ekran (DOM) entegrasyon testi
   Tarayıcı olmadan, sahte ama yeterince yetenekli bir DOM üzerinde app.js'i
   çalıştırıp TÜM rotaları tek tek çizer; boş/çökmüş ekranları yakalar.

   Çalıştırma:
     node tools/screen-test.js
   ========================================================================== */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
let passed = 0;
const failures = [];

function ok(name, condition, extra) {
  if (condition) { passed++; console.log("  ✓ " + name); }
  else { failures.push(name + (extra ? " → " + extra : "")); console.log("  ✗ " + name + (extra ? " → " + extra : "")); }
}
function eq(name, actual, expected) {
  ok(name, actual === expected, `beklenen ${JSON.stringify(expected)}, gelen ${JSON.stringify(actual)}`);
}

/* --- minik DOM ---------------------------------------------------------- */
const timers = [];
let timerId = 1;

function makeEl(tag) {
  const el = {
    tagName: (tag || "div").toUpperCase(),
    nodeName: (tag || "div").toUpperCase(),
    innerHTML: "", textContent: "", className: "", hidden: false,
    scrollTop: 0, scrollHeight: 0, clientHeight: 0, offsetWidth: 0,
    style: {}, dataset: {}, attrs: {}, value: "", files: null,
    children: [], childNodes: [],
    classList: {
      _set: new Set(),
      add(...c) { c.forEach((x) => this._set.add(x)); },
      remove(...c) { c.forEach((x) => this._set.delete(x)); },
      toggle(c, on) { if (on === undefined) on = !this._set.has(c); on ? this._set.add(c) : this._set.delete(c); return on; },
      contains(c) { return this._set.has(c); }
    },
    setAttribute(k, v) { this.attrs[k] = String(v); },
    getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; },
    hasAttribute(k) { return k in this.attrs; },
    removeAttribute(k) { delete this.attrs[k]; },
    addEventListener() {}, removeEventListener() {},
    appendChild(c) { this.children.push(c); c.parentNode = this; return c; },
    removeChild(c) { this.children = this.children.filter((x) => x !== c); return c; },
    insertAdjacentHTML(where, html) { this.innerHTML += html; },
    remove() { if (this.parentNode) this.parentNode.removeChild(this); },
    replaceWith() {},
    closest() { return null; },
    focus() {}, blur() {}, click() {}, select() {}, setSelectionRange() {},
    querySelector() { return makeEl(); },
    querySelectorAll() { return []; },
    getBoundingClientRect() { return { x: 0, y: 0, width: 400, height: 400, top: 0, left: 0, right: 400, bottom: 400 }; },
    get firstElementChild() { return makeEl(); },
    get parentNode() { return this._p || null; },
    set parentNode(v) { this._p = v; }
  };
  return el;
}

const registry = new Map();
function q(sel) {
  if (!registry.has(sel)) {
    const el = makeEl(sel === "#clock" ? "span" : "div");
    el.__selector = sel;
    registry.set(sel, el);
  }
  return registry.get(sel);
}

const domReady = [];

const documentStub = {
  readyState: "complete",
  documentElement: makeEl("html"),
  body: makeEl("body"),
  activeElement: null,
  querySelector: q,
  getElementById: (id) => q("#" + String(id).replace(/^#/, "")),
  querySelectorAll: () => [],
  createElement: (t) => makeEl(t),
  addEventListener(type, fn) { domReady.push({ type, fn }); },
  removeEventListener() {}
};

const sandbox = {
  console,
  setTimeout(fn, ms) { const id = timerId++; timers.push({ id, fn: fn, ms: ms || 0 }); return id; },
  clearTimeout(id) { const i = timers.findIndex((t) => t.id === id); if (i >= 0) timers.splice(i, 1); },
  setInterval() { return 0; },
  clearInterval() {},
  requestAnimationFrame(fn) { timers.push({ id: timerId++, fn: fn, ms: 0 }); return timerId; },
  cancelAnimationFrame() {},
  Date, Math, JSON, Promise, Object, Array, String, Number, Boolean, RegExp, Error, Set, Map, Symbol,
  encodeURIComponent, decodeURIComponent, parseInt, parseFloat, isNaN,
  Intl,
  Blob: function () {},
  URL: { createObjectURL: () => "blob:x", revokeObjectURL() {} },
  localStorage: (() => {
    const m = new Map();
    return {
      getItem: (k) => (m.has(k) ? m.get(k) : null),
      setItem: (k, v) => m.set(k, String(v)),
      removeItem: (k) => m.delete(k),
      clear: () => m.clear()
    };
  })(),
  navigator: { clipboard: null },
  location: { hash: "#/feed", origin: "http://127.0.0.1:4173", pathname: "/index.html", protocol: "http:", search: "" },
  history: { length: 3, back() {}, replaceState() {}, pushState() {} },
  matchMedia: () => ({ matches: false, addEventListener() {} }),
  getComputedStyle: () => ({ getPropertyValue: () => "" }),
  IntersectionObserver: function () { this.observe = () => {}; this.disconnect = () => {}; },
  FileReader: function () { this.readAsDataURL = () => {}; },
  Image: function () { this.width = 10; this.height = 10; },
  document: documentStub
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.self = sandbox;
sandbox.addEventListener = function (type, fn) { domReady.push({ type, fn }); };
sandbox.removeEventListener = function () {};
sandbox.matchMedia = sandbox.matchMedia;
vm.createContext(sandbox);

function flush(limit) {
  let guard = 0;
  while (timers.length && guard++ < (limit || 400)) {
    const t = timers.shift();
    try { t.fn(); } catch (e) { throw new Error("zamanlayıcı hatası: " + e.message); }
  }
}

const single = process.argv[2];           // verilirse: tek dosyalık sürümün gömülü scripti
const files = single
  ? [single]
  : ["js/icons.js", "js/data.js", "js/store.js", "js/components.js", "js/app.js"];

files.forEach((rel) => {
  vm.runInContext(fs.readFileSync(path.join(root, rel), "utf8"), sandbox, { filename: rel });
});

const IG = sandbox.window.IG;
const App = IG.App;
const Store = IG.Store;
const screen = q("#screen");
const overlays = q("#overlays");

function render(route) {
  sandbox.location.hash = "#" + route;
  timers.length = 0;
  App.render();
  flush();
  return screen.innerHTML;
}

/* --- testler ------------------------------------------------------------ */
console.log("\nRota çizimi");
const routes = [
  ["/feed", "akış"],
  ["/explore", "keşfet"],
  ["/reels", "reels"],
  ["/activity", "bildirimler"],
  ["/profile/gunseli_beyhan", "profil (ben)"],
  ["/profile/elifkaman", "profil (başkası)"],
  ["/saved", "kaydedilenler"],
  ["/direct", "mesajlar"],
  ["/direct/d1", "sohbet d1"],
  ["/direct/d2", "sohbet d2 (son mesaj benim)"],
  ["/direct/d5", "sohbet d5 (son mesaj benim)"],
  ["/settings", "ayarlar"],
  ["/create", "yeni gönderi"],
  ["/post/p1", "gönderi detayı"],
  ["/post/p23", "kendi gönderim"],
  ["/bilinmeyen-rota", "geçersiz rota"]
];

routes.forEach(([route, label]) => {
  let html = "";
  let err = null;
  try { html = render(route); }
  catch (e) { err = e.message; }
  ok(label + " çizildi (" + route + ")", !err && html.length > 120, err || ("uzunluk " + html.length));
  if (!err) {
    ok(label + " sağlıklı HTML", !/undefined|NaN|\[object Object\]/.test(html),
      "şüpheli çıktı: " + (html.match(/.{0,35}(undefined|NaN|\[object Object\]).{0,35}/) || [""])[0]);
  }
});

console.log("\nEkran içerikleri");
const feed = render("/feed");
ok("akışta hikâye şeridi", feed.includes("story-bar"));
ok("akışta gönderi kartı", feed.includes('class="post"'));
ok("akışta gönderi açıklaması", feed.includes("Küçük ama işe yarayan"));
ok("akışta yorum önizlemesi", feed.includes("comment__text"));
ok("akışta beğeni özeti", feed.includes("beğendi") || feed.includes("beğenme"));

const explore = render("/explore");
ok("keşfette etiket çipleri", explore.includes("chip") && explore.includes("kahve"));
ok("keşfette ızgara", explore.includes("grid3"));
ok("keşfette önerilen hesaplar", explore.includes("suggest__card"));

const reelHTML = render("/reels");
eq("reels sayısı", (reelHTML.match(/class="reel"/g) || []).length, Store.reels().length);
ok("reels eylem çubuğu", reelHTML.includes("reel__side") && reelHTML.includes("reel__audio"));
ok("reels kullanıcı bilgisi", reelHTML.includes("reel__user"));

const activity = render("/activity");
ok("bildirimler listesi", activity.includes("notif__text"));
ok("bildirimlerde takip düğmesi", activity.includes('data-act="follow"'));

const meProfile = render("/profile/gunseli_beyhan");
ok("profilde istatistikler", meProfile.includes("pstat") && meProfile.includes("gönderi"));
ok("profilde kendi düğmeleri", meProfile.includes("Profili düzenle"));
ok("kendi profilimde Instagram boş durumu", meProfile.includes("pempty") && meProfile.includes("Gönderi paylaş"));
ok("kendi profilimde ilk gönderi düğmesi", meProfile.includes("İlk gönderini paylaş"));
ok("profilde tam 3 sekme (gönderi/reels/etiket)", (meProfile.match(/class="tab[ "]/g) || []).length === 3);
ok("profilde sekmeler", meProfile.includes("tabs"));
ok("kendi profilimde +Yeni dairesi", meProfile.includes("highlight__ring--new"));
ok("kendi profilimde kapaklı öne çıkan", meProfile.includes('data-act="highlight-open"') && meProfile.includes("Anılar"));
ok("öne çıkan kapağı yerel dosya", meProfile.includes("media/gunseli-01.jpg"));
ok("öne çıkan oluşturma düğmesi", meProfile.includes('data-act="highlight-create"'));
ok("profile düzenleme / biyografi ekle", meProfile.includes("edit-profile"));

const otherProfile = render("/profile/elifkaman");
ok("başkasının profilinde takip düğmesi", otherProfile.includes('data-act="follow"'));
ok("başkasının profilinde mesaj düğmesi", otherProfile.includes("Mesaj gönder"));
ok("doğrulama rozeti", otherProfile.includes("ic--verified"));
ok("başkasının profilinde öne çıkanlar", otherProfile.includes("highlight__ring"));
ok("başkasının profilinde ızgara", otherProfile.includes("grid3"));

const saved = render("/saved");
ok("kaydedilenler ekranı", saved.includes("saved-head") && saved.includes("Yalnızca sen görürsün"));
ok("kaydedilenlerde ızgara", saved.includes("grid3"));

const inbox = render("/direct");
ok("gelen kutusunda notlar", inbox.includes("notes") && inbox.includes("note__bubble"));
ok("gelen kutusunda sohbet satırları", inbox.includes("chatrow"));
ok("gelen kutusunda okunmamış rozeti", inbox.includes("chatrow__badge"));

console.log("\nSohbet ekranı (hata regresyonu)");
["d1", "d2", "d3", "d4", "d5", "d6"].forEach((id) => {
  render("/direct/" + id);
  const boxHTML = q("#chatMessages").innerHTML;
  const bubbles = (boxHTML.match(/class="msg/g) || []).length;
  const expected = Store.chat(id).messages.length;
  eq("sohbet " + id + " balonları", bubbles, expected);
});
render("/direct/d2");
ok("son mesaj benimse 'Görüldü' yazar", q("#chatMessages").innerHTML.includes("Görüldü"));
ok("sohbet ekranı boş kalmıyor", q("#chatMessages").innerHTML.length > 100);

const chatScreen = render("/direct/d2");
ok("sohbet başlığı kullanıcı adı", chatScreen.includes("selin.arslan") && !chatScreen.includes("elifkaman</b>"));
ok("sohbet giriş alanı", chatScreen.includes("chat__input") && chatScreen.includes("Mesaj yaz"));

const settings = render("/settings");
ok("ayarlarda tema anahtarı", settings.includes("theme-toggle"));
ok("ayarlarda sıfırlama", settings.includes("reset-data"));
ok("ayarlarda JSON yedeği al/geri yükle", settings.includes("export-data") && settings.includes("import-data"));
ok("ayarlarda kaydedilenler kısayolu", settings.includes("go-saved"));
ok("ayarlarda depolanan gönderi", settings.includes(String(Store.state.posts.length)));

const create = render("/create");
ok("oluştur ekranında galeri", create.includes("create-sel") && (create.match(/cell--pick/g) || []).length > 5);
ok("oluştur ekranında toplu yükleme", create.includes('id="fileInputMulti"') && create.includes("multiple"));
ok("oluştur ekranında kamera girdisi", create.includes('id="cameraInput"'));

const post = render("/post/p1");
ok("gönderi detayında yorum bölümü", post.includes("detail__comments"));
ok("gönderi detayında yorum girişi", post.includes("detail__input"));
ok("gönderi detayında tüm yorumlar", post.includes("comment--detail"));

console.log("\nDurum ve tema");
const themeAttrBefore = sandbox.document.documentElement.attrs["data-theme"];
Store.setTheme("light");
eq("tema deposu güncellendi", Store.settings.theme, "light");
eq("tema DOM'a uygulandı", sandbox.document.documentElement.attrs["data-theme"], "light");
Store.setTheme("dark");
eq("tema geri alındı", sandbox.document.documentElement.attrs["data-theme"], "dark");

eq("geçersiz rota akışa düşer", render("/bilinmeyen-rota"), render("/feed"));

console.log("\nKatmanlar");
App.openComments("p2");
flush();
const sheetEl = overlays.children[overlays.children.length - 1];
ok("yorum katmanı açıldı", !!sheetEl && sheetEl.innerHTML.includes("comments__input"),
  "katman bulunamadı");
ok("yorum katmanında mevcut yorumlar", !!sheetEl && sheetEl.innerHTML.includes("comment__text"));
ok("yorum katmanında kapatma düğmesi", !!sheetEl && sheetEl.innerHTML.includes("sheet-close"));

console.log("\n" + "─".repeat(58));
if (failures.length) {
  console.log(`${passed} test geçti, ${failures.length} test BAŞARISIZ:`);
  failures.forEach((f) => console.log("   • " + f));
  process.exit(1);
} else {
  console.log(`Tüm ekran testleri geçti: ${passed} doğrulama.`);
}
