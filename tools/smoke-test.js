/* ==========================================================================
   tools/smoke-test.js — Tarayıcısız veri katmanı testi
   store.js ve components.js'i sahte bir ortamda çalıştırıp seçicileri,
   eylemleri ve HTML üretimini doğrular.

   Çalıştırma:
     node tools/smoke-test.js
   ========================================================================== */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");

let passed = 0;
const failures = [];

function ok(name, condition, extra) {
  if (condition) {
    passed++;
    console.log("  ✓ " + name);
  } else {
    failures.push(name + (extra ? " → " + extra : ""));
    console.log("  ✗ " + name + (extra ? " → " + extra : ""));
  }
}

function eq(name, actual, expected) {
  ok(name, actual === expected, `beklenen ${JSON.stringify(expected)}, gelen ${JSON.stringify(actual)}`);
}

/* --- sahte tarayıcı ortamı --------------------------------------------- */
const storage = new Map();
const fakeEl = () => ({
  classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
  style: {}, dataset: {},
  setAttribute() {}, getAttribute: () => null, removeAttribute() {},
  appendChild() {}, removeChild() {}, remove() {}, replaceWith() {},
  addEventListener() {}, querySelector: () => null, querySelectorAll: () => [],
  insertAdjacentHTML() {}, innerHTML: "", textContent: "", hidden: false
});

const sandbox = {
  console,
  setTimeout, clearTimeout, setInterval, clearInterval,
  Date, Math, JSON, Promise, Object, Array, String, Number, Boolean, RegExp, Error,
  encodeURIComponent, decodeURIComponent, Blob: function () {}, URL: { createObjectURL: () => "", revokeObjectURL() {} },
  localStorage: {
    getItem: (k) => (storage.has(k) ? storage.get(k) : null),
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k)
  },
  location: { hash: "", origin: "http://127.0.0.1:4173", pathname: "/index.html", protocol: "http:" },
  navigator: { clipboard: null },
  document: {
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    createElement: fakeEl,
    addEventListener() {},
    readyState: "complete",
    documentElement: { setAttribute() {}, getAttribute: () => "dark" },
    body: { classList: { add() {}, remove() {} } }
  }
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.self = sandbox;
vm.createContext(sandbox);

["js/icons.js", "js/data.js", "js/store.js", "js/components.js"].forEach((rel) => {
  const file = path.join(root, rel);
  vm.runInContext(fs.readFileSync(file, "utf8"), sandbox, { filename: rel });
});

const IG = sandbox.window.IG;
const Store = IG.Store;
const C = IG.C;
Store.init();
C.init();

/* --- testler ----------------------------------------------------------- */
const DEMO_GONDERI = 25;    // demo hesapların örnek gönderileri
const PROFIL_ORNEK = 17;    // profil ızgarasındaki yer tutucular (9 kendi fotoğrafım + 8 aile karesi)
const YENI_GONDERI = 18;    // nişan / kına / düğün / günlük gerçek fotoğraf gönderileri
const ETIKET_GONDERI = 3;   // başka hesapların, seni etiketlediği düğün gönderileri
const TOPLAM_GONDERI = DEMO_GONDERI + PROFIL_ORNEK + ETIKET_GONDERI + YENI_GONDERI;

console.log("\nVeri katmanı");
eq("kullanıcı sayısı", Store.state.users.length, 17);
eq("gönderi sayısı (demo + düğün + etiket)", Store.state.posts.length, TOPLAM_GONDERI);
eq("profildeki düğün gönderisi", Store.placeholderCount(), PROFIL_ORNEK);
eq("hikâye sayısı", Store.state.stories.length, 8);
eq("sohbet sayısı", Store.state.chats.length, 7);
eq("bildirim sayısı", Store.state.notifications.length, 9);
ok("me kullanıcısı bulundu", Store.me() && Store.me().username === "gunseli_beyhan");
eq("profildeki gönderi sayısı", Store.postCount(Store.meId), PROFIL_ORNEK + YENI_GONDERI);
eq("kendi hikâyem yok", Store.storiesFor(Store.meId), null);

console.log("\nProfil istatistikleri (istenen sayılar)");
eq("takipçi 214", Store.followersCount(Store.me()), 214);
eq("takip 444", Store.followingCount(Store.me()), 444);
eq("profil gönderi sayısı (yer tutucu + gerçek)", Store.postCount(Store.meId), PROFIL_ORNEK + YENI_GONDERI);

