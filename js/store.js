/* ==========================================================================
   store.js — Uygulama durumu: localStorage kalıcılığı, seçiciler ve eylemler
   ========================================================================== */
window.IG = window.IG || {};

(function (IG) {
  "use strict";

  var KEY = "instaclone.tr.v2";
  var state = null;
  var listeners = [];
  var persistTimer = null;
  var seq = 0;

  function uid(prefix) {
    seq += 1;
    return prefix + "_" + Date.now().toString(36) + "_" + seq.toString(36);
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function seed() {
    var s = clone(IG.seed);
    var now = Date.now();
    return {
      version: 2,
      createdAt: now,
      meId: s.meId,
      users: s.users,
      posts: s.posts,
      stories: s.stories.map(function (st) {
        st.seen = [];
        return st;
      }),
      notifications: s.notifications.map(function (n, i) {
        n.at = now - n.mins * 60000;
        n.read = i > 3;
        n.following = false;
        return n;
      }),
      chats: s.chats.map(function (ch) {
        ch.messages = ch.messages.map(function (m) {
          m.at = now - m.mins * 60000;
          m.seen = true;
          return m;
        });
        ch.typing = false;
        return ch;
      }),
      follows: s.follows,
      saved: s.saved,
      gallery: s.gallery,
      hashtags: s.hashtags,
      profile: { name: "", bio: "", link: "", avatar: "", username: "" },
      settings: { theme: "dark", autoplay: true, dataSaver: false, viewedAt: now }
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== 2 || !parsed.users || !parsed.posts) return null;
      return parsed;
    } catch (e) {
      console.warn("[store] kayıt okunamadı:", e);
      return null;
    }
  }

  function persist(immediate) {
    var write = function () {
      persistTimer = null;
      try {
        localStorage.setItem(KEY, JSON.stringify(state));
      } catch (e) {
        console.warn("[store] kaydedilemedi (kota?):", e);
      }
    };
    if (immediate) { write(); return; }
    if (persistTimer) return;
    persistTimer = setTimeout(write, 350);
  }

  function emit(reason) {
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](reason); } catch (e) { console.error(e); }
    }
  }

  /* ------------------------------------------------------------------ */
  /* Seçiciler                                                           */
  /* ------------------------------------------------------------------ */
  function me() { return byId(state.users, state.meId); }

  function byId(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function user(id) {
    if (!id) return null;
    if (state.profile && id === state.meId) {
      var u = byId(state.users, id);
      return u;
    }
    return byId(state.users, id);
  }

  function userByUsername(name) {
    if (!name) return null;
    name = String(name).toLowerCase().replace(/^@/, "");
    for (var i = 0; i < state.users.length; i++) {
      if (state.users[i].username.toLowerCase() === name) return state.users[i];
    }
    return null;
  }

  function post(id) { return byId(state.posts, id); }
  function chat(id) { return byId(state.chats, id); }

  function isFollowing(userId) {
    var list = state.follows[state.meId] || [];
    return list.indexOf(userId) !== -1;
  }

  function followsCount(userId) {
    return (IG.seed.followingBaseOf ? 0 : 0) + (state.follows[userId] ? state.follows[userId].length : 0);
  }

  /** Takipçi sayısı = temel sayı + demo grafında bu hesabı takip edenler.
      Böylece "takip et" düğmesine basmak karşı tarafın sayacını gerçekten artırır. */
  function followersCount(u) {
    if (!u) return 0;
    var n = u.followersBase || 0;
    for (var i = 0; i < state.users.length; i++) {
      var list = state.follows[state.users[i].id];
      if (list && list.indexOf(u.id) !== -1) n += 1;
    }
    return n;
  }

  function followingCount(u) {
    if (!u) return 0;
    return u.followingBase + (state.follows[u.id] ? state.follows[u.id].length : 0);
  }

  function postsOf(userId, opts) {
    opts = opts || {};
    return state.posts.filter(function (p) {
      if (p.userId !== userId) return false;
      if (opts.kind && p.kind !== opts.kind) return false;
      if (!opts.includeArchived && p.archived) return false;
      return true;
    }).sort(function (a, b) { return b.at - a.at; });
  }

  function postCount(userId) {
    return postsOf(userId).length;
  }

  /** Takip ettiğim kişilerin + kendi gönderilerimin akışı (reels hariç). */
  function feed() {
    var following = state.follows[state.meId] || [];
    return state.posts.filter(function (p) {
      if (p.kind === "reel") return false;
      if (p.archived) return false;
      return p.userId === state.meId || following.indexOf(p.userId) !== -1;
    }).sort(function (a, b) { return b.at - a.at; });
  }

  function reels() {
    return state.posts.filter(function (p) { return p.kind === "reel" && !p.archived; })
      .sort(function (a, b) { return b.at - a.at; });
  }

  function reelsOf(userId) {
    return postsOf(userId, { kind: "reel" });
  }

  function explore() {
    return state.posts.filter(function (p) { return !p.archived; })
      .sort(function (a, b) { return b.likesBase - a.likesBase; });
  }

  function savedPosts() {
    var ids = state.saved || [];
    return ids.map(function (id) { return post(id); }).filter(Boolean);
  }

  function taggedPosts(userId) {
    return state.posts.filter(function (p) {
      return !p.archived && (p.atUsers || []).indexOf(userId) !== -1;
    });
  }

  function likedCount(p) { return (p.likesBase || 0) + (p.liked ? 1 : 0); }
  function commentsCount(p) {
    var n = 0;
    (p.comments || []).forEach(function (c) { n += 1 + (c.replies ? c.replies.length : 0); });
    return n;
  }

  function storiesFor(userId) {
    for (var i = 0; i < state.stories.length; i++) {
      if (state.stories[i].userId === userId) return state.stories[i];
    }
    return null;
  }

  function storySeen(story, item) {
    return story.seen.indexOf(item.id) !== -1;
  }

  function unseenCount(story) {
    if (!story || !story.items || !story.items.length) return 0;
    var seen = story.seen || [];
    return story.items.filter(function (it) { return seen.indexOf(it.id) === -1; }).length;
  }

  /** Hikâye şeridi sırası: önce görülmemişler, sonra görülenler. */
  function storyBar() {
    var arr = state.stories.slice();
    arr.sort(function (a, b) {
      var ua = unseenCount(a) > 0 ? 0 : 1;
      var ub = unseenCount(b) > 0 ? 0 : 1;
      if (ua !== ub) return ua - ub;
      var la = a.items[a.items.length - 1].at;
      var lb = b.items[b.items.length - 1].at;
      return lb - la;
    });
    return arr;
  }

  function notifications() {
    return state.notifications.slice().sort(function (a, b) { return b.at - a.at; });
  }

  function unreadNotifications() {
    return state.notifications.filter(function (n) { return !n.read; }).length;
  }

  function chats() {
    return state.chats.slice().sort(function (a, b) {
      if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
      return lastMessageAt(b) - lastMessageAt(a);
    });
  }

  function lastMessageAt(ch) {
    var m = ch.messages[ch.messages.length - 1];
    return m ? m.at : 0;
  }

  function lastMessage(ch) {
    var m = ch.messages[ch.messages.length - 1];
    if (!m) return { text: "Sohbeti başlat", at: 0, from: ch.userId, seen: true };
    return m;
  }

  function unreadMessages() {
    var n = 0;
    state.chats.forEach(function (ch) { n += ch.unread || 0; });
    return n;
  }

  /** Akışta "X ve diğerleri beğendi" için arkadaş önerisi. */
  function friendsWhoLiked(p) {
    var following = state.follows[state.meId] || [];
    var pool = following.filter(function (id) { return id !== p.userId; });
    var pick = [];
    if (p.liked) pick.push(me());
    for (var i = 0; i < pool.length && pick.length < 2; i++) {
      if (i % 3 === 0) pick.push(user(pool[i]));
    }
    return pick.filter(Boolean);
  }

  /* ------------------------------------------------------------------ */
  /* Eylemler                                                            */
  /* ------------------------------------------------------------------ */
  function toggleLike(postId) {
    var p = post(postId);
    if (!p) return null;
    p.liked = !p.liked;
    persist(); emit("like:" + postId);
    return p.liked;
  }

  function toggleSave(postId) {
    var p = post(postId);
    if (!p) return null;
    p.saved = !p.saved;
    var i = state.saved.indexOf(postId);
    if (p.saved && i === -1) state.saved.unshift(postId);
    if (!p.saved && i !== -1) state.saved.splice(i, 1);
    persist(); emit("save:" + postId);
    return p.saved;
  }

  function addComment(postId, text, parentId) {
    var p = post(postId);
    if (!p || !text || !text.trim()) return null;
    var comment = {
      id: uid("c"), userId: state.meId, text: text.trim(),
      at: Date.now(), likesBase: 0, liked: false, replies: []
    };
    if (parentId) {
      var parent = null;
      p.comments.forEach(function (c) { if (c.id === parentId) parent = c; });
      if (parent) { parent.replies.push(comment); } else { p.comments.push(comment); }
    } else {
      p.comments.push(comment);
    }
    persist(); emit("comment:" + postId);
    return comment;
  }

  function toggleCommentLike(postId, commentId) {
    var p = post(postId);
    if (!p) return;
    var found = null;
    p.comments.forEach(function (c) {
      if (c.id === commentId) found = c;
      (c.replies || []).forEach(function (r) { if (r.id === commentId) found = r; });
    });
    if (!found) return;
    found.liked = !found.liked;
    persist(); emit("comment-like:" + postId);
  }

  function deleteComment(postId, commentId) {
    var p = post(postId);
    if (!p) return;
    p.comments = p.comments.filter(function (c) {
      if (c.id === commentId) return false;
      c.replies = (c.replies || []).filter(function (r) { return r.id !== commentId; });
      return true;
    });
    persist(); emit("comment-delete:" + postId);
  }

  function toggleFollow(userId) {
    if (userId === state.meId) return null;
    var list = state.follows[state.meId] || (state.follows[state.meId] = []);
    var i = list.indexOf(userId);
    var nowFollowing;
    if (i === -1) { list.unshift(userId); nowFollowing = true; }
    else { list.splice(i, 1); nowFollowing = false; }

    var theirList = state.follows[userId] || (state.follows[userId] = []);
    if (nowFollowing && theirList.indexOf(state.meId) === -1) theirList.push(state.meId);
    if (!nowFollowing) theirList = theirList.filter(function (id) { return id !== state.meId; });

    persist(); emit("follow:" + userId);
    return nowFollowing;
  }

  /** Yeni bir bildirim üretir (ör. beğeni, yorum, takip). */
  function notify(n) {
    var item = {
      id: uid("n"), type: n.type || "like", userId: n.userId, postId: n.postId || null,
      at: n.at || Date.now(), text: n.text || "", read: !!n.read,
      thumb: n.thumb || ""
    };
    state.notifications.unshift(item);
    persist(); emit("notify:" + item.id);
    return item;
  }

  function markStorySeen(storyUserId, itemId) {
    var st = storiesFor(storyUserId);
    if (!st) return;
    if (st.seen.indexOf(itemId) === -1) {
      st.seen.push(itemId);
      persist(); emit("story-seen:" + storyUserId);
    }
  }

  function addPost(opts) {
    var p = {
      id: uid("p"),
      userId: state.meId,
      kind: opts.kind || "post",
      src: opts.src,
      alt: opts.alt || "Yeni gönderi",
      caption: opts.caption || "",
      location: opts.location || "",
      at: Date.now(),
      likesBase: 0, liked: false, saved: false,
      comments: [], atUsers: opts.atUsers || [],
      audio: opts.audio || "", archived: false
    };
    state.posts.unshift(p);
    persist(true); emit("post-add:" + p.id);
    return p;
  }

  function deletePost(postId) {
    state.posts = state.posts.filter(function (p) { return p.id !== postId; });
    state.saved = state.saved.filter(function (id) { return id !== postId; });
    persist(); emit("post-delete:" + postId);
  }

  function toggleArchive(postId, value) {
    var p = post(postId);
    if (!p) return;
    p.archived = typeof value === "boolean" ? value : !p.archived;
    persist(); emit("post-archive:" + postId);
  }

  function sendMessage(chatId, text) {
    var ch = chat(chatId);
    if (!ch || !text || !text.trim()) return null;
    var m = { id: uid("m"), from: state.meId, text: text.trim(), at: Date.now(), seen: true };
    ch.messages.push(m);
    ch.unread = 0;
    persist(); emit("message:" + chatId);
    return m;
  }

  /** Karşı taraftan otomatik yanıt (gerçekçi demo davranışı). */
  function receiveMessage(chatId, text) {
    var ch = chat(chatId);
    if (!ch) return null;
    var m = { id: uid("m"), from: ch.userId, text: text, at: Date.now(), seen: false };
    ch.messages.push(m);
    if (!isChatOpen(chatId)) ch.unread = (ch.unread || 0) + 1;
    persist(); emit("message:" + chatId);
    return m;
  }

  var openChatId = null;
  function setOpenChat(id) { openChatId = id; }
  function isChatOpen(id) { return openChatId === id; }

  function markChatRead(chatId) {
    var ch = chat(chatId);
    if (!ch) return;
    ch.unread = 0;
    ch.messages.forEach(function (m) { m.seen = true; });
    persist(); emit("chat-read:" + chatId);
  }

  function markNotificationsRead() {
    state.notifications.forEach(function (n) { n.read = true; });
    persist(); emit("notifications-read");
  }

  function clearNotifications() {
    state.notifications = [];
    persist(); emit("notifications-clear");
  }

  function updateProfile(fields) {
    var u = me();
    if (!u) return;
    if (fields.name) u.name = fields.name;
    if (fields.username) u.username = fields.username.toLowerCase().replace(/[^a-z0-9._]/g, "");
    if (typeof fields.bio === "string") u.bio = fields.bio;
    if (typeof fields.link === "string") u.link = fields.link;
    if (fields.avatar) u.avatar = fields.avatar;
    persist(); emit("profile-update");
    return u;
  }

  function setTheme(theme) {
    state.settings.theme = theme === "light" ? "light" : "dark";
    persist(); emit("theme:" + state.settings.theme);
  }

  function toggleTheme() {
    setTheme(state.settings.theme === "dark" ? "light" : "dark");
    return state.settings.theme;
  }

  function setSetting(key, value) {
    state.settings[key] = value;
    persist(); emit("setting:" + key);
  }

  function searchUsers(q) {
    q = (q || "").toLowerCase().trim().replace(/^@/, "");
    if (!q) return [];
    var scored = state.users.filter(function (u) {
      if (u.id === state.meId) return false;
      return u.username.toLowerCase().indexOf(q) !== -1 || u.name.toLowerCase().indexOf(q) !== -1;
    });
    scored.sort(function (a, b) {
      var ai = a.username.toLowerCase().indexOf(q) === 0 ? 0 : 1;
      var bi = b.username.toLowerCase().indexOf(q) === 0 ? 0 : 1;
      if (ai !== bi) return ai - bi;
      return b.followersBase - a.followersBase;
    });
    return scored.slice(0, 20);
  }

  function searchHashtags(q) {
    q = (q || "").toLowerCase().trim().replace(/^#/, "");
    if (!q) return [];
    return state.hashtags.filter(function (h) { return h.tag.indexOf(q) !== -1; });
  }

  function reset() {
    state = seed();
    persist(true);
    emit("reset");
  }

  /** Dışa aktarılmış bir JSON yedeğini geri yükler (profilini başka cihaza taşımak için). */
  function importState(obj) {
    if (!obj || !obj.users || !obj.posts || !obj.follows || !obj.chats) return false;
    if (!obj.meId) return false;
    obj.version = 2;
    state = obj;
    persist(true);
    emit("import");
    return true;
  }

  function stats() {
    return {
      posts: state.posts.filter(function (p) { return p.userId === state.meId; }).length,
      saved: state.saved.length,
      following: (state.follows[state.meId] || []).length,
      notifications: state.notifications.length
    };
  }

  /* ------------------------------------------------------------------ */
  /* Başlatma                                                            */
  /* ------------------------------------------------------------------ */
  var Store = {
    init: function () {
      state = load();
      if (!state) { state = seed(); persist(true); }
      return state;
    },
    subscribe: function (fn) { listeners.push(fn); return function () { Store.unsubscribe(fn); }; },
    unsubscribe: function (fn) { listeners = listeners.filter(function (l) { return l !== fn; }); },
    get state() { return state; },
    get meId() { return state.meId; },
    get follows() { return state.follows; },
    get saved() { return state.saved; },
    get settings() { return state.settings; },
    me: me, user: user, userByUsername: userByUsername, post: post, chat: chat,
    isFollowing: isFollowing, followersCount: followersCount, followingCount: followingCount,
    followCount: followsCount,
    postsOf: postsOf, postCount: postCount, feed: feed, reels: reels, reelsOf: reelsOf,
    explore: explore, savedPosts: savedPosts, taggedPosts: taggedPosts,
    likedCount: likedCount, commentsCount: commentsCount,
    storiesFor: storiesFor, storySeen: storySeen, unseenCount: unseenCount, storyBar: storyBar,
    notifications: notifications, unreadNotifications: unreadNotifications,
    chats: chats, lastMessage: lastMessage, lastMessageAt: lastMessageAt, unreadMessages: unreadMessages,
    friendsWhoLiked: friendsWhoLiked,
    toggleLike: toggleLike, toggleSave: toggleSave,
    addComment: addComment, toggleCommentLike: toggleCommentLike, deleteComment: deleteComment,
    toggleFollow: toggleFollow, markStorySeen: markStorySeen, notify: notify,
    addPost: addPost, deletePost: deletePost, toggleArchive: toggleArchive,
    sendMessage: sendMessage, receiveMessage: receiveMessage,
    setOpenChat: setOpenChat, isChatOpen: isChatOpen, markChatRead: markChatRead,
    markNotificationsRead: markNotificationsRead, clearNotifications: clearNotifications,
    updateProfile: updateProfile, setTheme: setTheme, toggleTheme: toggleTheme, setSetting: setSetting,
    searchUsers: searchUsers, searchHashtags: searchHashtags,
    reset: reset, stats: stats, persist: persist, uid: uid, clone: clone,
    importState: importState
  };

  IG.Store = Store;
})(window.IG);
