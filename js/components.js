/* ==========================================================================
   components.js — Yeniden kullanılabilir arayüz parçaları
   ========================================================================== */
window.IG = window.IG || {};

(function (IG) {
  "use strict";

  var Icons = IG.Icons;
  var Store = null; // init sonrası atanır
  var C = {};

  /* ------------------------------------------------------------------ */
  /* Yardımcılar                                                         */
  /* ------------------------------------------------------------------ */
  C.esc = function (s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };

  /** Metindeki #etiket, @bahsetme ve satır sonlarını biçimlendirir. */
  C.richText = function (s) {
    var safe = C.esc(s);
    safe = safe.replace(/(^|\s)(#[\wçğıöşüÇĞİÖŞÜ_]+)/g, '$1<a class="lnk" data-act="search-hashtag" data-tag="$2">$2</a>');
    safe = safe.replace(/(^|\s)(@[\w.]+)/g, '$1<a class="lnk" data-act="open-username" data-username="$2">$2</a>');
    return safe.replace(/\n/g, "<br>");
  };

  C.formatCount = function (n) {
    n = Number(n) || 0;
    if (n < 1000) return String(n);
    if (n < 1000000) {
      var b = n / 1000;
      return (b >= 100 ? Math.round(b) : Math.round(b * 10) / 10).toString().replace(".", ",") + " B";
    }
    var m = n / 1000000;
    return (Math.round(m * 10) / 10).toString().replace(".", ",") + " Mn";
  };

  C.formatCountExact = function (n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  C.timeAgo = function (at) {
    var diff = Math.max(0, Date.now() - at);
    var m = Math.floor(diff / 60000);
    if (m < 1) return "şimdi";
    if (m < 60) return m + " dakika önce";
    var h = Math.floor(m / 60);
    if (h < 24) return h + " saat önce";
    var d = Math.floor(h / 24);
    if (d < 7) return d + " gün önce";
    var w = Math.floor(d / 7);
    if (w < 5) return w + " hafta önce";
    var months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    var dt = new Date(at);
    return dt.getDate() + " " + months[dt.getMonth()];
  };

  C.clockTime = function (at) {
    var d = new Date(at);
    return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
  };

  C.shortTime = function (at) {
    var diff = Date.now() - at;
    if (diff < 60000) return "şimdi";
    if (diff < 3600000) return Math.floor(diff / 60000) + " dk";
    if (diff < 86400000) return Math.floor(diff / 3600000) + " sa";
    var d = Math.floor(diff / 86400000);
    if (d < 7) return d + " g";
    return Math.floor(d / 7) + " hf";
  };

  C.hash = function (str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };

  /* ------------------------------------------------------------------ */
  /* Görsel yedekleri (internet yoksa yerel SVG gradyan üretir)          */
  /* ------------------------------------------------------------------ */
  var FALLBACK_COLORS = [
    ["#833ab4", "#fd1d1d", "#fcb045"],
    ["#4f5bd5", "#962fbf", "#d62976"],
    ["#11998e", "#38ef7d", "#0f2027"],
    ["#f7971e", "#ffd200", "#ff6a00"],
    ["#1f4037", "#99f2c8", "#0f3443"],
    ["#2b5876", "#4e4376", "#8e54e9"]
  ];

  function gradientSVG(seed, w, h) {
    var hsh = C.hash(seed || "x");
    var pal = FALLBACK_COLORS[hsh % FALLBACK_COLORS.length];
    var id = "g" + (hsh % 99999);
    var circles = "";
    for (var i = 0; i < 5; i++) {
      var cxp = ((hsh >> (i * 3)) % 100);
      var cyp = ((hsh >> (i * 5 + 2)) % 100);
      var r = 12 + ((hsh >> (i * 2)) % 26);
      circles += '<circle cx="' + cxp + '%" cy="' + cyp + '%" r="' + r + '%" fill="#ffffff" opacity="0.07"/>';
    }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + " " + h + '">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + pal[0] + '"/><stop offset=".55" stop-color="' + pal[1] + '"/>' +
      '<stop offset="1" stop-color="' + pal[2] + '"/></linearGradient></defs>' +
      '<rect width="' + w + '" height="' + h + '" fill="url(#' + id + ')"/>' + circles + "</svg>";
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function initialsAvatar(name, size) {
    var parts = String(name || "?").trim().split(/\s+/);
    var txt = (parts[0] ? parts[0][0] : "?") + (parts[1] ? parts[1][0] : "");
    var hsh = C.hash(name || "x");
    var pal = FALLBACK_COLORS[hsh % FALLBACK_COLORS.length];
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
      '<defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + pal[0] + '"/><stop offset="1" stop-color="' + pal[2] + '"/></linearGradient></defs>' +
      '<rect width="100" height="100" fill="url(#a)"/>' +
      '<text x="50" y="50" text-anchor="middle" dominant-baseline="central" font-family="Segoe UI, Arial, sans-serif" ' +
      'font-size="42" font-weight="600" fill="#fff">' + C.esc(txt.toUpperCase()) + "</text></svg>";
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  C.fallbackSVG = gradientSVG;

  /** Tek dosyalık sürümde yerel görseller (media/*) data URI haritasına çevrilir;
      bu fonksiyon hem sabit hem dinamik yolları çözer. */
  function resolveMedia(src) {
    if (!src) return src;
    var map = window.IG_MEDIA_INLINE;
    if (map && map[src]) return map[src];
    return src;
  }
  C.resolveMedia = resolveMedia;

  /** <img onerror> yakalayıcı: bozuk/erişilemeyen görseli yerel SVG ile değiştirir. */
  function fallback(img) {
    img.onerror = null;
    var kind = img.getAttribute("data-kind") || "photo";
    var seed = img.getAttribute("data-seed") || img.getAttribute("alt") || "x";
    if (kind === "avatar") {
      img.src = initialsAvatar(img.getAttribute("data-name") || seed, 100);
    } else {
      var w = Number(img.getAttribute("width")) || 900;
      var h = Number(img.getAttribute("height")) || 900;
      img.src = gradientSVG(seed, w, h);
    }
    img.classList.add("is-fallback");
  }
  C.fallback = fallback;
  window.IG.fallback = fallback;

  /* ------------------------------------------------------------------ */
  /* Avatar / medya                                                      */
  /* ------------------------------------------------------------------ */
  C.avatar = function (user, size, opts) {
    opts = opts || {};
    if (!user) user = { name: "?", username: "?", avatar: "" };
    var cls = "avatar" + (opts.cls ? " " + opts.cls : "");
    var src = resolveMedia(user.avatar) || initialsAvatar(user.name, size);
    return '<img class="' + cls + '" src="' + C.esc(src) + '" width="' + size + '" height="' + size +
      '" alt="' + C.esc(user.username) + ' profil fotoğrafı" loading="lazy" decoding="async"' +
      ' data-kind="avatar" data-name="' + C.esc(user.name) + '" data-seed="' + C.esc(user.username) +
      '" onerror="IG.fallback(this)" style="--av:' + size + 'px">';
  };

  C.media = function (src, alt, w, h, cls, eager) {
    return '<img class="' + (cls || "media") + '" src="' + C.esc(resolveMedia(src)) + '" alt="' + C.esc(alt) +
      '" width="' + w + '" height="' + h + '" ' + (eager ? 'loading="eager"' : 'loading="lazy"') +
      ' decoding="async" data-kind="photo"' +
      ' data-seed="' + C.esc(alt || src) + '" onerror="IG.fallback(this)">';
  };

  /** Hikâye halkası: görülmemişse Instagram gradyanı, görülmüşse gri. */
  C.storyRing = function (user, seen, size, opts) {
    opts = opts || {};
    var ringCls = "story-ring" + (seen ? " is-seen" : "") + (opts.cls ? " " + opts.cls : "");
    var badge = opts.badge ? '<span class="story-ring__badge">' + opts.badge + "</span>" : "";
    var live = opts.live ? '<span class="story-ring__live">CANLI</span>' : "";
    return '<span class="' + ringCls + '" style="--av:' + size + 'px" data-act="story-open" data-user="' + user.id + '">' +
      C.avatar(user, size) + live + badge + "</span>";
  };

  C.usernameLink = function (user, opts) {
    opts = opts || {};
    return '<a class="uname' + (opts.cls ? " " + opts.cls : "") + '" data-act="open-profile" data-user="' + user.id + '">' +
      C.esc(user.username) + "</a>" + (user.verified ? Icons.verified(opts.badge || 12) : "");
  };

  C.followButton = function (user, opts) {
    opts = opts || {};
    var following = Store.isFollowing(user.id);
    var cls = "btn " + (following ? "btn--ghost" : "btn--primary") + (opts.cls ? " " + opts.cls : "");
    var label = following ? (opts.followingLabel || "Takip ediliyor") : (opts.label || "Takip et");
    return '<button class="' + cls + '" data-act="follow" data-user="' + user.id + '">' + C.esc(label) + "</button>";
  };

  /* ------------------------------------------------------------------ */
  /* Gönderi kartı                                                       */
  /* ------------------------------------------------------------------ */
  C.postCard = function (p, opts) {
    opts = opts || {};
    var u = Store.user(p.userId);
    if (!u) return "";
    var story = Store.storiesFor(p.userId);
    var hasUnseen = story ? Store.unseenCount(story) > 0 : false;
    var liked = p.liked;
    var likedBy = Store.friendsWhoLiked(p);
    var likesTxt = "";
    var others = Math.max(0, Store.likedCount(p) - likedBy.length);
    if (likedBy.length) {
      likesTxt = likedBy.map(function (f) { return C.esc(f.username); }).join(", ") +
        (others > 0 ? " ve " + C.formatCountExact(others) + " kişi daha" : "") + " beğendi";
    } else {
      likesTxt = C.formatCountExact(Store.likedCount(p)) + " beğenme";
    }

    var comments = p.comments || [];
    var visible;
    if (opts.allComments) visible = comments;
    else visible = comments.slice(-2);
    var hidden = comments.length - visible.length;

    var commentsHTML = visible.map(function (c) { return C.commentRow(p, c, false); }).join("");

    return '<article class="post" data-post="' + p.id + '">' +
      '<header class="post-head">' +
        '<span class="post-head__ring">' +
          (hasUnseen ? C.storyRing(u, false, 32) : '<span data-act="open-profile" data-user="' + u.id + '">' + C.avatar(u, 32) + "</span>") +
        "</span>" +
        '<span class="post-head__meta">' +
          C.usernameLink(u) +
          '<span class="post-head__sub">' + (p.location ? C.esc(p.location) : "") +
            (p.kind === "reel" ? (p.location ? " · " : "") + (p.audio ? C.esc(p.audio) : "Reels") : "") +
          "</span>" +
        "</span>" +
        '<button class="icon-btn" data-act="post-menu" data-post="' + p.id + '" aria-label="Gönderi seçenekleri">' + Icons.icon("more") + "</button>" +
      "</header>" +

      '<div class="post-media" data-act="post-open" data-post="' + p.id + '">' +
        C.media(p.src, p.alt || p.caption || "gönderi", 1080, 1080, "post-media__img", !!opts.eager) +
        '<div class="heart-burst" aria-hidden="true">' + Icons.icon("heartFill", { size: 96 }) + "</div>" +
        '<div class="post-media__tag" data-act="noop"></div>' +
      "</div>" +

      '<div class="post-actions">' +
        '<button class="icon-btn' + (liked ? " is-active" : "") + '" data-act="like" data-post="' + p.id + '" aria-label="Beğen">' +
          Icons.icon(liked ? "heartFill" : "heart", { cls: liked ? "ic--liked" : "" }) + "</button>" +
        '<button class="icon-btn" data-act="comment-open" data-post="' + p.id + '" aria-label="Yorum yap">' + Icons.icon("comment") + "</button>" +
        '<button class="icon-btn" data-act="share" data-post="' + p.id + '" aria-label="Paylaş">' + Icons.icon("share") + "</button>" +
        '<span class="flex-1"></span>' +
        '<button class="icon-btn' + (p.saved ? " is-active" : "") + '" data-act="save" data-post="' + p.id + '" aria-label="Kaydet">' +
          Icons.icon(p.saved ? "saveFill" : "save", { cls: p.saved ? "ic--saved" : "" }) + "</button>" +
      "</div>" +

      '<div class="post-body">' +
        '<div class="post-likes">' + likesTxt + "</div>" +
        (p.caption ? '<div class="post-caption">' + C.usernameLink(u) + " " + C.richText(p.caption) + "</div>" : "") +
        (hidden > 0 ? '<button class="post-more" data-act="comment-open" data-post="' + p.id + '">' +
          Store.commentsCount(p) + " yorumun tümünü gör</button>" : "") +
        commentsHTML +
        '<button class="post-addcomment" data-act="comment-open" data-post="' + p.id + '">Yorum ekle…</button>' +
        '<div class="post-time">' + C.timeAgo(p.at) + (p.edited ? " · düzenlendi" : "") + "</div>" +
      "</div>" +
    "</article>";
  };

  C.commentRow = function (p, c, inDetail) {
    var u = Store.user(c.userId);
    if (!u) return "";
    var replies = (c.replies || []).map(function (r) { return C.commentRow(p, r, inDetail, true); }).join("");
    return '<div class="comment' + (inDetail ? " comment--detail" : "") + (c.isReply ? " comment--reply" : "") + '" data-comment="' + c.id + '">' +
      '<span class="comment__av" data-act="open-profile" data-user="' + u.id + '">' + C.avatar(u, inDetail ? 32 : 28) + "</span>" +
      '<span class="comment__body">' +
        '<span class="comment__text">' + C.usernameLink(u) + " " + C.richText(c.text) + "</span>" +
        '<span class="comment__meta">' + C.timeAgo(c.at) +
          (Store.likedCount(c) > 0 ? " · " + Store.likedCount(c) + " beğenme" : "") +
          (inDetail ? ' · <button class="lnk" data-act="comment-like" data-post="' + p.id + '" data-comment="' + c.id + '">' +
            (c.liked ? "Beğenmekten vazgeç" : "Beğen") + "</button>" : "") +
          (c.userId === Store.meId ? ' · <button class="lnk lnk--danger" data-act="comment-delete" data-post="' + p.id + '" data-comment="' + c.id + '">Sil</button>' : "") +
        "</span>" +
        (inDetail ? ' · <button class="lnk" data-act="comment-reply" data-post="' + p.id + '" data-comment="' + c.id + '">Yanıtla</button>' : "") +
      "</span>" +
      '<button class="comment__like' + (c.liked ? " is-active" : "") + '" data-act="comment-like" data-post="' + p.id + '" data-comment="' + c.id + '" aria-label="Yorumu beğen">' +
        Icons.icon("heart", { size: 14, cls: c.liked ? "ic--liked" : "" }) + "</button>" +
      "</div>" + replies;
  };

  /* ------------------------------------------------------------------ */
  /* Izgara hücresi                                                      */
  /* ------------------------------------------------------------------ */
  C.gridCell = function (p) {
    return '<button class="cell" data-act="post-open" data-post="' + p.id + '">' +
      C.media(p.src, p.alt || "gönderi", 400, 400, "cell__img") +
      (p.kind === "reel" ? '<span class="cell__kind">' + Icons.icon("reels", { size: 16 }) + "</span>" : "") +
      '<span class="cell__stats">' + Icons.icon("heartFill", { size: 15 }) + " " + C.formatCount(Store.likedCount(p)) +
        Icons.icon("comment", { size: 15 }) + " " + C.formatCount(Store.commentsCount(p)) + "</span>" +
      "</button>";
  };

  /* ------------------------------------------------------------------ */
  /* Alt sayfa (bottom sheet), eylem menüsü, uyarı (toast)               */
  /* ------------------------------------------------------------------ */
  var sheetStack = [];

  C.sheet = function (opts) {
    opts = opts || {};
    var root = document.getElementById("overlays");
    var backdrop = document.createElement("div");
    backdrop.className = "backdrop";
    backdrop.setAttribute("data-act", "sheet-close");
    var el = document.createElement("div");
    el.className = "sheet" + (opts.cls ? " " + opts.cls : "");
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.innerHTML =
      '<div class="sheet__grip" data-act="sheet-close"></div>' +
      (opts.title ? '<div class="sheet__head"><span class="sheet__title">' + C.esc(opts.title) + "</span>" +
        '<button class="icon-btn" data-act="sheet-close" aria-label="Kapat">' + Icons.icon("close", { size: 18 }) + "</button></div>" : "") +
      '<div class="sheet__body">' + (opts.body || "") + "</div>";

    root.appendChild(backdrop);
    root.appendChild(el);
    document.body.classList.add("has-overlay");

    var record = { el: el, backdrop: backdrop, onClose: opts.onClose || null, closed: false };
    sheetStack.push(record);

    requestAnimationFrame(function () {
      backdrop.classList.add("is-open");
      el.classList.add("is-open");
    });
    return el;
  };

  C.closeSheet = function () {
    var record = sheetStack.pop();
    if (!record || record.closed) return;
    record.closed = true;
    record.backdrop.classList.remove("is-open");
    record.el.classList.remove("is-open");
    setTimeout(function () {
      if (record.el.parentNode) record.el.parentNode.removeChild(record.el);
      if (record.backdrop.parentNode) record.backdrop.parentNode.removeChild(record.backdrop);
      if (!document.querySelector('.overlay-root .sheet, .overlay-root .modal, .overlay-root .story-viewer')) {
        document.body.classList.remove("has-overlay");
      }
    }, 260);
    if (record.onClose) { try { record.onClose(); } catch (e) { console.error(e); } }
  };

  C.isSheetOpen = function () { return sheetStack.length > 0; };

  /** Seçenek listesi olan eylem menüsü; Promise ile seçilen değeri döndürür. */
  C.actionSheet = function (title, items) {
    var body = '<ul class="actionsheet">' + items.map(function (it) {
      return '<li><button class="actionsheet__item' + (it.danger ? " is-danger" : "") + '" data-value="' + it.value + '">' +
        (it.icon ? Icons.icon(it.icon, { size: 20 }) : "") + "<span>" + C.esc(it.label) + "</span></button></li>";
    }).join("") + "</ul>";
    return new Promise(function (resolve) {
      var el = C.sheet({ title: title, body: body, cls: "sheet--action", onClose: function () { resolve(null); } });
      el.querySelectorAll("[data-value]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var v = btn.getAttribute("data-value");
          el.__resolved = true;
          // onClose null döndürmesin diye önce kapat, sonra değeri çöz
          var rec = sheetStack[sheetStack.length - 1];
          if (rec) rec.onClose = null;
          C.closeSheet();
          resolve(v);
        });
      });
    });
  };

  C.confirmSheet = function (opts) {
    var body = '<div class="confirm">' +
      (opts.text ? '<p class="confirm__text">' + C.esc(opts.text) + "</p>" : "") +
      '<button class="btn btn--danger btn--block" data-value="1">' + C.esc(opts.confirmLabel || "Onayla") + "</button>" +
      '<button class="btn btn--ghost btn--block" data-value="0">Vazgeç</button></div>';
    return new Promise(function (resolve) {
      var el = C.sheet({ title: opts.title || "", body: body, cls: "sheet--action", onClose: function () { resolve(false); } });
      el.querySelectorAll("[data-value]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var rec = sheetStack[sheetStack.length - 1];
          if (rec) rec.onClose = null;
          C.closeSheet();
          resolve(btn.getAttribute("data-value") === "1");
        });
      });
    });
  };

  C.toast = function (text, opts) {
    opts = opts || {};
    var root = document.getElementById("toasts");
    var el = document.createElement("div");
    el.className = "toast" + (opts.cls ? " " + opts.cls : "");
    el.innerHTML = (opts.icon ? Icons.icon(opts.icon, { size: 18 }) : "") + "<span>" + C.esc(text) + "</span>";
    root.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("is-open"); });
    setTimeout(function () {
      el.classList.remove("is-open");
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 260);
    }, opts.duration || 2400);
  };

  /* ------------------------------------------------------------------ */
  /* Küçük parçalar                                                      */
  /* ------------------------------------------------------------------ */
  C.stat = function (count, label, act, value) {
    return '<button class="pstat"' + (act ? ' data-act="' + act + '"' + (value ? ' data-value="' + value + '"' : "") : "") + ">" +
      "<b>" + C.esc(count) + "</b><span>" + label + "</span></button>";
  };

  C.tabs = function (items, active) {
    return '<div class="tabs" role="tablist">' + items.map(function (it) {
      return '<button class="tab' + (it.id === active ? " is-active" : "") + '" role="tab" data-act="tab" data-tab="' + it.id + '"' +
        (it.aria ? ' aria-label="' + it.aria + '"' : "") + ">" + it.content + "</button>";
    }).join("") + "</div>";
  };

  C.emptyState = function (icon, title, text, action) {
    return '<div class="empty">' + Icons.icon(icon, { size: 46, cls: "empty__ic" }) +
      "<h3>" + C.esc(title) + "</h3>" + (text ? "<p>" + C.esc(text) + "</p>" : "") +
      (action || "") + "</div>";
  };

  C.storyThumb = function (st) {
    var u = Store.user(st.userId);
    if (!u) return "";
    var unseen = Store.unseenCount(st) > 0;
    var first = st.items[0];
    var mine = st.userId === Store.meId;
    return '<div class="story"' + (mine ? ' data-mine="1"' : "") + ">" +
      C.storyRing(u, !unseen, 66, { live: u.id === "u6" && unseen }) +
      '<div class="story__name">' + (mine ? "Hikâyen" : C.esc(u.username)) + "</div>" +
      (mine ? '<button class="story__add" data-act="create-story" aria-label="Hikâye ekle">' + Icons.icon("plus", { size: 12, stroke: 2.6 }) + "</button>" : "") +
      "</div>";
  };

  C.setStore = function (s) { Store = s; };
  C.init = function () { Store = IG.Store; };

  IG.C = C;
})(window.IG);