console.log("\nDüğün temalı içerik");
ok("düğün başlıklı gönderiler var", Store.postsOf(Store.meId).filter((p) => p.caption).length >= 20);
ok("düğün görselleri media/ altında", Store.postsOf(Store.meId).every((p) => p.src.indexOf("media/") === 0));
const GERCEK = /^media\/(photo|dugun|nisan|kina|gunluk)-/;
ok("en yeni gönderiler gerçek fotoğraflar", Store.postsOf(Store.meId).slice(0, 9).every((p) => GERCEK.test(p.src)));
eq("kendi fotoğraf sayısı", Store.postsOf(Store.meId).filter((p) => GERCEK.test(p.src)).length, 9 + YENI_GONDERI);
ok("ilk 9 gönderinin başlığı var", Store.postsOf(Store.meId).slice(0, 9).every((p) => p.caption && p.caption.length > 3));
ok("yazışmalarda düğün konusu geçiyor", ["düğün", "nikâh", "kına", "gelinlik", "pasta", "albüm", "drone", "çekim", "tadım"]
  .some((k) => Store.state.chats.some((c) => c.messages.some((m) => m.text.toLowerCase().indexOf(k) !== -1))));
eq("etiketlendiğim düğün gönderisi", Store.taggedPosts(Store.meId).length, ETIKET_GONDERI);
ok("öne çıkanlarda Düğün var", Store.highlightsOf(Store.meId).some((h) => h.title === "Düğün"));

