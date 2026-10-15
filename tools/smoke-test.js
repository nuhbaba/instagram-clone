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
console.log("\nVeri katmanı");
eq("kullanıcı sayısı", Store.state.users.length, 16);
eq("gönderi sayısı", Store.state.posts.length, 25);
eq("hikâye sayısı", Store.state.stories.length, 9);
eq("sohbet sayısı", Store.state.chats.length, 6);
eq("bildirim sayısı", Store.state.notifications.length, 14);
ok("me kullanıcısı bulundu", Store.me() && Store.me().username === "deniz.yildiz");
eq("kendi gönderi sayım", Store.postCount(Store.meId), 3);

console.log("\nSeçiciler");
const feed = Store.feed();
ok("akış yeterli uzunlukta (" + feed.length + ")", feed.length >= 10);
ok("akışta kendi gönderilerim var", feed.some((p) => p.userId === Store.meId));
ok("akışta reels yok", feed.every((p) => p.kind !== "reel"));
ok("akış yalnızca takip edilenler + ben", feed.every((p) => p.userId === Store.meId || Store.isFollowing(p.userId)));
ok("akış yeniden-eskiye sıralı", feed.every((p, i) => i === 0 || feed[i - 1].at >= p.at));
eq("reels sayısı", Store.reels().length, 9);
eq("keşfet tüm gönderiler", Store.explore().length, Store.state.posts.length);
ok("keşfet popülerliğe göre sıralı", Store.explore()[0].likesBase >= Store.explore()[1].likesBase);
eq("kaydedilenler", Store.savedPosts().length, 2);
eq("takipçi sayısı (u1, takip ediliyor)", Store.followersCount(Store.user("u1")), 128401);
eq("takipçi sayısı (u6, takip edilmiyor)", Store.followersCount(Store.user("u6")), 22400);
eq("beğeni sayısı", Store.likedCount(Store.post("p1")), 4820);
eq("yorum sayısı (p1)", Store.commentsCount(Store.post("p1")), 4);
eq("etiketlenen gönderiler (u5)", Store.taggedPosts("u5").length, 1);
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
ok("beğeni kalıcı (localStorage)", JSON.parse(storage.get("instaclone.tr.v1")).posts.find((p) => p.id === "p1").liked === true);
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
Store.toggleFollow("u6");
ok("u6 takip ediliyor", Store.isFollowing("u6") === true);
eq("u6 takipçi +1", Store.followersCount(Store.user("u6")), 22401);
eq("benim takip sayım +1", (Store.state.follows.u0 || []).length, 9);
Store.toggleFollow("u6");
eq("takip geri alındı", (Store.state.follows.u0 || []).length, 8);

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
eq("son mesaj karşıdan", Store.lastMessage(Store.chat("d3")).from, "u4");
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

Store.updateProfile({ name: "Deniz Y.", username: "Deniz.Yildiz!", bio: "yeni bio" });
eq("profil adı güncellendi", Store.me().name, "Deniz Y.");
eq("kullanıcı adı temizlendi", Store.me().username, "deniz.yildiz");
eq("bio güncellendi", Store.me().bio, "yeni bio");

Store.setTheme("light");
eq("tema açık", Store.state.settings.theme, "light");
Store.toggleTheme();
eq("tema koyu", Store.state.settings.theme, "dark");

Store.reset();
eq("sıfırlama sonrası gönderi sayısı", Store.state.posts.length, 25);
eq("sıfırlama sonrası profil", Store.me().username, "deniz.yildiz");

/* --- özet -------------------------------------------------------------- */
console.log("\n" + "─".repeat(58));
if (failures.length) {
  console.log(`${passed} test geçti, ${failures.length} test BAŞARISIZ:`);
  failures.forEach((f) => console.log("   • " + f));
  process.exit(1);
} else {
  console.log(`Tüm testler geçti: ${passed} doğrulama.`);
}
