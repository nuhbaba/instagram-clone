/* ==========================================================================
   app.js — Yönlendirme, ekranlar, katmanlar ve etkileşimler
   ========================================================================== */
(function (IG) {
  "use strict";

  var C = IG.C;
  var Icons = IG.Icons;
  IG.Store.init();
  C.init();
  var Store = IG.Store;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ------------------------------------------------------------------ */
  /* Arayüz durumu                                                       */
  /* ------------------------------------------------------------------ */
  var UI = {
    route: { name: "feed", params: {} },
    scroll: {},
    tab: { profile: "posts", activity: "following" },
    story: null,
    storyTimer: null,
    replyTo: null,
    commentPost: null,
    query: "",
    recent: [],
    create: { src: null, batch: [], kind: "post", caption: "", location: "", isNew: false },
    hlCover: null,
    lastTap: { id: null, at: 0 },
    welcomeShown: false,
    refreshing: false
  };

  var HIGHLIGHT_LABELS = ["Favoriler", "Seyahat", "Anlar", "Kahve", "Yeni", "Sokak"];
  /* Gelen kutusundaki "Notlar" — düğün hazırlığı temalı */
  var NOTES = [
    { userId: "u1", text: "Altın saat 17:30 ✨" },
    { userId: "u9", text: "Pasta tadımı cumartesi 12:00 🍰" },
    { userId: "u7", text: "Kına için salon hazır 🎉" },
    { userId: "u3", text: "Duvak provası perşembe 🤍" }
  ];

  /* ------------------------------------------------------------------ */
  /* Yönlendirme                                                         */
  /* ------------------------------------------------------------------ */
  function parseHash() {
    var h = location.hash.replace(/^#\/?/, "");
    var parts = h.split("/").filter(Boolean).map(decodeURIComponent);
    if (!parts.length) return { name: "feed", params: {} };
    var name = parts[0], params = {};
    switch (name) {
      case "profile": params.username = parts[1] || null; break;
      case "direct": params.chatId = parts[1] || null; break;
      case "explore": params.q = parts[1] || null; break;
      case "post": params.id = parts[1] || null; break;
      case "settings":
      case "saved":
      case "create":
      case "activity":
      case "reels":
      case "feed": break;
      default: return { name: "feed", params: {} };
    }
    return { name: name, params: params };
  }

  function navigate(path, opts) {
    opts = opts || {};
    var target = path.indexOf("#") === 0 ? path : "#/" + String(path).replace(/^\//, "");
    if (location.hash === target) { render(); return; }
    location.hash = target;
    if (opts.replace) history.replaceState(null, "", target);
  }

  function routeKey(route) {
    return route.name + ":" + Object.keys(route.params).map(function (k) { return route.params[k]; }).join("/");
  }

  function goBack() {
    if (history.length > 1) history.back();
    else navigate("feed");
  }

  /* ------------------------------------------------------------------ */
  /* Tema                                                                */
  /* ------------------------------------------------------------------ */
  function applyTheme() {
    var theme = Store.state.settings.theme;
    document.documentElement.setAttribute("data-theme", theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#ffffff" : "#000000");
  }

  /* ------------------------------------------------------------------ */
  /* Üst çubuk                                                           */
  /* ------------------------------------------------------------------ */
  function badges() {
    return {
      notif: Store.unreadNotifications(),
      dm: Store.unreadMessages()
    };
  }

  function iconButton(act, icon, label, badge) {
    return '<button class="icon-btn" data-act="' + act + '" aria-label="' + label + '">' +
      Icons.icon(icon) +
      (badge ? '<span class="dot-badge">' + badge + "</span>" : "") +
      "</button>";
  }

  function renderAppBar() {
    var bar = $("#appbar");
    var r = UI.route;
    var b = badges();
    var html = "";

    if (r.name === "feed") {
      html = '<div class="appbar__left">' + Icons.wordmark() + "</div>" +
        '<div class="appbar__right">' +
        iconButton("create-open", "plusSquare", "Yeni gönderi") +
        iconButton("activity-open", "heart", "Bildirimler", b.notif) +
        iconButton("direct-open", "messenger", "Mesajlar", b.dm) +
        "</div>";
    } else if (r.name === "explore") {
      html = '<div class="appbar__search">' + Icons.icon("search", { size: 18 }) +
        '<input id="searchInput" type="search" placeholder="Ara" autocomplete="off" ' +
        'value="' + C.esc(UI.query) + '" data-act="search-input" aria-label="Ara">' +
        (UI.query ? '<button class="icon-btn icon-btn--sm" data-act="search-clear" aria-label="Temizle">' + Icons.icon("close", { size: 16 }) + "</button>" : "") +
        "</div>" +
        '<div class="appbar__right">' + iconButton("direct-open", "messenger", "Mesajlar", b.dm) + "</div>";
    } else if (r.name === "reels") {
      html = '<div class="appbar__title">Reels</div>' +
        '<div class="appbar__right">' + iconButton("create-open", "camera", "Oluştur") + "</div>";
    } else if (r.name === "activity") {
      html = '<div class="appbar__back"><button class="icon-btn" data-act="back" aria-label="Geri">' + Icons.icon("arrowLeft") + "</button></div>" +
        '<div class="appbar__title">Bildirimler</div>' +
        '<div class="appbar__right">' + iconButton("notifications-clear", "check", "Tümünü okundu işaretle") + "</div>";
    } else if (r.name === "profile") {
      var u = r.params.username ? Store.userByUsername(r.params.username) : Store.me();
      var isMe = u && u.id === Store.meId;
      html = '<div class="appbar__title appbar__title--tight">' + (u ? C.esc(u.username) : "Profil") +
        (u && u.private ? " " + Icons.icon("lock", { size: 14 }) : "") +
        (isMe ? " " + Icons.icon("chevronDown", { size: 14 }) : "") + "</div>" +
        '<div class="appbar__right">' +
        (isMe ? iconButton("create-open", "plusSquare", "Yeni gönderi") : iconButton("chat-with", "messenger", "Mesaj gönder")) +
        (isMe ? iconButton("settings-open", "menu", "Ayarlar") : "") +
        "</div>";
    } else if (r.name === "saved") {
      html = '<div class="appbar__back"><button class="icon-btn" data-act="back" aria-label="Geri">' + Icons.icon("arrowLeft") + "</button></div>" +
        '<div class="appbar__title">Kaydedilenler</div><div class="appbar__right"></div>';
    } else if (r.name === "direct") {
      html = '<div class="appbar__back"><button class="icon-btn" data-act="back" aria-label="Geri">' + Icons.icon("arrowLeft") + "</button></div>" +
        '<div class="appbar__title">' + (r.params.chatId ? C.esc((Store.user((Store.chat(r.params.chatId) || {}).userId) || {}).username || "Sohbet") : "Mesajlar") + "</div>" +
        '<div class="appbar__right">' + iconButton("new-message", "plusSquare", "Yeni mesaj") + "</div>";
    } else if (r.name === "settings") {
      html = '<div class="appbar__back"><button class="icon-btn" data-act="back" aria-label="Geri">' + Icons.icon("arrowLeft") + "</button></div>" +
        '<div class="appbar__title">Ayarlar</div><div class="appbar__right"></div>';
    } else if (r.name === "create") {
      var step = UI.create.batch && UI.create.batch.length ? "batch" : UI.create.src ? "share" : "pick";
      html = '<div class="appbar__back"><button class="icon-btn" data-act="create-back" aria-label="Geri">' + Icons.icon("arrowLeft") + "</button></div>" +
        '<div class="appbar__title">Yeni gönderi</div>' +
        '<div class="appbar__right">' +
        (step === "share"
          ? '<button class="btn btn--primary btn--sm" data-act="create-share">Paylaş</button>'
          : step === "batch"
            ? '<button class="btn btn--primary btn--sm" data-act="batch-share">' + UI.create.batch.length + " gönderi paylaş</button>"
            : '<button class="btn btn--ghost btn--sm" data-act="create-file">Fotoğraf seç</button>') +
        "</div>";
    } else if (r.name === "post") {
      html = '<div class="appbar__back"><button class="icon-btn" data-act="back" aria-label="Geri">' + Icons.icon("arrowLeft") + "</button></div>" +
        '<div class="appbar__title">Gönderi</div><div class="appbar__right"></div>';
    }

    bar.innerHTML = html;
    bar.classList.toggle("appbar--flush", r.name === "feed" || r.name === "reels");
    var input = $("#searchInput");
    if (input) {
      input.addEventListener("input", function () {
        UI.query = input.value;
        renderScreen();
      });
      if (UI.query) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
    }
  }

  /* ------------------------------------------------------------------ */
  /* Alt sekme çubuğu                                                    */
  /* ------------------------------------------------------------------ */
  function renderTabBar() {
    var bar = $("#tabbar");
    var r = UI.route;
    var b = badges();
    var me = Store.me();
    var tabs = [
      { id: "feed", icon: "home", label: "Ana Sayfa", active: r.name === "feed" },
      { id: "explore", icon: "search", label: "Keşfet", active: r.name === "explore" },
      { id: "reels", icon: "reels", label: "Reels", active: r.name === "reels" },
      { id: "activity", icon: "heart", label: "Bildirimler", active: r.name === "activity", badge: b.notif },
      { id: "profile", icon: "avatar", label: "Profil", active: (r.name === "profile" && (!r.params.username || r.params.username === me.username)) || r.name === "saved" }
    ];
    bar.innerHTML = tabs.map(function (t) {
      var content = t.icon === "avatar"
        ? '<span class="tabbar__avatar' + (t.active ? " is-active" : "") + '">' + C.avatar(me, 26) + "</span>"
        : Icons.icon(t.active ? t.icon + "Fill" in Icons.PATHS ? t.icon + "Fill" : t.icon : t.icon, { size: 25 });
      return '<button class="tabbar__item' + (t.active ? " is-active" : "") + '" data-act="go" data-go="' + t.id + '" aria-label="' + t.label + '">' +
        content + (t.badge ? '<span class="dot-badge">' + t.badge + "</span>" : "") + "</button>";
    }).join("");
    var hide = r.name === "direct" || r.name === "settings" || r.name === "create" || r.name === "post";
    bar.classList.toggle("is-hidden", hide);
  }

  /* ------------------------------------------------------------------ */
  /* EKRANLAR                                                            */
  /* ------------------------------------------------------------------ */
  var Screens = {};

  /* ---------- 1) Akış ---------- */
  Screens.feed = function () {
    var me = Store.me();
    var myStory = Store.storiesFor(me.id);
    var others = Store.storyBar().filter(function (s) { return s.userId !== me.id; }).map(C.storyThumb).join("");
    var bar = C.storyThumb(myStory || { userId: me.id, items: [] }) + others;
    var posts = Store.feed();
    var postsHTML = posts.length
      ? posts.map(function (p, i) { return C.postCard(p, { eager: i === 0 }); }).join("")
      : C.emptyState("home", "Akışın boş", "Birilerini takip etmeye başla, gönderileri burada görünsün.",
        '<button class="btn btn--primary" data-act="go" data-go="explore">Keşfet</button>');

    return '<div class="screen__inner">' +
      '<div class="pull-hint" data-pull><span class="spinner"></span><span class="pull-hint__text">Yenilemek için çek</span></div>' +
      '<div class="story-bar">' + bar + "</div>" +
      '<div class="feed">' + postsHTML + "</div>" +
      '<div class="feed-end">' +
        '<p>Akışın sonuna geldin.</p>' +
        '<button class="btn btn--ghost" data-act="go" data-go="explore">Keşfet\'te daha fazla gör</button>' +
      "</div>" +
    "</div>";
  };

  /* ---------- 2) Keşfet / Arama ---------- */
  Screens.explore = function () {
    var q = UI.query.trim();

    if (q) {
      var users = Store.searchUsers(q);
      var tags = Store.searchHashtags(q);
      var usersHTML = users.length ? users.map(function (u) {
        return '<div class="user-row">' +
          '<span data-act="open-profile" data-user="' + u.id + '">' + C.avatar(u, 44) + "</span>" +
          '<span class="user-row__meta" data-act="open-profile" data-user="' + u.id + '">' +
            '<span class="user-row__name">' + C.esc(u.username) + (u.verified ? Icons.verified(12) : "") + "</span>" +
            '<span class="user-row__sub">' + C.esc(u.name) + " · " + C.formatCount(Store.followersCount(u)) + " takipçi</span>" +
          "</span>" +
          C.followButton(u, { cls: "btn--sm" }) +
        "</div>";
      }).join("") : "";

      var tagsHTML = tags.length ? tags.map(function (h) {
        return '<button class="user-row" data-act="search-hashtag" data-tag="#' + h.tag + '">' +
          '<span class="hash-ico">' + Icons.icon("hash", { size: 22 }) + "</span>" +
          '<span class="user-row__meta"><span class="user-row__name">#' + C.esc(h.tag) + "</span>" +
          '<span class="user-row__sub">' + C.esc(h.count) + "</span></span></button>";
      }).join("") : "";

      var results = Store.explore().filter(function (p) {
        var u = Store.user(p.userId);
        return (u && (u.username.toLowerCase().indexOf(q.toLowerCase()) !== -1 || u.name.toLowerCase().indexOf(q.toLowerCase()) !== -1)) ||
          (p.caption || "").toLowerCase().indexOf(q.toLowerCase()) !== -1;
      });

      return '<div class="screen__inner">' +
        (usersHTML ? '<div class="section-label">Hesaplar</div><div class="user-list">' + usersHTML + "</div>" : "") +
        (tagsHTML ? '<div class="section-label">Etiketler</div><div class="user-list">' + tagsHTML + "</div>" : "") +
        (results.length ? '<div class="section-label">Gönderiler</div><div class="grid3">' +
          results.map(C.gridCell).join("") + "</div>" : "") +
        (!usersHTML && !tagsHTML && !results.length
          ? C.emptyState("search", "Sonuç bulunamadı", "“" + q + "” için bir şey bulamadık. Farklı bir kelime dene.")
          : "") +
      "</div>";
    }

    var chips = Store.state.hashtags.slice(0, 10).map(function (h) {
      return '<button class="chip" data-act="search-hashtag" data-tag="#' + h.tag + '">#' + C.esc(h.tag) + "</button>";
    }).join("");

    var recent = UI.recent.length
      ? '<div class="section-label">Son aramalar<button class="lnk" data-act="recent-clear">Tümünü temizle</button></div>' +
        '<div class="chips">' + UI.recent.map(function (t) {
          return '<button class="chip chip--ghost" data-act="search-hashtag" data-tag="' + C.esc(t) + '">' + C.esc(t) + " " +
            Icons.icon("close", { size: 13 }) + "</button>";
        }).join("") + "</div>"
      : "";

    var me = Store.me();
    var suggested = Store.state.users.filter(function (u) { return u.id !== me.id && !Store.isFollowing(u.id); }).slice(0, 3);

    return '<div class="screen__inner">' +
      '<div class="section-label">Popüler etiketler</div><div class="chips">' + chips + "</div>" +
      recent +
      (suggested.length ? '<div class="section-label">Önerilen hesaplar</div>' +
        '<div class="suggest">' +
        suggested.map(function (u) {
          return '<div class="suggest__card">' + C.avatar(u, 64) +
            '<span class="suggest__name">' + C.esc(u.username) + (u.verified ? Icons.verified(12) : "") + "</span>" +
            '<span class="suggest__sub">' + C.esc(u.name) + "</span>" +
            C.followButton(u, { cls: "btn--sm btn--block" }) + "</div>";
        }).join("") + "</div>" : "") +
      '<div class="section-label">Keşfet</div>' +
      '<div class="grid3">' + Store.explore().map(C.gridCell).join("") + "</div>" +
    "</div>";
  };

  /* ---------- 3) Reels ---------- */
  function reelMarkup(p, idx) {
    var u = Store.user(p.userId);
    var audio = p.audio || ("Orijinal ses — " + u.username);
    return '<section class="reel" data-post="' + p.id + '" data-idx="' + idx + '">' +
      '<div class="reel__media" data-act="reel-tap" data-post="' + p.id + '">' +
        '<div class="reel__frame">' +
          C.media(p.src, p.caption || "reel", 1080, 1920, "reel__img", idx < 2) +
        "</div>" +
        '<div class="heart-burst" aria-hidden="true">' + Icons.icon("heartFill", { size: 110 }) + "</div>" +
        '<div class="reel__pause" aria-hidden="true">' + Icons.icon("play", { size: 40 }) + "</div>" +
      "</div>" +
      '<div class="reel__scrim"></div>' +
      '<div class="reel__side">' +
        '<button class="reel__act' + (p.liked ? " is-active" : "") + '" data-act="like" data-post="' + p.id + '">' +
          Icons.icon(p.liked ? "heartFill" : "heart", { size: 27 }) + "<span>" + C.formatCount(Store.likedCount(p)) + "</span></button>" +
        '<button class="reel__act" data-act="comment-open" data-post="' + p.id + '">' +
          Icons.icon("comment", { size: 26 }) + "<span>" + C.formatCount(Store.commentsCount(p)) + "</span></button>" +
        '<button class="reel__act" data-act="share" data-post="' + p.id + '">' + Icons.icon("share", { size: 26 }) + "<span>Paylaş</span></button>" +
        '<button class="reel__act' + (p.saved ? " is-active" : "") + '" data-act="save" data-post="' + p.id + '">' +
          Icons.icon(p.saved ? "saveFill" : "save", { size: 26 }) + "<span>Kaydet</span></button>" +
        '<button class="reel__act" data-act="post-menu" data-post="' + p.id + '">' + Icons.icon("more", { size: 24 }) + "</button>" +
        '<span class="reel__disc" aria-hidden="true">' + C.media(u.avatar, "ses", 80, 80, "reel__disc-img") + "</span>" +
      "</div>" +
      '<div class="reel__info">' +
        '<div class="reel__user">' + C.storyRing(u, true, 34) + C.usernameLink(u, { badge: 13 }) +
          '<button class="btn btn--ghost btn--xs" data-act="follow" data-user="' + u.id + '">' +
          (Store.isFollowing(u.id) ? "Takip ediliyor" : "Takip et") + "</button></div>" +
        '<div class="reel__caption">' + C.richText(p.caption || "") + "</div>" +
        '<div class="reel__audio">' + Icons.icon("music", { size: 14 }) + "<span>" + C.esc(audio) + "</span></div>" +
      "</div>" +
    "</section>";
  }

  Screens.reels = function () {
    var list = Store.reels();
    if (!list.length) return C.emptyState("reels", "Reels yok", "Henüz reels paylaşılmamış.");
    return '<div class="reels" id="reels">' + list.map(reelMarkup).join("") + "</div>";
  };

  /* ---------- 4) Bildirimler ---------- */
  Screens.activity = function () {
    var items = Store.notifications();
    if (!items.length) {
      return C.emptyState("heart", "Bildirim yok", "Beğeniler, yorumlar ve yeni takipçiler burada görünecek.");
    }

    var now = Date.now();
    var groups = [
      { label: "Yeni", test: function (n) { return now - n.at < 24 * 3600000; }, items: [] },
      { label: "Bu hafta", test: function (n) { return now - n.at >= 24 * 3600000 && now - n.at < 7 * 86400000; }, items: [] },
      { label: "Daha eski", test: function () { return true; }, items: [] }
    ];
    items.forEach(function (n) {
      for (var i = 0; i < groups.length; i++) {
        if (groups[i].test(n)) { groups[i].items.push(n); break; }
      }
    });

    function row(n) {
      var u = Store.user(n.userId);
      if (!u) return "";
      var isFollow = n.type === "follow";
      var thumb = n.thumb ? C.media(n.thumb, "gönderi", 200, 200, "notif__thumb") : "";
      return '<div class="notif' + (n.read ? "" : " is-unread") + '" data-act="' + (n.postId ? "post-open" : "open-profile") + '" data-post="' + (n.postId || "") + '" data-user="' + u.id + '">' +
        '<span class="notif__av" data-act="open-profile" data-user="' + u.id + '">' + C.avatar(u, 44) +
          '<span class="notif__type notif__type--' + n.type + '">' + Icons.icon(
            n.type === "like" ? "heartFill" : n.type === "comment" ? "comment" : n.type === "follow" ? "personTag" : n.type === "mention" ? "at" : "camera", { size: 11 }) + "</span>" +
        "</span>" +
        '<span class="notif__body"><span class="notif__text">' +
          '<a class="uname" data-act="open-profile" data-user="' + u.id + '">' + C.esc(u.username) + "</a> " + C.esc(n.text) + "</span>" +
          '<span class="notif__time">' + C.timeAgo(n.at) + "</span></span>" +
        (isFollow ? C.followButton(u, { cls: "btn--sm" }) : thumb) +
      "</div>";
    }

    var html = groups.filter(function (g) { return g.items.length; }).map(function (g) {
      return '<div class="section-label">' + g.label + "</div>" + g.items.map(row).join("");
    }).join("");

    return '<div class="screen__inner screen__inner--tight">' + html + "</div>";
  };

  /* ---------- 5) Profil ---------- */
  /* Instagram'ın güncel profil düzeni: avatar + istatistikler, ad/biyografi,
     tek "Profili düzenle" düğmesi, öne çıkanlar (+ Yeni), 3 sekme ve ızgara. */

  /** Tek bir öne çıkan dairesi (kapak görselli). */
  function highlightItemHTML(h) {
    var cover = h.cover || "";
    if (!cover && h.postIds && h.postIds.length) {
      var p = Store.post(h.postIds[0]);
      if (p) cover = p.src;
    }
    var inner = cover
      ? C.media(cover, h.title || "öne çıkan", 140, 140, "highlight__img")
      : '<span class="highlight__img highlight__img--empty">' + Icons.icon("bookmarkTab", { size: 22 }) + "</span>";
    return '<button class="highlight" data-act="highlight-open" data-highlight="' + h.id + '">' +
      '<span class="highlight__ring">' + inner + "</span>" +
      '<span class="highlight__label">' + C.esc(h.title || "Öne çıkan") + "</span></button>";
  }

  /** Öne çıkanlar şeridi. Kendi profilinde başa "+ Yeni" dairesi gelir.
      Kullanıcının tanımlı öne çıkanı yoksa gönderilerinden otomatik oluşturulur. */
  function highlightsHTML(u, isMe) {
    var items = "";
    if (isMe) {
      items += '<button class="highlight" data-act="highlight-create">' +
        '<span class="highlight__ring highlight__ring--new">' + Icons.icon("plus", { size: 24 }) + "</span>" +
        '<span class="highlight__label">Yeni</span></button>';
    }
    var own = Store.highlightsOf(u.id);
    if (own.length) {
      items += own.map(highlightItemHTML).join("");
    } else {
      items += Store.postsOf(u.id).slice(0, 5).map(function (p, i) {
        return '<button class="highlight" data-act="post-open" data-post="' + p.id + '">' +
          '<span class="highlight__ring">' + C.media(p.src, "öne çıkan", 140, 140, "highlight__img") + "</span>" +
          '<span class="highlight__label">' + HIGHLIGHT_LABELS[i % HIGHLIGHT_LABELS.length] + "</span></button>";
      }).join("");
    }
    if (!isMe && !items) return "";
    return '<div class="highlights">' + items + "</div>";
  }

  /** Instagram'ın "henüz gönderi yok" görünümü. */
  function profileEmptyHTML(isMe) {
    return '<div class="pempty">' +
      '<span class="pempty__icon">' + Icons.icon("camera", { size: 34 }) + "</span>" +
      "<h3>Gönderi paylaş</h3>" +
      "<p>Fotoğraf ve video paylaştığında profilinde görünecek.</p>" +
      (isMe ? '<button class="btn btn--primary" data-act="create-open">İlk gönderini paylaş</button>' +
        '<p class="pempty__hint">Bu profil senin fotoğrafların için hazır — “Oluştur” ekranından tek tek veya toplu yükleyebilirsin.</p>' : "") +
    "</div>";
  }

  Screens.profile = function () {
    var r = UI.route;
    var u = r.params.username ? Store.userByUsername(r.params.username) : Store.me();
    if (!u) return C.emptyState("personTag", "Kullanıcı bulunamadı", "Bu kullanıcı adına sahip bir hesap yok.",
      '<button class="btn btn--primary" data-act="go" data-go="explore">Keşfet</button>');

    var me = Store.me();
    var isMe = u.id === me.id;
    var story = Store.storiesFor(u.id);
    var unseen = story ? Store.unseenCount(story) > 0 : false;
    var tab = UI.tab.profile;
    if (["posts", "reels", "tagged"].indexOf(tab) === -1) tab = "posts";
    var following = Store.isFollowing(u.id);

    var tabs = [
      { id: "posts", content: Icons.icon("grid", { size: 22 }), aria: "Gönderiler" },
      { id: "reels", content: Icons.icon("reels", { size: 22 }), aria: "Reels" },
      { id: "tagged", content: Icons.icon("personTag", { size: 22 }), aria: "Etiketlenenler" }
    ];

    var content = "";
    if (tab === "posts") content = Store.postsOf(u.id).map(C.gridCell).join("");
    else if (tab === "reels") content = Store.reelsOf(u.id).map(C.gridCell).join("");
    else content = Store.taggedPosts(u.id).map(C.gridCell).join("");

    var block;
    if (content) block = '<div class="grid3">' + content + "</div>";
    else if (tab === "posts") block = profileEmptyHTML(isMe);
    else {
      block = '<div class="grid-empty">' +
        Icons.icon(tab === "tagged" ? "personTag" : "reels", { size: 44 }) +
        "<p>" + (tab === "tagged"
          ? (isMe ? "Henüz etiketlendiğin bir gönderi yok." : "Bu hesap henüz bir gönderide etiketlenmemiş.")
          : (isMe ? "Henüz reels paylaşmadın." : "Henüz reels paylaşılmadı.")) + "</p></div>";
    }

    var avatarHTML;
    if (unseen) {
      avatarHTML = C.storyRing(u, false, 84);
    } else if (isMe) {
      avatarHTML = '<span class="phead__avatar-wrap" data-act="create-story" role="button" aria-label="Hikâye ekle">' +
        C.avatar(u, 84) +
        '<span class="phead__avatar-plus">' + Icons.icon("plus", { size: 13, stroke: 3 }) + "</span></span>";
    } else {
      avatarHTML = '<span data-act="open-profile" data-user="' + u.id + '">' + C.avatar(u, 84) + "</span>";
    }

    var isNew = UI.create.isNew && isMe;
    var hasBio = !!(u.bio && u.bio.trim());

    return '<div class="screen__inner screen__inner--flush">' +
      '<div class="phead">' +
        '<div class="phead__top">' +
          '<span class="phead__avatar">' + avatarHTML + "</span>" +
          '<div class="phead__stats">' +
            C.stat(C.formatCountExact(Store.postCount(u.id)), "gönderi") +
            C.stat(C.formatCount(Store.followersCount(u)), "takipçi", "followers", u.id) +
            C.stat(C.formatCount(Store.followingCount(u)), "takip", "following", u.id) +
          "</div>" +
        "</div>" +
        '<div class="phead__bio">' +
          '<div class="phead__name">' + C.esc(u.name) + (u.verified ? " " + Icons.verified(14) : "") + "</div>" +
          (u.category ? '<div class="phead__category">' + C.esc(u.category) + "</div>" : "") +
          (hasBio ? '<div class="phead__text">' + C.richText(u.bio) + "</div>"
            : (isMe ? '<button class="phead__addbio" data-act="edit-profile">Biyografi ekle</button>' : "")) +
          (u.link ? '<a class="lnk phead__link" data-act="open-link" data-link="' + C.esc(u.link) + '">' +
            Icons.icon("thread", { size: 14 }) + " " + C.esc(u.link) + "</a>" : "") +
          (isNew ? '<div class="phead__new">Gönderin paylaşıldı ✨</div>' : "") +
        "</div>" +
        '<div class="phead__buttons">' +
          (isMe
            ? '<button class="btn btn--ghost btn--grow" data-act="edit-profile">Profili düzenle</button>'
            : C.followButton(u, { cls: "btn--grow" }) +
              '<button class="btn btn--ghost btn--grow" data-act="chat-with" data-user="' + u.id + '">Mesaj gönder</button>' +
              (following ? '<button class="btn btn--ghost btn--icon" data-act="unfollow-sheet" data-user="' + u.id + '" aria-label="Takibi bırak seçenekleri">' + Icons.icon("chevronDown", { size: 16 }) + "</button>" : "")) +
        "</div>" +
        highlightsHTML(u, isMe) +
      "</div>" +
      C.tabs(tabs, tab) +
      block +
    "</div>";
  };

  /* ---------- 5b) Kaydedilenler (Instagram'da olduğu gibi menüden açılır) --- */
  Screens.saved = function () {
    var list = Store.savedPosts();
    var head = '<div class="saved-head">' +
      '<span class="saved-head__icon">' + Icons.icon("bookmarkTab", { size: 20 }) + "</span>" +
      "<span><b>Yalnızca sen görürsün</b><i>Kaydettiğin gönderiler yalnızca sana görünür.</i></span></div>";
    var body = list.length
      ? '<div class="grid3">' + list.map(C.gridCell).join("") + "</div>"
      : '<div class="grid-empty">' + Icons.icon("bookmarkTab", { size: 44 }) +
        "<p>Henüz bir gönderi kaydetmedin. Bir gönderinin sağ alt köşesindeki yer imine dokunarak kaydedebilirsin.</p>" +
        '<button class="btn btn--primary" data-act="go" data-go="explore">Gönderi bul</button></div>';
    return '<div class="screen__inner screen__inner--flush">' + head + body + "</div>";
  };

  /* ---------- 6) Mesajlar listesi ---------- */
  Screens.direct = function () {
    var chats = Store.chats();
    var notes = '<div class="notes">' +
      '<div class="note" data-act="create-story"><span class="note__av">' + C.avatar(Store.me(), 60) +
        '<span class="note__plus">' + Icons.icon("plus", { size: 12, stroke: 2.8 }) + "</span></span>" +
        '<span class="note__label">Notun</span></div>' +
      NOTES.map(function (n) {
        var u = Store.user(n.userId);
        return '<div class="note" data-act="note-open" data-user="' + u.id + '">' +
          '<span class="note__av">' + C.avatar(u, 60) + '<span class="note__bubble">' + C.esc(n.text) + "</span></span>" +
          '<span class="note__label">' + C.esc(u.username) + "</span></div>";
      }).join("") + "</div>";

    var rows = chats.map(function (ch) {
      var u = Store.user(ch.userId);
      var m = Store.lastMessage(ch);
      var mine = m.from === Store.meId;
      var text = (mine ? "Sen: " : "") + (m.text || "");
      return '<button class="chatrow" data-act="chat-open" data-chat="' + ch.id + '">' +
        '<span class="chatrow__av">' + C.avatar(u, 54) + '<span class="chatrow__online"></span></span>' +
        '<span class="chatrow__body">' +
          '<span class="chatrow__name">' + C.esc(u.name) + (u.verified ? Icons.verified(11) : "") + "</span>" +
          '<span class="chatrow__msg' + (ch.unread ? " is-unread" : "") + '">' + C.esc(text) +
            " · " + C.shortTime(m.at) + "</span>" +
        "</span>" +
        (ch.unread ? '<span class="chatrow__badge">' + ch.unread + "</span>" : "") +
        (ch.pinned ? '<span class="chatrow__pin">' + Icons.icon("bookmarkTab", { size: 15 }) + "</span>" : "") +
      "</button>";
    }).join("");

    return '<div class="screen__inner">' +
      '<div class="dm-bar"><span class="dm-bar__user">' + C.esc(Store.me().username) + "</span>" +
        '<span class="dm-bar__actions">' + Icons.icon("chevronDown", { size: 16 }) + "</span></div>" +
      '<div class="section-label">Notlar</div>' + notes +
      '<div class="section-label">Mesajlar<button class="lnk" data-act="new-message">Yeni</button></div>' +
      '<div class="chatlist">' + rows + "</div>" +
    "</div>";
  };

  /* ---------- 7) Sohbet ---------- */
  function renderChatMessages() {
    var box = $("#chatMessages");
    if (!box) return;
    var ch = Store.chat(UI.route.params.chatId);
    if (!ch) return;
    var meId = Store.meId;
    var lastDay = null;
    var html = "";

    ch.messages.forEach(function (m) {
      var day = new Date(m.at).toDateString();
      if (day !== lastDay) {
        lastDay = day;
        var d = new Date(m.at);
        var today = new Date().toDateString();
        var yest = new Date(Date.now() - 86400000).toDateString();
        var label = day === today ? "Bugün" : day === yest ? "Dün" : d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear();
        html += '<div class="chat__day"><span>' + label + "</span></div>";
      }
      var mine = m.from === meId;
      if (mine && !m.seen) m.seen = true;
      html += '<div class="msg' + (mine ? " msg--me" : "") + '">' + C.esc(m.text) + "</div>";
    });

    if (ch.typing) {
      html += '<div class="msg msg--them msg--typing"><span></span><span></span><span></span></div>';
    }
    var last = ch.messages[ch.messages.length - 1];
    if (last && last.from === meId) {
      html += '<div class="chat__seen">Görüldü · ' + C.clockTime(last.at) + "</div>";
    }
    box.innerHTML = html || '<div class="chat__empty">Sohbeti başlat 👋</div>';
    box.scrollTop = box.scrollHeight;
  }

  Screens.chat = function () {
    var ch = Store.chat(UI.route.params.chatId);
    if (!ch) return C.emptyState("messenger", "Sohbet bulunamadı", "Bu sohbet artık mevcut değil.");
    var u = Store.user(ch.userId);
    Store.setOpenChat(ch.id);
    setTimeout(renderChatMessages, 0);

    return '<div class="chat">' +
      '<div class="chat__head">' + C.avatar(u, 34) +
        '<span class="chat__head-meta"><b>' + C.esc(u.name) + "</b><i>" + C.esc(u.username) + " · aktif</i></span>" +
        '<button class="icon-btn" data-act="chat-info" aria-label="Bilgi">' + Icons.icon("info", { size: 20 }) + "</button>" +
      "</div>" +
      '<div class="chat__messages" id="chatMessages"></div>' +
      '<div class="chat__suggest">' +
        ["Selam! 👋", "Ne haber?", "Süper olmuş 😍", "Yarın görüşelim mi?"].map(function (s) {
          return '<button class="chip chip--ghost" data-act="chat-suggest" data-text="' + C.esc(s) + '">' + C.esc(s) + "</button>";
        }).join("") +
      "</div>" +
      '<form class="chat__input" data-form="chat">' +
        '<button type="button" class="icon-btn" data-act="chat-attach" aria-label="Ek">' + Icons.icon("plus", { size: 22 }) + "</button>" +
        '<input type="text" id="chatText" placeholder="Mesaj yaz…" autocomplete="off" aria-label="Mesaj">' +
        '<button type="button" class="icon-btn" data-act="chat-emoji" aria-label="Emoji">' + Icons.icon("smiley", { size: 22 }) + "</button>" +
        '<button type="submit" class="chat__send">Gönder</button>' +
      "</form>" +
    "</div>";
  };

  /* ---------- 8) Ayarlar ---------- */
  Screens.settings = function () {
    var me = Store.me();
    var s = Store.state.settings;
    var sw = function (act, on) {
      return '<button class="switch' + (on ? " is-on" : "") + '" data-act="' + act + '" role="switch" aria-checked="' + (!!on) + '"><i></i></button>';
    };
    return '<div class="screen__inner screen__inner--tight">' +
      '<div class="set-user" data-act="edit-profile">' + C.avatar(me, 60) +
        '<span><b>' + C.esc(me.name) + "</b><i>" + C.esc(me.username) + "</i></span>" +
        Icons.icon("chevronRight", { size: 18 }) + "</div>" +

      '<div class="set-group">' +
        '<div class="set-title">Profil</div>' +
        '<div class="set-row set-row--btn" data-act="go-saved"><span>Kaydedilenler</span>' + Icons.icon("bookmarkTab", { size: 18 }) + "</div>" +
        '<div class="set-row set-row--btn" data-act="share-profile"><span>Profili paylaş</span>' + Icons.icon("share", { size: 18 }) + "</div>" +
        '<div class="set-row set-row--btn" data-act="create-open"><span>Yeni gönderi paylaş</span>' + Icons.icon("plusSquare", { size: 18 }) + "</div>" +
        (Store.placeholderCount()
          ? '<div class="set-row set-row--btn" data-act="clear-placeholders"><span>Örnek gönderileri temizle (' + Store.placeholderCount() + ")</span>" + Icons.icon("trash", { size: 18 }) + "</div>"
          : "") +
      "</div>" +

      '<div class="set-group">' +
        '<div class="set-title">Görünüm</div>' +
        '<div class="set-row"><span>Koyu tema</span>' + sw("theme-toggle", s.theme === "dark") + "</div>" +
        '<div class="set-row"><span>Reels otomatik oynatma</span>' + sw("toggle-autoplay", s.autoplay) + "</div>" +
        '<div class="set-row"><span>Veri tasarrufu</span>' + sw("toggle-datasaver", s.dataSaver) + "</div>" +
      "</div>" +

      '<div class="set-group">' +
        '<div class="set-title">Veri</div>' +
        '<div class="set-row set-row--btn" data-act="export-data"><span>Verileri indir (JSON yedeği)</span>' + Icons.icon("download", { size: 18 }) + "</div>" +
        '<div class="set-row set-row--btn" data-act="import-data"><span>Yedeği geri yükle (JSON)</span>' + Icons.icon("upload", { size: 18 }) + "</div>" +
        '<div class="set-row set-row--btn is-danger" data-act="reset-data"><span>Tüm verileri sıfırla</span>' + Icons.icon("trash", { size: 18 }) + "</div>" +
        '<input type="file" id="importInput" accept="application/json,.json" hidden>' +
      "</div>" +

      '<div class="set-group">' +
        '<div class="set-title">Uygulama</div>' +
        '<div class="set-row set-row--btn" data-act="install-pwa"><span>Uygulamayı yükle (PWA)</span>' + Icons.icon("plusSquare", { size: 18 }) + "</div>" +
        '<div class="set-row"><span>Sürüm</span><i class="set-val">1.0.0 · yerel demo</i></div>' +
        '<div class="set-row"><span>Veri konumu</span><i class="set-val">Bu cihaz (localStorage)</i></div>' +
        '<div class="set-row"><span>Depolanan gönderi</span><i class="set-val">' + Store.state.posts.length + "</i></div>" +
      "</div>" +

      '<div class="set-group">' +
        '<div class="set-row set-row--btn" data-act="logout"><span>Çıkış yap</span>' + Icons.icon("lock", { size: 18 }) + "</div>" +
      "</div>" +

      '<p class="set-note">Bu uygulama Instagram’ın bir kopyası değil, arayüz ve akış olarak benzer şekilde çalışan bağımsız bir demo prototipidir. Hiçbir veri sunucuya gönderilmez; her şey bu cihazda saklanır.</p>' +
    "</div>";
  };

  /* ---------- 9) Yeni gönderi ---------- */
  Screens.create = function () {
    var c = UI.create;

    /* --- toplu yükleme: birden fazla fotoğraf seçildiyse önizleme adımı --- */
    if (c.batch && c.batch.length) {
      return '<div class="screen__inner screen__inner--tight">' +
        '<div class="batch-head"><b>' + c.batch.length + " fotoğraf seçildi</b>" +
          "<span>Hepsi ayrı gönderi olarak paylaşılır.</span></div>" +
        '<div class="batch-grid">' + c.batch.map(function (src, i) {
          return '<span class="batch-cell">' + C.media(src, "seçim " + (i + 1), 400, 400, "batch-cell__img") +
            '<button class="batch-cell__del" data-act="batch-remove" data-index="' + i + '" aria-label="Kaldır">' +
            Icons.icon("close", { size: 12, stroke: 3 }) + "</button></span>";
        }).join("") + "</div>" +
        '<div class="create-form">' +
          '<textarea id="captionInput" rows="3" placeholder="Hepsi için ortak açıklama (isteğe bağlı)…" data-act="caption-input">' + C.esc(c.caption) + "</textarea>" +
          '<div class="create-row"><span>' + Icons.icon("location", { size: 18 }) + "</span>" +
            '<input type="text" id="locationInput" placeholder="Konum ekle" value="' + C.esc(c.location) + '" data-act="location-input">' +
            Icons.icon("chevronRight", { size: 16 }) + "</div>" +
          '<div class="create-actions">' +
            '<button class="btn btn--primary btn--grow" data-act="batch-share">' + c.batch.length + " gönderi paylaş</button>" +
            '<button class="btn btn--ghost btn--grow" data-act="create-reset">İptal</button>' +
          "</div>" +
          '<p class="create-hint">Yüklediğin fotoğraflar tarayıcıda küçültülür ve yalnızca bu cihazda saklanır.</p>' +
        "</div>" +
        '<input type="file" id="fileInputMulti" accept="image/*" multiple hidden>' +
        '<input type="file" id="cameraInput" accept="image/*" capture="environment" hidden>' +
      "</div>";
    }

    if (!c.src) {
      return '<div class="screen__inner screen__inner--tight">' +
        '<div class="create-top">' +
          '<div class="create-sel">' + Icons.icon("grid", { size: 22 }) + "<span>Galeri</span></div>" +
          '<div class="create-sel" data-act="create-file">' + Icons.icon("image", { size: 22 }) + "<span>Toplu seç</span></div>" +
          '<div class="create-sel" data-act="create-camera">' + Icons.icon("camera", { size: 22 }) + "<span>Kamera</span></div>" +
        "</div>" +
        '<div class="grid3 grid3--gap">' +
          Store.state.gallery.map(function (src, i) {
            return '<button class="cell cell--pick" data-act="create-pick" data-src="' + C.esc(src) + '">' +
              C.media(src, "galeri " + (i + 1), 400, 400, "cell__img") + "</button>";
          }).join("") +
        "</div>" +
        '<input type="file" id="fileInputMulti" accept="image/*" multiple hidden>' +
        '<input type="file" id="cameraInput" accept="image/*" capture="environment" hidden>' +
        '<p class="create-hint">Galerideki örneklerden birini seç, ya da <b>Toplu seç</b> ile kendi ' +
          "fotoğraflarını yükle (birden fazla seçebilirsin). Yüklenen görseller tarayıcıda küçültülüp bu cihazda saklanır.</p>" +
      "</div>";
    }

    return '<div class="screen__inner screen__inner--tight">' +
      '<div class="create-preview">' + C.media(c.src, "önizleme", 1080, c.kind === "reel" ? 1920 : 1080, "create-preview__img") +
        '<div class="create-preview__badge">' + (c.kind === "reel" ? "Reels" : "Gönderi") + "</div></div>" +
      '<div class="create-form">' +
        '<textarea id="captionInput" rows="4" placeholder="Bir açıklama yaz…" data-act="caption-input">' + C.esc(c.caption) + "</textarea>" +
        '<div class="create-row"><span>' + Icons.icon("location", { size: 18 }) + "</span>" +
          '<input type="text" id="locationInput" placeholder="Konum ekle" value="' + C.esc(c.location) + '" data-act="location-input">' +
          Icons.icon("chevronRight", { size: 16 }) + "</div>" +
        '<div class="create-row"><span>' + Icons.icon("music", { size: 18 }) + "</span>" +
          '<input type="text" id="audioInput" placeholder="Ses ekle (isteğe bağlı)" data-act="audio-input">' +
          Icons.icon("chevronRight", { size: 16 }) + "</div>" +
        '<div class="create-row create-row--toggle"><span>' + Icons.icon("reels", { size: 18 }) + "<b>Reels olarak paylaş</b></span>" +
          '<button class="switch' + (c.kind === "reel" ? " is-on" : "") + '" data-act="toggle-reel" role="switch" aria-checked="' + (c.kind === "reel") + '"><i></i></button></div>' +
        '<div class="create-actions">' +
          '<button class="btn btn--primary btn--grow" data-act="create-share">Paylaş</button>' +
          '<button class="btn btn--ghost btn--grow" data-act="create-reset">İptal</button>' +
        "</div>" +
        '<p class="create-hint">Paylaştığında gönderi akışında ve profilinde hemen görünür.</p>' +
      "</div>" +
    "</div>";
  };

  /* ---------- 10) Gönderi detayı ---------- */
  Screens.post = function () {
    var p = Store.post(UI.route.params.id);
    if (!p) return C.emptyState("image", "Gönderi bulunamadı", "Bu gönderi silinmiş olabilir.");
    var u = Store.user(p.userId);
    var likedBy = Store.friendsWhoLiked(p);
    var likesTxt = likedBy.length
      ? likedBy.map(function (f) { return '<a class="uname" data-act="open-profile" data-user="' + f.id + '">' + C.esc(f.username) + "</a>"; }).join(", ") + " ve diğerleri beğendi"
      : C.formatCountExact(Store.likedCount(p)) + " beğenme";

    return '<div class="detail">' +
      '<div class="detail__head">' + C.storyRing(u, true, 34) +
        '<span class="detail__meta"><span class="detail__user">' + C.usernameLink(u) + "</span>" +
          "<i>" + (p.location ? C.esc(p.location) : C.timeAgo(p.at)) + "</i></span>" +
        '<button class="icon-btn" data-act="post-menu" data-post="' + p.id + '">' + Icons.icon("more") + "</button></div>" +
      '<div class="detail__media" data-act="detail-tap" data-post="' + p.id + '">' +
        C.media(p.src, p.alt || "gönderi", 1080, 1080, "detail__img", true) +
        '<div class="heart-burst" aria-hidden="true">' + Icons.icon("heartFill", { size: 96 }) + "</div></div>" +
      '<div class="post-actions">' +
        '<button class="icon-btn' + (p.liked ? " is-active" : "") + '" data-act="like" data-post="' + p.id + '">' +
          Icons.icon(p.liked ? "heartFill" : "heart", { cls: p.liked ? "ic--liked" : "" }) + "</button>" +
        '<button class="icon-btn" data-act="focus-comment" data-post="' + p.id + '">' + Icons.icon("comment") + "</button>" +
        '<button class="icon-btn" data-act="share" data-post="' + p.id + '">' + Icons.icon("share") + "</button>" +
        '<span class="flex-1"></span>' +
        '<button class="icon-btn' + (p.saved ? " is-active" : "") + '" data-act="save" data-post="' + p.id + '">' +
          Icons.icon(p.saved ? "saveFill" : "save", { cls: p.saved ? "ic--saved" : "" }) + "</button>" +
      "</div>" +
      '<div class="detail__body">' +
        '<div class="post-likes">' + likesTxt + "</div>" +
        (p.caption ? '<div class="post-caption">' + C.usernameLink(u) + " " + C.richText(p.caption) + "</div>" : "") +
        '<div class="detail__comments" id="detailComments">' +
          (p.comments.length
            ? p.comments.map(function (c) { return C.commentRow(p, c, true); }).join("")
            : '<p class="detail__empty">Henüz yorum yok. İlk yorumu sen yaz.</p>') +
        "</div>" +
        '<div class="post-time">' + C.timeAgo(p.at) + "</div>" +
      "</div>" +
      '<form class="detail__input" data-form="detail-comment">' +
        '<span class="comment-av">' + C.avatar(Store.me(), 30) + "</span>" +
        '<input type="text" id="detailCommentInput" placeholder="Yorum ekle…" autocomplete="off">' +
        '<button type="button" class="icon-btn" data-act="emoji-insert" data-target="detailCommentInput">' + Icons.icon("smiley", { size: 20 }) + "</button>" +
        '<button type="submit" class="lnk lnk--bold">Paylaş</button>' +
      "</form>" +
    "</div>";
  };

  /* ------------------------------------------------------------------ */
  /* Ekran çizimi                                                        */
  /* ------------------------------------------------------------------ */
  function renderScreen() {
    var screen = $("#screen");
    var r = UI.route;
    // "direct" rotası iki ekranı kapsar: gelen kutusu ve tek sohbet
    var fn = (r.name === "direct" && r.params.chatId) ? Screens.chat : (Screens[r.name] || Screens.feed);
    var key = routeKey(r);
    UI.scroll[UI.lastKey] = screen.scrollTop;
    UI.lastKey = key;

    screen.className = "screen screen--" + r.name;
    screen.innerHTML = fn();
    screen.scrollTop = UI.scroll[key] || 0;

    if (r.name === "reels") setupReels();
    if (r.name === "direct" && r.params.chatId) {
      Store.markChatRead(r.params.chatId);
      Store.setOpenChat(r.params.chatId);
      setTimeout(renderChatMessages, 0);
    }
    if (r.name === "feed") setupPullToRefresh(screen);
    if (r.name === "create") setupCreateInputs();
    if (r.name === "settings") setupSettingsInputs();
    if (r.name === "explore" && UI.query) {
      var si = $("#searchInput");
      if (si) { si.focus(); si.setSelectionRange(si.value.length, si.value.length); }
    }
  }

  function render() {
    UI.route = parseHash();
    applyTheme();
    renderAppBar();
    renderScreen();
    renderTabBar();
    updateClock();
  }

  /* ------------------------------------------------------------------ */
  /* Reels: kaydırmalı oynatma                                           */
  /* ------------------------------------------------------------------ */
  var reelsObserver = null;
  function setupReels() {
    var container = $("#reels");
    if (!container) return;
    if (reelsObserver) reelsObserver.disconnect();
    var first = container.querySelector(".reel");
    if (first) {
      container.scrollTop = 0;
      first.classList.add("is-active");
    }
    reelsObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          $$(".reel", container).forEach(function (r) { r.classList.remove("is-active"); });
          entry.target.classList.add("is-active");
        }
      });
    }, { root: container, threshold: [0.6] });
    $$(".reel", container).forEach(function (r) { reelsObserver.observe(r); });
  }

  /* ------------------------------------------------------------------ */
  /* Aşağı çekerek yenileme                                              */
  /* ------------------------------------------------------------------ */
  function setupPullToRefresh(screen) {
    var startY = 0, pulling = false, hint = $("[data-pull]", screen);
    if (!hint) return;

    screen.addEventListener("touchstart", function (e) {
      if (screen.scrollTop <= 0) { startY = e.touches[0].clientY; pulling = true; }
    }, { passive: true });

    screen.addEventListener("touchmove", function (e) {
      if (!pulling) return;
      var dy = e.touches[0].clientY - startY;
      if (dy > 12 && screen.scrollTop <= 0) {
        hint.classList.add("is-pulling");
        hint.style.height = Math.min(74, dy * 0.6) + "px";
      }
    }, { passive: true });

    screen.addEventListener("touchend", function () {
      if (!pulling) return;
      pulling = false;
      var h = parseFloat(hint.style.height || "0");
      hint.style.height = "0px";
      if (h > 40 && !UI.refreshing) {
        UI.refreshing = true;
        hint.classList.add("is-refreshing");
        hint.style.height = "54px";
        setTimeout(function () {
          UI.refreshing = false;
          hint.classList.remove("is-refreshing", "is-pulling");
          hint.style.height = "0px";
          renderScreen();
          C.toast("Akış güncellendi", { icon: "refresh" });
        }, 900);
      } else {
        hint.classList.remove("is-pulling");
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Yeni gönderi: dosya yükleme + form                                       */
  /* ------------------------------------------------------------------ */
  function setupCreateInputs() {
    var cap = $("#captionInput");
    var loc = $("#locationInput");
    var aud = $("#audioInput");
    if (cap) cap.addEventListener("input", function () { UI.create.caption = cap.value; });
    if (loc) loc.addEventListener("input", function () { UI.create.location = loc.value; });
    if (aud) aud.addEventListener("input", function () { UI.create.audio = aud.value; });

    var fi = $("#fileInputMulti");
    if (fi) fi.addEventListener("change", function () {
      var files = fi.files ? Array.prototype.slice.call(fi.files) : [];
      if (!files.length) return;
      if (files.length === 1) {
        loadImageFile(files[0], function (dataUrl) {
          UI.create.src = dataUrl;
          UI.create.batch = [];
          UI.create.isNew = false;
          renderScreen();
          renderAppBar();
        });
        return;
      }
      loadImageFiles(files, function (list) {
        UI.create.src = null;
        UI.create.batch = list;
        UI.create.isNew = false;
        C.toast(list.length + " fotoğraf hazır", { icon: "check" });
        renderScreen();
        renderAppBar();
      });
      fi.value = "";
    });
    var ci = $("#cameraInput");
    if (ci) ci.addEventListener("change", function () {
      if (ci.files && ci.files[0]) loadImageFile(ci.files[0], function (dataUrl) {
        UI.create.src = dataUrl;
        UI.create.batch = [];
        renderScreen();
        renderAppBar();
      });
    });
  }

  /** Tek dosyayı okuyup küçültür (en fazla 1080 px, JPEG). */
  function loadImageFile(file, cb) {
    if (!/^image\//.test(file.type)) { C.toast("Sadece görsel dosyaları destekleniyor", { icon: "info" }); return; }
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var max = 1080;
        var scale = Math.min(1, max / Math.max(img.width, img.height));
        var canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        try { cb(canvas.toDataURL("image/jpeg", 0.82)); }
        catch (e) { cb(reader.result); }
      };
      img.onerror = function () { C.toast("Görsel okunamadı", { icon: "info" }); };
      img.src = reader.result;
    };
    reader.onerror = function () { C.toast("Dosya okunamadı", { icon: "info" }); };
    reader.readAsDataURL(file);
  }

  /** Birden fazla dosyayı sırayla işler; hepsi bitince listeyi döndürür. */
  function loadImageFiles(files, cb) {
    var out = [];
    var i = 0;
    var next = function () {
      if (i >= files.length) { cb(out); return; }
      var file = files[i++];
      if (!/^image\//.test(file.type)) { next(); return; }
      loadImageFile(file, function (dataUrl) { out.push(dataUrl); next(); });
    };
    next();
  }

  /** Ayarlar > "Yedeği geri yükle" dosya seçicisi. */
  function setupSettingsInputs() {
    var fi = $("#importInput");
    if (!fi) return;
    fi.addEventListener("change", function () {
      if (!fi.files || !fi.files[0]) return;
      var reader = new FileReader();
      reader.onload = function () {
        var obj;
        try { obj = JSON.parse(reader.result); }
        catch (e) { C.toast("JSON dosyası okunamadı", { icon: "info" }); return; }
        if (Store.importState(obj)) {
          UI.tab.profile = "posts";
          applyTheme();
          render();
          C.toast("Yedek geri yüklendi · " + Store.postCount(Store.meId) + " gönderi", { icon: "check" });
        } else {
          C.toast("Bu dosya uygulamanın yedeği değil", { icon: "info" });
        }
      };
      reader.onerror = function () { C.toast("Dosya okunamadı", { icon: "info" }); };
      reader.readAsText(fi.files[0]);
      fi.value = "";
    });
  }

  /* ------------------------------------------------------------------ */
  /* Öne çıkanlar: oluşturma, kapağı/adı değiştirme, silme               */
  /* ------------------------------------------------------------------ */
  function openHighlightCreate() {
    var mine = Store.postsOf(Store.meId);
    var defCover = mine.length ? mine[0].src : "media/gunseli-01.jpg";
    UI.hlCover = defCover;
    var body = '<div class="hlform">' +
      '<div class="hlform__cover"><span class="highlight__ring">' +
        '<img class="highlight__img" id="hlCoverImg" src="' + C.esc(defCover) + '" alt="kapak" ' +
        'data-kind="photo" data-seed="kapak" onerror="IG.fallback(this)"></span>' +
        '<button class="btn btn--ghost btn--sm" data-act="highlight-cover-pick">Kapak fotoğrafı seç</button></div>' +
      '<label class="field"><span>Ad</span><input type="text" id="hlTitle" value="Anılar" maxlength="20"></label>' +
      '<button class="btn btn--primary btn--block" data-act="highlight-save">Öne çıkanı ekle</button>' +
      '<input type="file" id="hlCoverInput" accept="image/*" hidden>' +
      '<p class="create-hint">Kapak olarak telefondan bir fotoğraf seçebilirsin. Öne çıkanlar profilinde daire olarak görünür.</p>' +
    "</div>";
    var el = C.sheet({ title: "Yeni öne çıkan", body: body, cls: "sheet--form" });
    var input = el.querySelector("#hlCoverInput");
    if (input) {
      input.addEventListener("change", function () {
        if (!input.files || !input.files[0]) return;
        loadImageFile(input.files[0], function (dataUrl) {
          UI.hlCover = dataUrl;
          var img = el.querySelector("#hlCoverImg");
          if (img) { img.onerror = null; img.src = dataUrl; }
        });
      });
    }
  }

  function openHighlightRename(h) {
    var body = '<div class="hlform">' +
      '<label class="field"><span>Ad</span><input type="text" id="hlTitle" value="' + C.esc(h.title || "") + '" maxlength="20"></label>' +
      '<button class="btn btn--primary btn--block" data-act="highlight-save" data-highlight="' + h.id + '">Kaydet</button>' +
      '<button class="btn btn--ghost btn--block" data-act="sheet-close">Vazgeç</button>' +
    "</div>";
    C.sheet({ title: "Öne çıkanın adı", body: body, cls: "sheet--form" });
  }

  /** Kapak için telefondan fotoğraf seçtirir. */
  function pickHighlightCover(h) {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";
    input.addEventListener("change", function () {
      if (!input.files || !input.files[0]) { if (input.parentNode) input.parentNode.removeChild(input); return; }
      loadImageFile(input.files[0], function (dataUrl) {
        Store.updateHighlight(h.id, { cover: dataUrl });
        C.toast("Kapak güncellendi", { icon: "check" });
        if (input.parentNode) input.parentNode.removeChild(input);
        renderScreen();
      });
    });
    document.body.appendChild(input);
    input.click();
  }

  function openHighlight(h) {
    if (!h) return;
    var isMe = h.userId === Store.meId;
    if (!isMe) {
      if (h.postIds && h.postIds.length) { navigate("post/" + h.postIds[0]); return; }
      C.toast("Bu öne çıkan şu an boş", { icon: "info" });
      return;
    }
    var items = [];
    if (h.postIds && h.postIds.length) items.push({ value: "view", label: "Gönderiyi aç", icon: "image" });
    items.push({ value: "cover", label: "Kapağı değiştir", icon: "camera" });
    items.push({ value: "rename", label: "Adını değiştir", icon: "text" });
    items.push({ value: "delete", label: "Öne çıkanı sil", icon: "trash", danger: true });
    C.actionSheet(h.title || "Öne çıkan", items).then(function (v) {
      if (!v) return;
      if (v === "view") navigate("post/" + h.postIds[0]);
      else if (v === "cover") pickHighlightCover(h);
      else if (v === "rename") openHighlightRename(h);
      else if (v === "delete") {
        C.confirmSheet({ title: "Öne çıkanı sil?", text: "“" + (h.title || "") + "” öne çıkanı profilinizden kaldırılacak.", confirmLabel: "Sil" })
          .then(function (ok) {
            if (!ok) return;
            Store.deleteHighlight(h.id);
            C.toast("Öne çıkan silindi", { icon: "trash" });
            renderScreen();
          });
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* DOM yamaları (tam yeniden çizim yapmadan güncelleme)                */
  /* ------------------------------------------------------------------ */
  function burst(postEl) {
    if (!postEl) return;
    var hb = postEl.querySelector(".heart-burst");
    if (!hb) return;
    hb.classList.remove("is-on");
    void hb.offsetWidth;
    hb.classList.add("is-on");
  }

  function patchPostUI(postId, animateHeart) {
    var p = Store.post(postId);
    if (!p) return;
    $$('[data-post="' + postId + '"]').forEach(function (node) {
      if (!node.classList.contains("post") && !node.classList.contains("detail")) return;
      var tmp = document.createElement("div");
      tmp.innerHTML = node.classList.contains("detail") ? Screens.post() : C.postCard(p);
      var fresh = tmp.firstElementChild;
      if (!fresh) return;
      node.replaceWith(fresh);
      if (animateHeart) burst(fresh);
    });
    $$('.reel[data-post="' + postId + '"]').forEach(function (reel) {
      var btn = reel.querySelector('[data-act="like"]');
      if (btn) {
        btn.classList.toggle("is-active", p.liked);
        btn.innerHTML = Icons.icon(p.liked ? "heartFill" : "heart", { size: 27 }) +
          "<span>" + C.formatCount(Store.likedCount(p)) + "</span>";
      }
      var saveBtn = reel.querySelector('[data-act="save"]');
      if (saveBtn) {
        saveBtn.classList.toggle("is-active", p.saved);
        saveBtn.innerHTML = Icons.icon(p.saved ? "saveFill" : "save", { size: 26 }) + "<span>Kaydet</span>";
      }
      var cBtn = reel.querySelector('[data-act="comment-open"]');
      if (cBtn) cBtn.innerHTML = Icons.icon("comment", { size: 26 }) + "<span>" + C.formatCount(Store.commentsCount(p)) + "</span>";
    });
  }

  function patchFollowUI(userId) {
    var u = Store.user(userId);
    if (!u) return;
    var following = Store.isFollowing(u.id);
    $$('[data-act="follow"][data-user="' + userId + '"]').forEach(function (btn) {
      btn.classList.toggle("btn--primary", !following);
      btn.classList.toggle("btn--ghost", following);
      btn.textContent = following ? "Takip ediliyor" : "Takip et";
    });
    $$('.reel__user [data-act="follow"][data-user="' + userId + '"]').forEach(function (btn) {
      btn.classList.toggle("btn--primary", !following);
      btn.classList.toggle("btn--ghost", following);
      btn.textContent = following ? "Takip ediliyor" : "Takip et";
    });
    if (UI.route.name === "profile") {
      var r = UI.route;
      var shown = r.params.username ? Store.userByUsername(r.params.username) : Store.me();
      if (shown && shown.id === userId) renderScreen();
    }
    renderRowFollowButtons();
  }

  function renderRowFollowButtons() {
    $$(".user-row [data-act='follow'], .suggest__card [data-act='follow']").forEach(function (btn) {
      var id = btn.getAttribute("data-user");
      var on = Store.isFollowing(id);
      btn.className = "btn btn--sm " + (on ? "btn--ghost" : "btn--primary") +
        (btn.classList.contains("btn--block") ? " btn--block" : "");
      btn.textContent = on ? "Takip ediliyor" : "Takip et";
    });
  }

  function updateBadges() {
    var b = badges();
    setBadge('[data-act="activity-open"] .dot-badge', b.notif);
    setBadge('[data-act="direct-open"] .dot-badge', b.dm);
    setBadge('[data-go="activity"] .dot-badge', b.notif);
    setBadge('[data-go="profile"] .dot-badge', 0);
  }

  function setBadge(selector, count) {
    var el = $(selector);
    if (!el) {
      if (count > 0) {
        var host = $(selector.split(" .")[0]);
        if (host) {
          var span = document.createElement("span");
          span.className = "dot-badge";
          span.textContent = count;
          host.appendChild(span);
        }
      }
      return;
    }
    if (count > 0) { el.textContent = count; el.hidden = false; }
    else { el.hidden = true; }
  }

  /* ------------------------------------------------------------------ */
  /* Katmanlar: yorumlar, paylaş, menü, hikâye, profil düzenleme         */
  /* ------------------------------------------------------------------ */
  function openComments(postId, opts) {
    opts = opts || {};
    UI.commentPost = postId;
    var p = Store.post(postId);
    if (!p) return;
    var body =
      '<div class="comments" id="commentsList">' +
        (p.comments.length ? p.comments.map(function (c) { return C.commentRow(p, c, true); }).join("")
          : '<p class="detail__empty">Henüz yorum yok. İlk yorumu sen yaz.</p>') +
      "</div>" +
      '<div class="comments__reply" id="replyChip" hidden><span></span><button class="lnk" data-act="reply-cancel">İptal</button></div>' +
      '<form class="comments__input" data-form="sheet-comment">' +
        '<span class="comment-av">' + C.avatar(Store.me(), 30) + "</span>" +
        '<input type="text" id="sheetCommentInput" placeholder="Yorum ekle…" autocomplete="off">' +
        '<button type="button" class="icon-btn" data-act="emoji-insert" data-target="sheetCommentInput">' + Icons.icon("smiley", { size: 20 }) + "</button>" +
        '<button type="submit" class="lnk lnk--bold">Paylaş</button>' +
      "</form>";

    C.sheet({ title: "Yorumlar", body: body, cls: "sheet--comments", onClose: function () { UI.commentPost = null; UI.replyTo = null; } });
    if (opts.focus) setTimeout(function () { var i = $("#sheetCommentInput"); if (i) i.focus(); }, 320);
  }

  function refreshComments() {
    var p = Store.post(UI.commentPost);
    var list = $("#commentsList");
    if (p && list) {
      list.innerHTML = p.comments.length
        ? p.comments.map(function (c) { return C.commentRow(p, c, true); }).join("")
        : '<p class="detail__empty">Henüz yorum yok. İlk yorumu sen yaz.</p>';
      list.scrollTop = list.scrollHeight;
    }
    var dl = $("#detailComments");
    if (p && dl) {
      dl.innerHTML = p.comments.length
        ? p.comments.map(function (c) { return C.commentRow(p, c, true); }).join("")
        : '<p class="detail__empty">Henüz yorum yok. İlk yorumu sen yaz.</p>';
    }
    if (UI.route.name === "post") {
      var pl = $(".detail .post-likes");
      if (pl) pl.textContent = C.formatCountExact(Store.likedCount(p)) + " beğenme";
    }
  }

  function openShare(postId) {
    var p = Store.post(postId);
    var u = Store.user(p.userId);
    var body = '<div class="share__top">' + C.avatar(u, 40) +
      '<span class="share__t"><b>' + C.esc(u.username) + "</b><i>Gönderiyi paylaş</i></span></div>" +
      '<div class="share__users">' + Store.state.users.filter(function (x) { return x.id !== Store.meId; }).slice(0, 8).map(function (x) {
        return '<button class="share__user" data-act="share-send" data-user="' + x.id + '">' + C.avatar(x, 54) + "<span>" + C.esc(x.username.split(".")[0]) + "</span></button>";
      }).join("") + "</div>" +
      '<ul class="actionsheet">' +
        '<li><button class="actionsheet__item" data-value="copy">' + Icons.icon("share", { size: 20 }) + "<span>Bağlantıyı kopyala</span></button></li>" +
        '<li><button class="actionsheet__item" data-value="story">' + Icons.icon("plusSquare", { size: 20 }) + "<span>Hikâyene ekle</span></button></li>" +
        '<li><button class="actionsheet__item" data-value="dm">' + Icons.icon("messenger", { size: 20 }) + "<span>Mesaj olarak gönder</span></button></li>" +
        (p.saved
          ? '<li><button class="actionsheet__item" data-value="unsave">' + Icons.icon("saveFill", { size: 20 }) + "<span>Kaydedilenlerden çıkar</span></button></li>"
          : '<li><button class="actionsheet__item" data-value="save">' + Icons.icon("save", { size: 20 }) + "<span>Kaydet</span></button></li>") +
      "</ul>";
    var el = C.sheet({ title: "Paylaş", body: body, cls: "sheet--share" });
    el.querySelectorAll("[data-value]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var v = btn.getAttribute("data-value");
        C.closeSheet();
        if (v === "copy") {
          copyLink(postId);
        } else if (v === "save" || v === "unsave") {
          Store.toggleSave(postId);
          patchPostUI(postId);
          C.toast(v === "save" ? "Kaydedildi" : "Kaydedilenlerden çıkarıldı", { icon: "save" });
        } else if (v === "story") {
          C.toast("Hikâyene eklendi", { icon: "check" });
        } else if (v === "dm") {
          navigate("direct/d1");
        }
      });
    });
  }

  function copyLink(postId) {
    var url = location.origin + location.pathname + "#/post/" + postId;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () {
        C.toast("Bağlantı kopyalandı", { icon: "check" });
      }, function () { C.toast("Bağlantı: " + url); });
    } else {
      C.toast("Bağlantı: " + url);
    }
  }

  function openPostMenu(postId) {
    var p = Store.post(postId);
    var u = Store.user(p.userId);
    var mine = p.userId === Store.meId;
    var items = [];
    if (mine) {
      items = [
        { value: "archive", label: p.archived ? "Arşivden çıkar" : "Arşivle", icon: "bookmarkTab" },
        { value: "edit", label: "Açıklamayı düzenle", icon: "text" },
        { value: "link", label: "Bağlantıyı kopyala", icon: "share" },
        { value: "delete", label: p.placeholder ? "Örnek gönderiyi kaldır" : "Gönderiyi sil", icon: "trash", danger: true }
      ];
    } else {
      items = [
        { value: "save", label: p.saved ? "Kaydedilenlerden çıkar" : "Kaydet", icon: "save" },
        { value: "unfollow", label: "Takibi bırak", icon: "heart" },
        { value: "mute", label: "Sessize al", icon: "mute" },
        { value: "report", label: "Şikâyet et", icon: "info", danger: true }
      ];
    }
    C.actionSheet("Gönderi seçenekleri", items).then(function (v) {
      if (!v) return;
      if (v === "archive") {
        Store.toggleArchive(postId);
        C.toast(p.archived ? "Arşivlendi" : "Arşivden çıkarıldı", { icon: "check" });
        renderScreen();
      } else if (v === "edit") {
        editCaption(postId);
      } else if (v === "link") {
        copyLink(postId);
      } else if (v === "delete") {
        C.confirmSheet({
          title: p.placeholder ? "Örnek gönderiyi kaldır?" : "Gönderiyi sil?",
          text: p.placeholder ? "Bu yalnızca profildeki örnek bir görseldir; kaldırılabilir." : "Bu gönderi kalıcı olarak silinecek.",
          confirmLabel: "Kaldır"
        }).then(function (ok) {
          if (!ok) return;
          Store.deletePost(postId);
          C.toast("Gönderi silindi", { icon: "trash" });
          if (UI.route.name === "post") goBack(); else renderScreen();
        });
      } else if (v === "save") {
        Store.toggleSave(postId); patchPostUI(postId); C.toast("Kaydedildi", { icon: "save" });
      } else if (v === "unfollow") {
        Store.toggleFollow(p.userId); patchFollowUI(p.userId);
        C.toast(u.username + " takipten çıkarıldı", { icon: "check" });
      } else {
        C.toast("Geri bildirimin alındı", { icon: "check" });
      }
    });
  }

  function editCaption(postId) {
    var p = Store.post(postId);
    var body = '<div class="confirm"><textarea id="editCaption" rows="4" placeholder="Açıklama">' + C.esc(p.caption) + "</textarea>" +
      '<button class="btn btn--primary btn--block" data-value="1">Kaydet</button>' +
      '<button class="btn btn--ghost btn--block" data-value="0">Vazgeç</button></div>';
    var el = C.sheet({ title: "Açıklamayı düzenle", body: body });
    el.querySelectorAll("[data-value]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (btn.getAttribute("data-value") === "1") {
          p.caption = $("#editCaption").value;
          p.edited = true;
          Store.persist();
          patchPostUI(postId);
          C.toast("Açıklama güncellendi", { icon: "check" });
        }
        C.closeSheet();
      });
    });
  }

  function openFollowersSheet(userId, mode) {
    var u = Store.user(userId);
    var meId = Store.meId;
    var isFollowers = mode === "followers";
    var list = isFollowers
      ? Store.state.users.filter(function (x) { return Store.isFollowing(x.id) || (x.followersBase > 10000 && x.id !== meId); })
      : (Store.state.follows[userId] || []).map(function (id) { return Store.user(id); }).filter(Boolean);

    if (isFollowers) list = Store.state.users.filter(function (x) { return x.id !== userId; }).slice(0, 12);

    var body = '<div class="user-list">' + list.map(function (x) {
      return '<div class="user-row">' + C.avatar(x, 44) +
        '<span class="user-row__meta" data-act="open-profile" data-user="' + x.id + '">' +
          '<span class="user-row__name">' + C.esc(x.username) + (x.verified ? Icons.verified(11) : "") + "</span>" +
          '<span class="user-row__sub">' + C.esc(x.name) + "</span></span>" +
        C.followButton(x, { cls: "btn--sm" }) + "</div>";
    }).join("") + "</div>";

    C.sheet({ title: isFollowers ? "Takipçiler" : "Takip edilenler", body: body, cls: "sheet--list" });
  }

  function openEditProfile() {
    var me = Store.me();
    var body = '<div class="editprof">' +
      '<div class="editprof__avatar">' + C.avatar(me, 84) +
        '<button class="btn btn--ghost btn--sm" data-act="edit-avatar">Fotoğrafı değiştir</button>' +
        '<input type="file" id="avatarInput" accept="image/*" hidden>' +
      "</div>" +
      '<label class="field"><span>Ad</span><input type="text" id="pfName" value="' + C.esc(me.name) + '"></label>' +
      '<label class="field"><span>Kullanıcı adı</span><input type="text" id="pfUsername" value="' + C.esc(me.username) + '"></label>' +
      '<label class="field"><span>Biyografi</span><textarea id="pfBio" rows="3">' + C.esc(me.bio) + "</textarea></label>" +
      '<label class="field"><span>Bağlantı</span><input type="text" id="pfLink" value="' + C.esc(me.link || "") + '"></label>' +
      '<button class="btn btn--primary btn--block" data-act="profile-save">Kaydet</button>' +
      '<button class="btn btn--ghost btn--block" data-act="sheet-close">Vazgeç</button>' +
    "</div>";
    var el = C.sheet({ title: "Profili düzenle", body: body, cls: "sheet--form" });
    var input = $("#avatarInput");
    if (input) input.addEventListener("change", function () {
      if (input.files && input.files[0]) loadImageFile(input.files[0], function (dataUrl) {
        var av = el.querySelector(".editprof__avatar img");
        if (av) { av.src = dataUrl; av.onerror = null; }
        el.dataset.avatar = dataUrl;
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Hikâye oynatıcı                                                     */
  /* ------------------------------------------------------------------ */
  function storyOrder() {
    return Store.storyBar().map(function (s) { return s.userId; });
  }

  function openStory(userId, startIndex) {
    var order = storyOrder();
    if (order.indexOf(userId) === -1) order = [userId].concat(order);
    var st = Store.storiesFor(userId);
    if (!st || !st.items.length) {
      C.toast(userId === Store.meId ? "Hikâye ekleme bu demoda yakında" : "Bu kullanıcının hikâyesi yok", { icon: "camera" });
      return;
    }

    closeStory();
    var root = $("#overlays");
    var el = document.createElement("div");
    el.className = "story-viewer";
    root.appendChild(el);
    document.body.classList.add("has-overlay");

    UI.story = {
      el: el, order: order, orderIndex: order.indexOf(userId),
      userId: userId, index: Math.max(0, Math.min(startIndex || 0, st.items.length - 1)),
      paused: false, timer: null, startedAt: 0, duration: 5000
    };
    renderStory();
    attachStoryGestures(el);
  }

  function renderStory() {
    var s = UI.story;
    if (!s) return;
    var st = Store.storiesFor(s.userId);
    if (!st) { closeStory(); return; }
    var item = st.items[s.index];
    var u = Store.user(s.userId);
    var mine = s.userId === Store.meId;

    s.el.innerHTML =
      '<div class="sv-bg" style="background-image:url(' + JSON.stringify(item.src) + ')"></div>' +
      '<div class="sv-progress">' + st.items.map(function (it, i) {
        return '<span class="sv-bar' + (i < s.index ? " is-done" : i === s.index ? " is-active" : "") + '" data-i="' + i + '"><i></i></span>';
      }).join("") + "</div>" +
      '<header class="sv-head">' +
        '<button class="icon-btn icon-btn--ghost" data-act="story-close" aria-label="Kapat">' + Icons.icon("close", { size: 22 }) + "</button>" +
        '<span class="sv-head__user">' + C.avatar(u, 32) +
          "<span><b>" + C.esc(u.username) + "</b><i>" + C.timeAgo(item.at) + "</i></span></span>" +
        '<button class="icon-btn icon-btn--ghost" data-act="story-more" aria-label="Seçenekler">' + Icons.icon("more", { size: 20 }) + "</button>" +
      "</header>" +
      '<div class="sv-stage">' +
        '<div class="sv-tap sv-tap--prev" data-act="story-prev"></div>' +
        '<div class="sv-tap sv-tap--next" data-act="story-next"></div>' +
        C.media(item.src, "hikâye", 1080, 1920, "sv-media") +
        (item.caption ? '<div class="sv-caption">' + C.richText(item.caption) + "</div>" : "") +
        (item.audio ? '<div class="sv-audio">' + Icons.icon("music", { size: 14 }) + C.esc(item.audio) + "</div>" : "") +
      "</div>" +
      '<footer class="sv-foot">' +
        (mine
          ? '<div class="sv-views">' + Icons.icon("eye", { size: 18 }) + "<span>" + Math.max(12, Store.followersCount(u) % 400) + " görüntüleme</span>" +
            '<button class="lnk" data-act="story-delete">Hikâyeyi sil</button></div>'
          : '<form class="sv-reply" data-form="story-reply">' +
            '<input type="text" id="storyReply" placeholder="' + C.esc(u.username) + " kişisine yanıt ver…" + '" autocomplete="off">' +
            '<button type="button" class="icon-btn" data-act="emoji-insert" data-target="storyReply">' + Icons.icon("smiley", { size: 20 }) + "</button>" +
            '<button type="submit" class="icon-btn" aria-label="Gönder">' + Icons.icon("share", { size: 22 }) + "</button></form>") +
      "</footer>";

    Store.markStorySeen(s.userId, item.id);
    startStoryTimer();
  }

  function startStoryTimer() {
    var s = UI.story;
    if (!s) return;
    clearTimeout(s.timer);
    var bar = s.el.querySelector(".sv-bar.is-active i");
    var duration = 5000;
    if (bar) {
      bar.style.transition = "none";
      bar.style.width = "0%";
      void bar.offsetWidth;
      bar.style.transition = "width " + duration + "ms linear";
      bar.style.width = "100%";
    }
    s.duration = duration;
    s.startedAt = Date.now();
    s.timer = setTimeout(storyNext, duration);
  }

  function pauseStory() {
    var s = UI.story;
    if (!s || s.paused) return;
    s.paused = true;
    clearTimeout(s.timer);
    var bar = s.el.querySelector(".sv-bar.is-active i");
    if (bar) {
      var elapsed = Date.now() - s.startedAt;
      var pct = Math.min(100, (elapsed / s.duration) * 100);
      bar.style.transition = "none";
      bar.style.width = pct + "%";
      s.remaining = Math.max(300, s.duration - elapsed);
    }
    s.el.classList.add("is-paused");
  }

  function resumeStory() {
    var s = UI.story;
    if (!s || !s.paused) return;
    s.paused = false;
    s.el.classList.remove("is-paused");
    var bar = s.el.querySelector(".sv-bar.is-active i");
    var remaining = s.remaining || 3000;
    if (bar) {
      bar.style.transition = "width " + remaining + "ms linear";
      bar.style.width = "100%";
    }
    s.startedAt = Date.now();
    s.duration = remaining;
    s.timer = setTimeout(storyNext, remaining);
  }

  function storyNext() {
    var s = UI.story;
    if (!s) return;
    var st = Store.storiesFor(s.userId);
    if (st && s.index + 1 < st.items.length) {
      s.index += 1;
      renderStory();
      return;
    }
    var nextUser = s.order[s.orderIndex + 1];
    while (nextUser && !Store.storiesFor(nextUser)) {
      s.orderIndex += 1;
      nextUser = s.order[s.orderIndex + 1];
    }
    if (nextUser) {
      s.orderIndex += 1;
      s.userId = nextUser;
      s.index = 0;
      renderStory();
    } else {
      closeStory();
    }
  }

  function storyPrev() {
    var s = UI.story;
    if (!s) return;
    if (s.index > 0) { s.index -= 1; renderStory(); return; }
    var prevUser = s.order[s.orderIndex - 1];
    if (prevUser && Store.storiesFor(prevUser)) {
      s.orderIndex -= 1;
      s.userId = prevUser;
      s.index = Math.max(0, Store.storiesFor(prevUser).items.length - 1);
      renderStory();
    } else {
      startStoryTimer();
    }
  }

  function closeStory() {
    var s = UI.story;
    if (s) {
      clearTimeout(s.timer);
      if (s.el && s.el.parentNode) s.el.parentNode.removeChild(s.el);
    }
    UI.story = null;
    if (!document.querySelector(".overlay-root .sheet, .overlay-root .modal, .overlay-root .story-viewer")) {
      document.body.classList.remove("has-overlay");
    }
  }

  function attachStoryGestures(el) {
    var startY = 0, startX = 0, moved = false;
    el.addEventListener("touchstart", function (e) {
      startY = e.touches[0].clientY; startX = e.touches[0].clientX; moved = false;
      if (e.target.closest(".sv-foot, .sv-head")) return;
      UI.story.holdTimer = setTimeout(pauseStory, 220);
    }, { passive: true });
    el.addEventListener("touchmove", function (e) {
      var dy = e.touches[0].clientY - startY;
      var dx = e.touches[0].clientX - startX;
      if (Math.abs(dy) > 8 || Math.abs(dx) > 8) {
        moved = true;
        clearTimeout(UI.story.holdTimer);
        if (dy > 60 && Math.abs(dy) > Math.abs(dx)) el.classList.add("is-dragging");
      }
    }, { passive: true });
    el.addEventListener("touchend", function (e) {
      clearTimeout(UI.story && UI.story.holdTimer);
      var dy = (e.changedTouches[0] ? e.changedTouches[0].clientY : startY) - startY;
      if (dy > 90) { closeStory(); return; }
      el.classList.remove("is-dragging");
      if (UI.story && UI.story.paused) resumeStory();
    }, { passive: true });
    el.addEventListener("mousedown", function (e) {
      if (e.target.closest(".sv-foot, .sv-head")) return;
      UI.story.holdTimer = setTimeout(pauseStory, 220);
    });
    el.addEventListener("mouseup", function () {
      clearTimeout(UI.story && UI.story.holdTimer);
      if (UI.story && UI.story.paused) resumeStory();
    });
    el.addEventListener("mouseleave", function () {
      clearTimeout(UI.story && UI.story.holdTimer);
      if (UI.story && UI.story.paused) resumeStory();
    });
  }

  /* ------------------------------------------------------------------ */
  /* Olaylar                                                             */
  /* ------------------------------------------------------------------ */
  /* ------------------------------------------------------------------ */
  /* Etkileşim simülasyonu: paylaşılan gönderiye beğeni/yorum gelir      */
  /* ------------------------------------------------------------------ */
  function pickRandom(list, n) {
    var copy = list.slice();
    var out = [];
    while (copy.length && out.length < n) {
      out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
    }
    return out;
  }

  function simulateEngagement(postId) {
    var p = Store.post(postId);
    if (!p) return;
    var pool = Store.state.users.filter(function (u) { return u.id !== Store.meId; });
    if (!pool.length) return;

    setTimeout(function () {
      var p2 = Store.post(postId);
      if (!p2) return;
      var fans = pickRandom(pool, 3);
      var extra = 3 + Math.floor(Math.random() * 14);
      p2.likesBase += extra;
      Store.notify({
        type: "like", userId: fans[0].id, postId: postId, thumb: p2.src,
        text: (extra > 4 ? "ve " + extra + " kişi daha gönderini beğendi" : "gönderini beğendi")
      });
      patchPostUI(postId);
      updateBadges();
      C.toast(fans[0].username + " gönderini beğendi", { icon: "heartFill" });
    }, 2400);

    setTimeout(function () {
      var p3 = Store.post(postId);
      if (!p3) return;
      var u = pickRandom(pool, 1)[0];
      var texts = [
        "Harika olmuş! 🔥", "Bu kadraj çok iyi 👏", "Bayıldım 😍",
        "Nerede çektin bunu?", "Çok güzel görünüyor ✨", "Tam benim tarzım 💫"
      ];
      p3.comments.push({
        id: Store.uid("c"), userId: u.id,
        text: texts[Math.floor(Math.random() * texts.length)],
        at: Date.now(), likesBase: 0, liked: false, replies: []
      });
      Store.notify({
        type: "comment", userId: u.id, postId: postId, thumb: p3.src,
        text: "gönderine yorum yaptı: “" + p3.comments[p3.comments.length - 1].text + "”"
      });
      Store.persist();
      patchPostUI(postId);
      updateBadges();
      C.toast(u.username + " yorum yaptı", { icon: "comment" });
    }, 7200);
  }

  function autoReply(chatId, text) {
    var t = (text || "").toLowerCase();
    var replies = {
      greeting: ["Selam! Nasılsın? 😊", "Merhaba! İyi ki yazdın.", "Selam, ne haber?"],
      howareyou: ["İyiyim, teşekkürler! Sen nasılsın?", "Gayet iyi, seni sormak isterdim 😄"],
      thanks: ["Ne demek, her zaman 🙌", "Rica ederim!"],
      photo: ["Tabii, hafta sonu çekelim 📷", "Kadraj konusunda sana güveniyorum 😄"],
      meet: ["Olur! Saat kaçta?", "Planlayalım, bana uyar 👌"],
      coffee: ["Kahve mi? Hemen ☕️", "Kahve her zaman iyi fikir."],
      default: ["Anladım 👍", "Kulağa hoş geliyor!", "Peki, haber veririm.", "Haha, aynen 😄", "Tamamdır, konuşuruz."]
    };
    var list;
    if (/selam|merhaba|hey|günaydın|iyi akşam/.test(t)) list = replies.greeting;
    else if (/nasılsın|naber|ne haber|iyi misin/.test(t)) list = replies.howareyou;
    else if (/teşekkür|sağ ?ol|eyvallah/.test(t)) list = replies.thanks;
    else if (/fotoğraf|çekim|kamera|kadraj/.test(t)) list = replies.photo;
    else if (/buluş|görüş|randevu|müsait/.test(t)) list = replies.meet;
    else if (/kahve|çay/.test(t)) list = replies.coffee;
    else list = replies.default;
    var reply = list[Math.floor(Math.random() * list.length)];

    var ch = Store.chat(chatId);
    if (!ch) return;
    ch.typing = true;
    if (UI.route.name === "direct" && UI.route.params.chatId === chatId) renderChatMessages();
    setTimeout(function () {
      ch.typing = false;
      Store.receiveMessage(chatId, reply);
      if (UI.route.name === "direct" && UI.route.params.chatId === chatId) renderChatMessages();
    }, 900 + Math.random() * 900);
  }

  function submitComment(text) {
    if (!text || !text.trim()) return;
    var pid = UI.commentPost;
    if (!pid) return;
    Store.addComment(pid, text, UI.replyTo);
    UI.replyTo = null;
    refreshComments();
    patchPostUI(pid);
    C.toast("Yorum paylaşıldı", { icon: "check" });
  }

  function openChatWith(userId) {
    var ch = null;
    for (var i = 0; i < Store.state.chats.length; i++) {
      if (Store.state.chats[i].userId === userId) { ch = Store.state.chats[i]; break; }
    }
    if (!ch) {
      ch = { id: Store.uid("d"), userId: userId, unread: 0, messages: [], typing: false };
      Store.state.chats.unshift(ch);
      Store.persist();
    }
    navigate("direct/" + ch.id);
  }

  function handleClick(e) {
    var target = e.target.closest("[data-act]");
    if (!target) return;
    var act = target.getAttribute("data-act");
    var postId = target.getAttribute("data-post");
    var userId = target.getAttribute("data-user");

    switch (act) {
      case "noop": e.stopPropagation(); break;

      /* --- gezinme --- */
      case "go": navigate(target.getAttribute("data-go")); break;
      case "back": goBack(); break;
      case "create-open": UI.create = { src: null, batch: [], kind: "post", caption: "", location: "", isNew: false }; navigate("create"); break;
      case "settings-open": navigate("settings"); break;
      case "go-saved": navigate("saved"); break;
      case "activity-open": navigate("activity"); break;
      case "direct-open": navigate("direct"); break;
      case "chat-with": openChatWith(userId); break;
      case "open-profile":
        if (userId) navigate("profile/" + Store.user(userId).username);
        break;
      case "open-username":
        var un = target.getAttribute("data-username");
        if (un) navigate("profile/" + un.replace(/^@/, ""));
        break;
      case "search-hashtag":
        var tag = target.getAttribute("data-tag");
        UI.query = tag.replace(/^#/, "");
        addRecent(tag);
        navigate("explore");
        break;
      case "search-clear": UI.query = ""; renderAppBar(); renderScreen(); break;
      case "recent-clear": UI.recent = []; renderScreen(); break;

      /* --- gönderi --- */
      case "like": {
        var nowLiked = Store.toggleLike(postId);
        patchPostUI(postId, !!nowLiked);
        if (nowLiked && Math.random() < 0.25) {
          var pu = Store.user(Store.post(postId).userId);
          setTimeout(function () { C.toast(pu.username + " gönderini beğendi", { icon: "heartFill" }); }, 1200);
        }
        break;
      }
      case "save": {
        var saved = Store.toggleSave(postId);
        patchPostUI(postId);
        C.toast(saved ? "Kaydedildi" : "Kaydedilenlerden çıkarıldı", { icon: saved ? "saveFill" : "save" });
        break;
      }
      case "post-open":
        if (!postId) break;
        navigate("post/" + postId);
        break;
      case "post-menu": openPostMenu(postId); break;
      case "share": openShare(postId); break;
      case "comment-open": openComments(postId); break;
      case "focus-comment": openComments(postId, { focus: true }); break;
      case "reply-cancel": UI.replyTo = null; updateReplyChip(); break;
      case "emoji-insert": {
        var input = $("#" + target.getAttribute("data-target"));
        var emojis = ["😍", "🔥", "👏", "😂", "🙌", "💚", "✨", "😮"];
        if (input) {
          input.value += emojis[Math.floor(Math.random() * emojis.length)];
          input.focus();
        } else if (document.activeElement && document.activeElement.tagName === "INPUT") {
          document.activeElement.value += emojis[Math.floor(Math.random() * emojis.length)];
        }
        break;
      }
      case "comment-like": {
        Store.toggleCommentLike(postId, target.getAttribute("data-comment"));
        refreshComments();
        patchPostUI(postId);
        break;
      }
      case "comment-delete": {
        Store.deleteComment(postId, target.getAttribute("data-comment"));
        refreshComments();
        patchPostUI(postId);
        C.toast("Yorum silindi", { icon: "trash" });
        break;
      }
      case "comment-reply": {
        var cid = target.getAttribute("data-comment");
        var p2 = Store.post(postId);
        var who = null;
        p2.comments.forEach(function (c) {
          if (c.id === cid) who = c;
          (c.replies || []).forEach(function (r) { if (r.id === cid) who = r; });
        });
        UI.replyTo = cid;
        updateReplyChip(who ? Store.user(who.userId) : null);
        var inp = $("#sheetCommentInput");
        if (inp) inp.focus();
        break;
      }

      /* --- takip --- */
      case "follow": {
        var nowFollowing = Store.toggleFollow(userId);
        patchFollowUI(userId);
        var fu = Store.user(userId);
        C.toast(nowFollowing ? fu.username + " takip ediliyor" : fu.username + " takipten çıkarıldı", { icon: "check" });
        updateBadges();
        break;
      }
      case "unfollow-sheet": {
        C.actionSheet("@" + Store.user(userId).username, [
          { value: "unfollow", label: "Takibi bırak", icon: "heart", danger: true },
          { value: "mute", label: "Sessize al", icon: "mute" },
          { value: "restrict", label: "Kısıtla", icon: "lock" },
          { value: "cancel", label: "Vazgeç", icon: "close" }
        ]).then(function (v) {
          if (v === "unfollow") { Store.toggleFollow(userId); patchFollowUI(userId); C.toast("Takip bırakıldı", { icon: "check" }); }
          else if (v) C.toast("Ayar kaydedildi", { icon: "check" });
        });
        break;
      }
      case "followers": openFollowersSheet(target.getAttribute("data-value"), "followers"); break;
      case "following": openFollowersSheet(target.getAttribute("data-value"), "following"); break;

      /* --- hikâye --- */
      case "story-open": openStory(userId, 0); break;
      case "story-close": closeStory(); break;
      case "story-next": storyNext(); break;
      case "story-prev": storyPrev(); break;
      case "story-more": C.actionSheet("Hikâye", [
        { value: "mute", label: "Sessize al", icon: "mute" },
        { value: "report", label: "Şikâyet et", icon: "info", danger: true }
      ]).then(function (v) { if (v) C.toast("Ayar kaydedildi", { icon: "check" }); }); break;
      case "story-delete":
        C.confirmSheet({ title: "Hikâyeyi sil?", text: "Bu hikâye kalıcı olarak kaldırılacak.", confirmLabel: "Sil" }).then(function (ok) {
          if (!ok) return;
          var st = Store.storiesFor(UI.story.userId);
          if (st) {
            st.items = st.items.filter(function (it) { return it.id !== st.items[UI.story.index].id; });
            if (!st.items.length) { Store.state.stories = Store.state.stories.filter(function (x) { return x !== st; }); closeStory(); C.toast("Hikâye silindi", { icon: "trash" }); renderScreen(); return; }
          }
          C.toast("Hikâye silindi", { icon: "trash" });
          storyNext();
        });
        break;
      case "create-story": C.toast("Hikâye oluşturma bu demoda yakında", { icon: "camera" }); break;

      /* --- öne çıkanlar --- */
      case "highlight-open": openHighlight(Store.highlightById(target.getAttribute("data-highlight"))); break;
      case "highlight-create": openHighlightCreate(); break;
      case "highlight-cover-pick": {
        var hci = $("#hlCoverInput");
        if (hci) hci.click();
        break;
      }
      case "highlight-save": {
        var hid = target.getAttribute("data-highlight");
        var titleInput = $("#hlTitle");
        var title = titleInput && titleInput.value.trim() ? titleInput.value.trim() : "Öne çıkan";
        if (hid) {
          Store.updateHighlight(hid, { title: title, cover: UI.hlCover || Store.highlightById(hid).cover });
          C.toast("Öne çıkan güncellendi", { icon: "check" });
        } else {
          Store.addHighlight(Store.meId, title, UI.hlCover || "media/gunseli-01.jpg", []);
          C.toast("“" + title + "” öne çıkanı eklendi", { icon: "check" });
        }
        UI.hlCover = null;
        C.closeSheet();
        renderScreen();
        break;
      }
      case "note-open": C.toast("Notlar yalnızca görüntülenebilir", { icon: "info" }); break;

      /* --- reels --- */
      case "reel-tap": {
        var t = Date.now();
        if (UI.lastTap.id === postId && t - UI.lastTap.at < 320) {
          var p3 = Store.post(postId);
          if (!p3.liked) { Store.toggleLike(postId); patchPostUI(postId, true); }
          else { burst(target.closest(".reel")); }
          UI.lastTap = { id: null, at: 0 };
        } else {
          UI.lastTap = { id: postId, at: t };
          setTimeout(function () {
            if (UI.lastTap.id === postId && Date.now() - UI.lastTap.at >= 300) UI.lastTap = { id: null, at: 0 };
          }, 340);
        }
        break;
      }

      /* --- mesajlar --- */
      case "chat-open": navigate("direct/" + target.getAttribute("data-chat")); break;
      case "chat-suggest": {
        var ci = $("#chatText");
        if (ci) { ci.value = target.getAttribute("data-text"); ci.focus(); }
        break;
      }
      case "chat-emoji": {
        var ct = $("#chatText");
        if (ct) { ct.value += ["🙂", "😄", "👍", "🔥", "❤️"][Math.floor(Math.random() * 5)]; ct.focus(); }
        break;
      }
      case "chat-attach": C.toast("Ek gönderme bu demoda kapalı", { icon: "plus" }); break;
      case "chat-info": C.toast("Sohbet bilgisi", { icon: "info" }); break;
      case "new-message": C.toast("Yeni mesaj için bir sohbet seç", { icon: "messenger" }); break;

      /* --- oluştur --- */
      case "create-pick":
        UI.create.src = target.getAttribute("data-src");
        UI.create.batch = [];
        renderScreen(); renderAppBar();
        break;
      case "create-file":
        if ($("#fileInputMulti")) $("#fileInputMulti").click();
        else C.toast("Dosya seçici yalnızca ilk adımda açılır", { icon: "info" });
        break;
      case "create-camera":
        if ($("#cameraInput")) $("#cameraInput").click();
        else C.toast("Kamera yalnızca ilk adımda açılır", { icon: "info" });
        break;
      case "batch-remove": {
        var bi = parseInt(target.getAttribute("data-index"), 10);
        UI.create.batch.splice(bi, 1);
        renderScreen(); renderAppBar();
        break;
      }
      case "batch-share": {
        var batch = UI.create.batch.slice();
        if (!batch.length) { C.toast("Önce fotoğraf seç", { icon: "info" }); break; }
        var caption = UI.create.caption, loc = UI.create.location;
        UI.create = { src: null, batch: [], kind: "post", caption: "", location: "", isNew: true };
        UI.tab.profile = "posts";
        var ilk = null;
        batch.forEach(function (src, i) {
          var np = Store.addPost({ src: src, caption: caption, location: loc, kind: "post", alt: "yeni gönderi " + (i + 1) });
          if (i === 0) ilk = np;
        });
        C.toast(batch.length + " gönderi paylaşıldı", { icon: "check" });
        if (ilk) simulateEngagement(ilk.id);
        renderAppBar(); renderTabBar();
        navigate("profile/" + Store.me().username);
        break;
      }
      case "create-back":
        if (UI.create.batch && UI.create.batch.length) { UI.create.batch = []; renderScreen(); renderAppBar(); }
        else if (UI.create.src) { UI.create.src = null; renderScreen(); renderAppBar(); }
        else navigate("feed");
        break;
      case "create-reset":
        UI.create = { src: null, batch: [], kind: "post", caption: "", location: "", isNew: false };
        renderScreen(); renderAppBar();
        break;
      case "toggle-reel": {
        UI.create.kind = UI.create.kind === "reel" ? "post" : "reel";
        renderScreen(); renderAppBar();
        break;
      }
      case "create-share": {
        var c = UI.create;
        if (!c.src) { C.toast("Önce bir görsel seç", { icon: "info" }); break; }
        var np = Store.addPost({
          src: c.src, caption: c.caption, location: c.location,
          kind: c.kind, audio: c.audio, alt: "yeni gönderi"
        });
        UI.create = { src: null, batch: [], kind: "post", caption: "", location: "", isNew: true };
        UI.tab.profile = "posts";
        C.toast(c.kind === "reel" ? "Reels paylaşıldı" : "Gönderin paylaşıldı", { icon: "check" });
        simulateEngagement(np.id);
        renderAppBar();
        navigate("profile/" + Store.me().username);
        break;
      }
      case "share-profile": {
        var url = location.origin + location.pathname + "#/profile/" + Store.me().username;
        if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { C.toast("Profil bağlantısı kopyalandı", { icon: "check" }); }, function () { C.toast(url); });
        else C.toast(url);
        break;
      }
      case "open-link": {
        var lk = target.getAttribute("data-link");
        if (navigator.clipboard) navigator.clipboard.writeText(lk).then(function () { C.toast("Bağlantı kopyalandı: " + lk, { icon: "check" }); }, function () { C.toast(lk); });
        else C.toast(lk);
        break;
      }

      /* --- profil düzenleme --- */
      case "edit-profile": openEditProfile(); break;
      case "edit-avatar": { var ai = $("#avatarInput"); if (ai) ai.click(); break; }
      case "profile-save": {
        var sheet = target.closest(".sheet");
        Store.updateProfile({
          name: $("#pfName") ? $("#pfName").value : undefined,
          username: $("#pfUsername") ? $("#pfUsername").value : undefined,
          bio: $("#pfBio") ? $("#pfBio").value : undefined,
          link: $("#pfLink") ? $("#pfLink").value : undefined,
          avatar: sheet && sheet.dataset.avatar ? sheet.dataset.avatar : undefined
        });
        C.closeSheet();
        C.toast("Profil güncellendi", { icon: "check" });
        renderAppBar(); renderTabBar(); renderScreen();
        break;
      }

      /* --- ayarlar --- */
      case "theme-toggle": {
        var th = Store.toggleTheme();
        applyTheme();
        C.toast(th === "dark" ? "Koyu tema açık" : "Açık tema açık", { icon: th === "dark" ? "moon" : "sun" });
        renderScreen();
        break;
      }
      case "toggle-autoplay": Store.setSetting("autoplay", !Store.state.settings.autoplay); renderScreen(); break;
      case "toggle-datasaver": Store.setSetting("dataSaver", !Store.state.settings.dataSaver); renderScreen(); break;
      case "clear-placeholders": {
        var adet = Store.placeholderCount();
        C.confirmSheet({
          title: "Örnek gönderileri temizle?",
          text: adet + " örnek gönderi profilden kaldırılacak. Kendi eklediğin gönderiler etkilenmez.",
          confirmLabel: "Temizle"
        }).then(function (ok) {
          if (!ok) return;
          var silinen = Store.clearPlaceholders();
          C.toast(silinen + " örnek gönderi kaldırıldı", { icon: "trash" });
          renderScreen();
        });
        break;
      }
      case "export-data": exportData(); break;
      case "import-data":
        if ($("#importInput")) $("#importInput").click();
        else C.toast("Yedek dosyası seçici açılamadı", { icon: "info" });
        break;
      case "reset-data":
        C.confirmSheet({ title: "Tüm verileri sıfırla?", text: "Beğeniler, yorumlar, mesajlar ve paylaştığın gönderiler silinecek; örnek içerik geri yüklenecek.", confirmLabel: "Sıfırla" }).then(function (ok) {
          if (!ok) return;
          Store.reset();
          applyTheme();
          UI.tab.profile = "posts";
          navigate("feed");
          render();
          C.toast("Veriler sıfırlandı", { icon: "refresh" });
        });
        break;
      case "install-pwa": promptInstall(); break;
      case "logout":
        C.confirmSheet({ title: "Çıkış yap?", text: "Bu demo yerel çalıştığı için gerçek bir oturum yok. Veriler cihazda kalır.", confirmLabel: "Çıkış yap" }).then(function (ok) {
          if (ok) C.toast("Bu demoda oturum kapatma devre dışı", { icon: "info" });
        });
        break;

      /* --- katmanlar --- */
      case "sheet-close": C.closeSheet(); break;
      case "share-send":
        C.closeSheet();
        C.toast("@" + Store.user(userId).username + " kişisine gönderildi", { icon: "check" });
        break;
      case "tab":
        UI.tab.profile = target.getAttribute("data-tab");
        renderScreen();
        break;
      case "notifications-clear":
        Store.markNotificationsRead();
        renderScreen(); renderAppBar(); renderTabBar();
        C.toast("Tümü okundu olarak işaretlendi", { icon: "check" });
        break;
      default: break;
    }
  }

  function updateReplyChip(user) {
    var chip = $("#replyChip");
    if (!chip) return;
    if (!UI.replyTo) { chip.hidden = true; return; }
    chip.hidden = false;
    var uname = user ? user.username : "yorum";
    chip.querySelector("span").textContent = "@" + uname + " kişisine yanıt veriliyor";
  }

  function addRecent(term) {
    UI.recent = [term].concat(UI.recent.filter(function (t) { return t !== term; })).slice(0, 6);
  }

  function exportData() {
    try {
      var blob = new Blob([JSON.stringify(Store.state, null, 2)], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "instagram-demo-verileri.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
      C.toast("Veriler indirildi", { icon: "download" });
    } catch (e) {
      C.toast("Dışa aktarma başarısız", { icon: "info" });
    }
  }

  /* --- form gönderimleri (delegasyon) --- */
  function handleSubmit(e) {
    var form = e.target.closest("[data-form]");
    if (!form) return;
    e.preventDefault();
    var kind = form.getAttribute("data-form");
    if (kind === "chat") {
      var input = $("#chatText");
      var text = input ? input.value : "";
      if (!text.trim()) return;
      Store.sendMessage(UI.route.params.chatId, text);
      input.value = "";
      renderChatMessages();
      autoReply(UI.route.params.chatId, text);
    } else if (kind === "sheet-comment") {
      var ci = $("#sheetCommentInput");
      var ct = ci ? ci.value : "";
      if (!ct.trim()) return;
      submitComment(ct);
      ci.value = "";
    } else if (kind === "detail-comment") {
      var di = $("#detailCommentInput");
      var dt = di ? di.value : "";
      if (!dt.trim()) return;
      Store.addComment(UI.route.params.id, dt);
      di.value = "";
      refreshComments();
      patchPostUI(UI.route.params.id);
      C.toast("Yorum paylaşıldı", { icon: "check" });
    } else if (kind === "story-reply") {
      var si = $("#storyReply");
      var st = si ? si.value : "";
      if (!st.trim()) return;
      si.value = "";
      C.toast("Yanıtın gönderildi", { icon: "check" });
    }
  }

  /* --- çift dokunuşla beğeni --- */
  function handleDoubleTap(e) {
    var media = e.target.closest(".post-media, .detail__media");
    if (!media) return;
    var postId = media.getAttribute("data-post");
    var now = Date.now();
    if (UI.lastTap.id === postId && now - UI.lastTap.at < 320) {
      var p = Store.post(postId);
      if (p && !p.liked) { Store.toggleLike(postId); patchPostUI(postId, true); }
      else if (p) burst(media.closest(".post, .detail"));
      UI.lastTap = { id: null, at: 0 };
      e.preventDefault();
    } else {
      UI.lastTap = { id: postId, at: now };
    }
  }

  /* ------------------------------------------------------------------ */
  /* PWA                                                                 */
  /* ------------------------------------------------------------------ */
  var deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
  });
  function promptInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function (res) {
        C.toast(res.outcome === "accepted" ? "Uygulama yükleniyor" : "Yükleme iptal edildi", { icon: "download" });
        deferredPrompt = null;
      });
    } else if (window.matchMedia("(display-mode: standalone)").matches) {
      C.toast("Uygulama zaten yüklü", { icon: "check" });
    } else {
      C.toast("Tarayıcı menüsünden “Uygulamayı yükle” seçeneğini kullan", { icon: "info", duration: 3600 });
    }
  }

  function registerSW() {
    if (!("serviceWorker" in navigator)) return;
    if (location.protocol !== "http:" && location.protocol !== "https:") return;
    // Tek dosyalık sürümde sw.js yoktur
    if (window.IG_NO_SW) return;
    // ?nosw=1 → önbelleği devre dışı bırak (geliştirme/otomasyon kolaylığı)
    if (/[?&]nosw=1/.test(location.search)) {
      console.log("[sw] ?nosw=1 verildi, servis çalışanı atlandı");
      return;
    }
    navigator.serviceWorker.register("sw.js").catch(function (err) {
      console.warn("[sw] kayıt başarısız:", err);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Saat                                                                */
  /* ------------------------------------------------------------------ */
  function updateClock() {
    var now = new Date();
    var el = $("#clock");
    if (el) el.textContent = ("0" + now.getHours()).slice(-2) + ":" + ("0" + now.getMinutes()).slice(-2);
  }

  /* ------------------------------------------------------------------ */
  /* Önyükleme                                                           */
  /* ------------------------------------------------------------------ */
  function boot() {
    applyTheme();
    render();

    var phone = $("#phone");
    phone.addEventListener("click", function (e) {
      var actTarget = e.target.closest("[data-act]");
      if (actTarget && actTarget.getAttribute("data-act") === "sheet-close") {
        var sb = e.target.closest(".sheet");
        if (sb) return;
      }
      handleDoubleTap(e);
      handleClick(e);
    });
    phone.addEventListener("submit", handleSubmit);
    phone.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && e.target.tagName === "INPUT" && !e.target.closest("form")) {
        e.preventDefault();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if (UI.story) { closeStory(); return; }
      if (C.isSheetOpen()) { C.closeSheet(); return; }
      if (UI.route.name === "post" || UI.route.name === "create") goBack();
    });

    window.addEventListener("hashchange", function () {
      Store.setOpenChat(null);
      render();
    });

    // Mağaza değişikliklerine tepki: tema ve açık sohbet canlı güncellensin
    Store.subscribe(function (reason) {
      if (!reason) return;
      if (reason.indexOf("theme:") === 0) applyTheme();
      if (reason.indexOf("message:") === 0 && UI.route.name === "direct" && UI.route.params.chatId) {
        if (reason.split(":")[1] === UI.route.params.chatId) {
          renderChatMessages();
          updateBadges();
        }
      }
      if (reason === "notifications-read" || reason === "notifications-clear") updateBadges();
    });

    setInterval(updateClock, 20000);

    // İlk karşılama bildirimi
    setTimeout(function () {
      if (UI.welcomeShown) return;
      UI.welcomeShown = true;
      C.toast("Hoş geldin! Her şey bu cihazda saklanıyor.", { icon: "info", duration: 3200 });
    }, 700);

    registerSW();
    document.addEventListener("visibilitychange", function () {
      if (document.hidden && UI.story) pauseStory();
    });

    console.log("%cInstagram benzeri demo hazır", "color:#d62976;font-weight:600", "· veriler localStorage'da");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  IG.App = {
    navigate: navigate, render: render, UI: UI, openStory: openStory,
    Screens: Screens, renderChatMessages: renderChatMessages, applyTheme: applyTheme,
    openComments: openComments, simulateEngagement: simulateEngagement
  };
})(window.IG);