console.log("\nBeyhan ile 4 aylık yazışma (nişan → düğün → evlilik)");
const beyhanSohbet = Store.chat("d7");
ok("Beyhan sohbeti var", !!beyhanSohbet && beyhanSohbet.userId === "u16");
eq("Beyhan mesaj sayısı", beyhanSohbet.messages.length, 87);
ok("sohbet sabitlenmiş", beyhanSohbet.pinned === true);
ok("okunmamış mesaj var", beyhanSohbet.unread > 0);
ok("kimlikler benzersiz", new Set(beyhanSohbet.messages.map((m) => m.id)).size === beyhanSohbet.messages.length);
ok("zaman sırası eskiden yeniye", beyhanSohbet.messages.every((m, i) => i === 0 || beyhanSohbet.messages[i - 1].at <= m.at));
const gunFark = Math.abs(beyhanSohbet.messages[beyhanSohbet.messages.length - 1].at - beyhanSohbet.messages[0].at) / 86400000;
ok("yaklaşık 4 aya yayılıyor (" + Math.round(gunFark) + " gün)", gunFark > 100 && gunFark < 130);
ok("ara ara konuşulmuş (en az 12 ayrı gün)", new Set(beyhanSohbet.messages.map((m) => new Date(m.at).toDateString())).size >= 12);
ok("karşılıklı yazışma", beyhanSohbet.messages.some((m) => m.from === "u16") && beyhanSohbet.messages.some((m) => m.from === "u0"));
const sevgi = beyhanSohbet.messages.filter((m) => /seviyorum|istiyorum/i.test(m.text)).length;
ok("sevgi mesajları yeterli (" + sevgi + ")", sevgi >= 10);
const tumMetin = beyhanSohbet.messages.map((m) => m.text).join(" ");
ok("nişan dönemi geçiyor", /nişan/i.test(tumMetin));
ok("düğün/evlilik geçiyor", /düğün|nikâh|karım|kocam/i.test(tumMetin));
ok("Beyhan profil fotoğrafı yerel dosya", Store.user("u16").avatar === "media/beyhan-01.jpg");
eq("Beyhan kullanıcı adı", Store.user("u16").username, "beyhan");
ok("karşılıklı takip", Store.isFollowing("u16") && Store.state.follows.u16.indexOf("u0") !== -1);
ok("sabitli sohbetler arasında", Store.state.chats.filter((c) => c.pinned).some((c) => c.userId === "u16"));
ok("en son mesaj Beyhan'dan", Store.lastMessage(Store.chat("d7")).from === "u16");
console.log("\n8 aylık paylaşım geçmişi");
const profilGonderileri = Store.postsOf(Store.meId);
const gunOnce = (p) => Math.round((Date.now() - p.at) / 86400000);
ok("en yeni gönderi ~1 ay önce (" + gunOnce(profilGonderileri[0]) + " gün)", Math.abs(gunOnce(profilGonderileri[0]) - 30) <= 3);
ok("en eski gönderi ~8 ay önce (" + gunOnce(profilGonderileri[profilGonderileri.length - 1]) + " gün)", gunOnce(profilGonderileri[profilGonderileri.length - 1]) >= 225);
ok("tüm gönderilerde başlık var", profilGonderileri.every((p) => p.caption && p.caption.length > 3));
ok("aile temalı başlıklar var (" + profilGonderileri.filter((p) => /aile|anne|baba|abla|hala|kuzen/i.test(p.caption)).length + ")", profilGonderileri.filter((p) => /aile|anne|baba|abla|hala|kuzen/i.test(p.caption)).length >= 6);
ok("nişan dönemi geçiyor", profilGonderileri.some((p) => /nişan/i.test(p.caption)));
ok("evlilik kareleri en üstte", profilGonderileri.slice(0, 9).every((p) => GERCEK.test(p.src)));
ok("zaman sırası yeniden eskiye", profilGonderileri.every((p, i) => i === 0 || profilGonderileri[i - 1].at >= p.at));
ok("aylara yayılmış (en az 5 farklı ay)", new Set(profilGonderileri.map((p) => new Date(p.at).getMonth())).size >= 5);
console.log("\nSeçiciler");
const feed = Store.feed();
ok("akış yeterli uzunlukta (" + feed.length + ")", feed.length >= 10);
ok("akışta düğün içeriği var", feed.some((p) => p.caption && p.caption.indexOf("Kına") !== -1));
ok("akışta profil örnekleri görünmez", feed.every((p) => !p.placeholder));
ok("keşfette profil örnekleri görünmez", Store.explore().every((p) => !p.placeholder));
ok("akışta reels yok", feed.every((p) => p.kind !== "reel"));
ok("akış yalnızca takip edilenler + ben", feed.every((p) => p.userId === Store.meId || Store.isFollowing(p.userId)));
ok("akış yeniden-eskiye sıralı", feed.every((p, i) => i === 0 || feed[i - 1].at >= p.at));
eq("reels sayısı", Store.reels().length, 9);
eq("keşfet demo + etiket + gerçek gönderiler", Store.explore().length, DEMO_GONDERI + ETIKET_GONDERI + YENI_GONDERI);
ok("keşfet popülerliğe göre sıralı", Store.explore()[0].likesBase >= Store.explore()[1].likesBase);
eq("kaydedilenler", Store.savedPosts().length, 2);
const takipciSayisi = (id) => Store.state.users.filter((x) => (Store.state.follows[x.id] || []).indexOf(id) !== -1).length;
eq("takipçi sayısı (u1) temel + graf", Store.followersCount(Store.user("u1")), 128400 + takipciSayisi("u1"));
eq("takipçi sayısı (u6) temel + graf", Store.followersCount(Store.user("u6")), 22400 + takipciSayisi("u6"));
ok("kendi takipçim graf sayesinde sıfırdan büyük", Store.followersCount(Store.me()) > 0);
eq("beğeni sayısı", Store.likedCount(Store.post("p1")), 4820);
eq("yorum sayısı (p1)", Store.commentsCount(Store.post("p1")), 4);
eq("etiketlenen gönderiler (u5)", Store.taggedPosts("u5").length, 1);
eq("etiketlendiğim gönderiler", Store.taggedPosts(Store.meId).length, 3);

console.log("\nÖne çıkanlar");
const ozel = Store.highlightsOf(Store.meId);
eq("başlangıçta 2 öne çıkan", ozel.length, 2);
eq("ilk öne çıkan adı", ozel[0].title, "Anılar");
eq("öne çıkan kapağı yerel fotoğraf", ozel[0].cover, "media/gunseli-01.jpg");
eq("ikinci öne çıkan adı", ozel[1].title, "Düğün");
eq("düğün öne çıkan kapağı", ozel[1].cover, "media/photo-01.jpg");
eq("başkasının tanımlı öne çıkanı yok", Store.highlightsOf("u1").length, 0);
const yeniHl = Store.addHighlight(Store.meId, "Seyahat", "media/gunseli-01.jpg", []);
eq("öne çıkan eklendi", Store.highlightsOf(Store.meId).length, 3);
Store.updateHighlight(yeniHl.id, { title: "Yolculuk" });
eq("öne çıkan adı güncellendi", Store.highlightById(yeniHl.id).title, "Yolculuk");
Store.updateHighlight(yeniHl.id, { cover: "https://example.com/kapak.jpg" });
eq("öne çıkan kapağı güncellendi", Store.highlightById(yeniHl.id).cover, "https://example.com/kapak.jpg");
Store.deleteHighlight(yeniHl.id);
eq("öne çıkan silindi", Store.highlightsOf(Store.meId).length, 2);
eq("hikâye sırası ilk eleman görülmemiş", Store.unseenCount(Store.storyBar()[0]) > 0, true);
eq("boş hikâye görülmemiş sayısı", Store.unseenCount({ userId: "u0", items: [] }), 0);
eq("sohbetler sabitlenmiş önce", Store.chats()[0].id, "d1");

console.log("\nBiçimlendirme");
eq("formatCount 128", C.formatCount(128), "128");
eq("formatCount 4820", C.formatCount(4820), "4,8 B");
eq("formatCount 128400", C.formatCount(128400), "128 B");
eq("formatCount 1200000", C.formatCount(1200000), "1,2 Mn");
eq("formatCountExact 128400", C.formatCountExact(128400), "128.400");
eq("timeAgo 38 dk", C.timeAgo(Date.now() - 38 * 60000), "38 dakika önce");
eq("timeAgo 3 saat", C.timeAgo(Date.now() - 3 * 3600000), "3 saat önce");
eq("timeAgo 2 gün", C.timeAgo(Date.now() - 2 * 86400000), "2 gün önce");
eq("timeAgo şimdi", C.timeAgo(Date.now() - 5000), "şimdi");

console.log("\nHTML üretimi");
const card = C.postCard(Store.post("p1"));
ok("postCard gönderi kimliği", card.includes('data-post="p1"'));
ok("postCard kullanıcı adı", card.includes("elifkaman"));
ok("postCard medya", card.includes("post-media__img"));
ok("postCard beğeni düğmesi", card.includes('data-act="like"'));
ok("postCard kaydet düğmesi", card.includes('data-act="save"'));
ok("postCard yorumlar", card.includes("comment__text"));
ok("postCard açıklama metni", card.includes("Sabahın ilk ışığı"), "açıklama gövdesi eksik");
ok("postCard etiket bağlantısı", card.includes("search-hashtag"));
ok("postCard emoji korunmuş", card.includes("🧡"));
const row = C.commentRow(Store.post("p1"), Store.post("p1").comments[0], true);
ok("commentRow yanıtla düğmesi", row.includes("Yanıtla"));
const grid = C.gridCell(Store.post("p2"));
ok("gridCell hücresi", grid.includes('class="cell"') && grid.includes('data-act="post-open"'));
const cell = C.emptyState("home", "Başlık", "Metin");
ok("emptyState başlık", cell.includes("Başlık"));
const ring = C.storyRing(Store.user("u1"), false, 66);
ok("storyRing gradyan", ring.includes("story-ring") && !ring.includes("is-seen"));
const ringSeen = C.storyRing(Store.user("u1"), true, 66);
ok("storyRing görülmüş", ringSeen.includes("is-seen"));
ok("usernameLink etiket", C.usernameLink(Store.user("u1")).includes('data-act="open-profile"'));
ok("avatar yedek verisi", C.avatar(Store.user("u1"), 40).includes("IG.fallback(this)"));
ok("richText etiket bağlantısı", C.richText("deneme #kahve ve @elifkaman").includes('data-act="search-hashtag"'));
ok("richText satır sonu", C.richText("a\nb").includes("<br>"));
ok("içerik kaçışı (XSS)", C.esc("<img onerror=alert(1)>") === "&lt;img onerror=alert(1)&gt;");
ok("richText kaçışı (XSS)", !C.richText("<script>alert(1)</script>").includes("<script>"));
ok("doğrulama rozeti", IG.Icons.verified(12).includes("<svg"));
ok("ikon fallback", IG.Icons.icon("bilinmeyen-ikon").includes("<svg"));

console.log("\nEylemler");
const before = Store.likedCount(Store.post("p1"));
Store.toggleLike("p1");
eq("beğeni arttı", Store.likedCount(Store.post("p1")), before + 1);
Store.persist(true); // debounce'u atla, gerçekten yazıldı mı diye bak
ok("beğeni kalıcı (localStorage)", JSON.parse(storage.get("instaclone.tr.v5")).posts.find((p) => p.id === "p1").liked === true);
Store.toggleLike("p1");
eq("beğeni geri alındı", Store.likedCount(Store.post("p1")), before);

Store.toggleSave("p2");
ok("kaydetme listeye eklendi", Store.state.saved.indexOf("p2") === 0);
Store.toggleSave("p2");
ok("kaydetme listeden çıktı", Store.state.saved.indexOf("p2") === -1);

const cCount = Store.commentsCount(Store.post("p1"));
const newComment = Store.addComment("p1", "test yorumu");
eq("yorum eklendi", Store.commentsCount(Store.post("p1")), cCount + 1);
ok("yorum sahibi ben", newComment.userId === Store.meId);
const reply = Store.addComment("p1", "yanıt", newComment.id);
eq("yanıt eklendi", Store.commentsCount(Store.post("p1")), cCount + 2);
eq("yanıt ebeveyne bağlı", newComment.replies.length, 1);
Store.deleteComment("p1", reply.id);
eq("yanıt silindi", Store.commentsCount(Store.post("p1")), cCount + 1);
Store.deleteComment("p1", newComment.id);
eq("yorum silindi", Store.commentsCount(Store.post("p1")), cCount);
ok("gönderi yorumları temiz kaldı", Store.post("p1").comments.every((c) => c.id !== newComment.id));

ok("u6 takip edilmiyor", Store.isFollowing("u6") === false);
const u6Before = Store.followersCount(Store.user("u6"));
Store.toggleFollow("u6");
ok("u6 takip ediliyor", Store.isFollowing("u6") === true);
eq("u6 takipçi +1", Store.followersCount(Store.user("u6")), u6Before + 1);
eq("benim takip sayım +1", (Store.state.follows.u0 || []).length, 10);
Store.toggleFollow("u6");
eq("takip geri alındı", (Store.state.follows.u0 || []).length, 9);
eq("takipçi sayısı geri döndü", Store.followersCount(Store.user("u6")), u6Before);

const postCountBefore = Store.state.posts.length;
const np = Store.addPost({ src: "https://example.com/a.jpg", caption: "deneme #test", location: "İzmir", kind: "post" });
eq("gönderi eklendi", Store.state.posts.length, postCountBefore + 1);
eq("gönderi akışta ilk", Store.feed()[0].id, np.id);
ok("profilimde görünüyor", Store.postsOf(Store.meId).some((p) => p.id === np.id));
eq("yeni gönderi 0 beğeni", Store.likedCount(np), 0);
Store.notify({ type: "like", userId: "u1", postId: np.id, text: "gönderini beğendi" });
eq("bildirim eklendi", Store.unreadNotifications() > 0, true);
Store.toggleArchive(np.id);
ok("arşivlendi", Store.postsOf(Store.meId).every((p) => p.id !== np.id));
Store.deletePost(np.id);
eq("gönderi silindi", Store.state.posts.length, postCountBefore);

const chat = Store.chat("d3");
const msgCount = chat.messages.length;
Store.sendMessage("d3", "selam");
eq("mesaj gönderildi", Store.chat("d3").messages.length, msgCount + 1);
Store.receiveMessage("d3", "merhaba!");
eq("yanıt geldi", Store.chat("d3").messages.length, msgCount + 2);
eq("son mesaj karşıdan", Store.lastMessage(Store.chat("d3")).from, Store.chat("d3").userId);
Store.markChatRead("d3");
eq("okunmamış sıfır", Store.chat("d3").unread, 0);

const st = Store.storiesFor("u1");
const beforeSeen = Store.unseenCount(st);
Store.markStorySeen("u1", st.items[0].id);
eq("hikâye görüldü", Store.unseenCount(st), beforeSeen - 1);
Store.markStorySeen("u1", st.items[0].id);
eq("aynı hikâye iki kez sayılmaz", Store.unseenCount(st), beforeSeen - 1);

eq("kullanıcı arama", Store.searchUsers("elif")[0].id, "u1");
eq("kullanıcı adıyla arama", Store.userByUsername("@MERTCANOZ").id, "u2");
eq("etiket arama", Store.searchHashtags("#kah")[0].tag, "kahve");

Store.updateProfile({ name: "Günseli B.", username: "Gunseli.Beyhan!", bio: "yeni bio" });
eq("profil adı güncellendi", Store.me().name, "Günseli B.");
eq("kullanıcı adı temizlendi", Store.me().username, "gunseli.beyhan");
eq("bio güncellendi", Store.me().bio, "yeni bio");

Store.setTheme("light");
eq("tema açık", Store.state.settings.theme, "light");
Store.toggleTheme();
eq("tema koyu", Store.state.settings.theme, "dark");

console.log("\nYedekleme / geri yükleme");
Store.addPost({ src: "https://example.com/yedek.jpg", caption: "yedekte olacak gönderi", kind: "post" });
const yedek = JSON.parse(JSON.stringify(Store.state));
const yedekKullanici = Store.me().username;
const yedekProfilAdi = Store.me().name;
eq("yedekte 1 gönderi fazla", yedek.posts.length, TOPLAM_GONDERI + 1);
ok("geçersiz yedek reddedilir", Store.importState({ foo: 1 }) === false);
ok("boş yedek reddedilir", Store.importState(null) === false);
ok("geçerli yedek kabul edilir", Store.importState(yedek) === true);
eq("geri yüklenen gönderi sayısı", Store.state.posts.length, TOPLAM_GONDERI + 1);
eq("geri yüklenen kullanıcı adı", Store.me().username, yedekKullanici);
eq("geri yüklenen profil adı", Store.me().name, yedekProfilAdi);
ok("yedek kalıcı yazıldı", JSON.parse(storage.get("instaclone.tr.v5")).posts.length === TOPLAM_GONDERI + 1);

console.log("\nKalıcılık (kayıtlı veri yeniden okunuyor mu)");
Store.persist(true);
const kayitliGonderi = Store.state.posts.length;
const kayitliKullanici = Store.me().username;
Store.init();   // localStorage'dan baştan yükler
eq("yeniden yüklemede gönderi sayısı korunur", Store.state.posts.length, kayitliGonderi);
eq("yeniden yüklemede profil korunur", Store.me().username, kayitliKullanici);

console.log("\nİçerik sürümü (eski cihaz kaydı atılır mı)");
const eskiKayit = JSON.parse(JSON.stringify(Store.state));
eskiKayit.seedRev = "cok-eski-icerik";
eskiKayit.posts = eskiKayit.posts.slice(0, 3);
storage.set("instaclone.tr.v5", JSON.stringify(eskiKayit));
Store.init();
eq("eski içerik sürümü atıldı", Store.state.seedRev, IG.seed.rev);
eq("yeni tohumdaki gönderi sayısı", Store.state.posts.length, TOPLAM_GONDERI);
ok("kendi fotoğraflarım geri geldi", Store.postsOf(Store.meId).slice(0, 9).every((p) => GERCEK.test(p.src)));

console.log("\nÖrnek gönderileri temizleme");
const temizlenen = Store.clearPlaceholders();
eq("örnek gönderiler kaldırıldı", temizlenen, PROFIL_ORNEK);
eq("örnek gönderi kalmadı", Store.placeholderCount(), 0);

Store.reset();
eq("sıfırlama sonrası gönderi sayısı", Store.state.posts.length, TOPLAM_GONDERI);
eq("sıfırlama sonrası profil", Store.me().username, "gunseli_beyhan");
eq("sıfırlama sonrası profil gönderisi", Store.postCount(Store.meId), PROFIL_ORNEK + YENI_GONDERI);
eq("sıfırlama sonrası takipçi 214", Store.followersCount(Store.me()), 214);

/* --- özet -------------------------------------------------------------- */
console.log("\n" + "─".repeat(58));
if (failures.length) {
  console.log(`${passed} test geçti, ${failures.length} test BAŞARISIZ:`);
  failures.forEach((f) => console.log("   • " + f));
  process.exit(1);
} else {
  console.log(`Tüm testler geçti: ${passed} doğrulama.`);
}
