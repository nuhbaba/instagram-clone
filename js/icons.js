/* ==========================================================================
   icons.js — Instagram arayüzüne benzer SVG ikon seti
   Tüm ikonlar 24x24 viewBox'ta, currentColor ile renklenir.
   ========================================================================== */
window.IG = window.IG || {};

(function (IG) {
  "use strict";

  /** Doğrulanmış hesap rozeti için dalgalı (scalloped) yıldız yolu üretir. */
  function starburst(cx, cy, outer, inner, bumps) {
    var d = "";
    for (var i = 0; i < bumps * 2; i++) {
      var r = i % 2 ? inner : outer;
      var a = (Math.PI * i) / bumps - Math.PI / 2;
      d += (i ? "L" : "M") + (cx + r * Math.cos(a)).toFixed(2) + " " + (cy + r * Math.sin(a)).toFixed(2);
    }
    return d + "Z";
  }

  var S = 'stroke="currentColor" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  var SF = 'fill="currentColor" stroke="none"';
  var SO = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';

  var PATHS = {
    /* ---- gezinme ---- */
    home: '<path d="M3.2 10.6 12 3.3l8.8 7.3V20a1.2 1.2 0 0 1-1.2 1.2h-4.6v-6.1H9v6.1H4.4A1.2 1.2 0 0 1 3.2 20Z" ' + SO + "/>",
    homeFill: '<path d="M3.2 10.6 12 3.3l8.8 7.3V20a1.2 1.2 0 0 1-1.2 1.2h-5.3v-6.1H9.7v6.1H4.4A1.2 1.2 0 0 1 3.2 20Z" ' + SF + "/>",
    search: '<circle cx="10.8" cy="10.8" r="7.3" ' + SO + '/><path d="m16.3 16.3 4.4 4.4" ' + SO + "/>",
    reels: '<rect x="2.6" y="3.2" width="18.8" height="17.6" rx="4.4" ' + SO + '/>' +
      '<path d="M3 8.6h18" ' + SO + '/><path d="m8.4 3.6 3.4 5" ' + SO + '/><path d="m15 3.6 3.4 5" ' + SO + '/>' +
      '<path d="M10.6 12.2v5.2l4.6-2.6z" ' + SF + "/>",
    heart: '<path d="M12 20.4S3.4 15.6 3.4 9.6a4.7 4.7 0 0 1 8.6-2.6 4.7 4.7 0 0 1 8.6 2.6c0 6-8.6 10.8-8.6 10.8Z" ' + SO + "/>",
    heartFill: '<path d="M12 20.7S3.2 15.8 3.2 9.7a4.8 4.8 0 0 1 8.8-2.7 4.8 4.8 0 0 1 8.8 2.7c0 6.1-8.8 11-8.8 11Z" ' + SF + "/>",
    /* ---- üst çubuk ---- */
    plus: '<path d="M12 4.5v15M4.5 12h15" ' + SO + "/>",
    plusSquare: '<rect x="3.2" y="3.2" width="17.6" height="17.6" rx="4.6" ' + SO + '/><path d="M12 8.2v7.6M8.2 12h7.6" ' + SO + "/>",
    messenger: '<path d="M12 2.4c-5.5 0-9.8 3.9-9.8 9 0 2.8 1.3 5.3 3.5 7v3.2l3.2-1.8c.9.2 1.9.4 3 .4 5.6 0 9.9-4 9.9-9.1S17.6 2.4 12 2.4Zm1 12.4-2.6-2.7-4.9 2.7 5.5-5.8 2.6 2.7 4.8-2.7z" ' + SF + "/>",
    settings: '<circle cx="12" cy="12" r="3.1" ' + SO + '/><path d="M19.4 14.6a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.3a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-2.9-1.3l-.1.1a2 2 0 1 1-2.8-2.9l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.3-2.9l-.1-.1a2 2 0 1 1 2.9-2.8l.1.1a1.7 1.7 0 0 0 2.9-1.2V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 2.9 1.3l.1-.1a2 2 0 1 1 2.8 2.9l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.3a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1.3Z" ' + SO + "/>",
    /* ---- gönderi eylemleri ---- */
    comment: '<path d="M20.8 11.7c0 4.6-4 8.3-8.9 8.3a9.9 9.9 0 0 1-2.9-.4L3.4 21.4l1.6-4.7A8 8 0 0 1 3.2 11.7c0-4.6 3.9-8.3 8.8-8.3s8.8 3.7 8.8 8.3Z" ' + SO + "/>",
    share: '<path d="M21.6 3.1 2.9 10.3a.5.5 0 0 0 .04.94l7.3 2.4 2.4 7.3a.5.5 0 0 0 .94.04Z" ' + SO + '/><path d="M21.6 3.1 10.3 13.6" ' + SO + "/>",
    save: '<path d="M6 3.4h12a1.2 1.2 0 0 1 1.2 1.2v16.1l-7.2-4.6-7.2 4.6V4.6A1.2 1.2 0 0 1 6 3.4Z" ' + SO + "/>",
    saveFill: '<path d="M6 3.4h12a1.2 1.2 0 0 1 1.2 1.2v16.1l-7.2-4.6-7.2 4.6V4.6A1.2 1.2 0 0 1 6 3.4Z" ' + SF + "/>",
    more: '<circle cx="5.4" cy="12" r="1.7" ' + SF + '/><circle cx="12" cy="12" r="1.7" ' + SF + '/><circle cx="18.6" cy="12" r="1.7" ' + SF + "/>",
    menu: '<path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" ' + SO + "/>",
    /* ---- genel ---- */
    close: '<path d="M5.6 5.6 18.4 18.4M18.4 5.6 5.6 18.4" ' + SO + "/>",
    chevronLeft: '<path d="m14.5 4.5-7 7.5 7 7.5" ' + SO + "/>",
    chevronRight: '<path d="m9.5 4.5 7 7.5-7 7.5" ' + SO + "/>",
    chevronDown: '<path d="m4.5 9 7.5 7 7.5-7" ' + SO + "/>",
    arrowLeft: '<path d="M20 12H4.4" ' + SO + '/><path d="m10.6 5.4-6 6.6 6 6.6" ' + SO + "/>",
    camera: '<rect x="2.6" y="5.4" width="18.8" height="14.4" rx="3.4" ' + SO + '/><path d="M8.6 5.4 10 3.2h4l1.4 2.2" ' + SO + '/><circle cx="12" cy="12.6" r="3.9" ' + SO + "/>",
    video: '<rect x="2.6" y="5.2" width="13.4" height="13.6" rx="3.2" ' + SO + '/><path d="m16.4 12 5-3.4v6.8Z" ' + SO + "/>",
    grid: '<rect x="3.2" y="3.2" width="7.2" height="7.2" rx="1.4" ' + SO + '/><rect x="13.6" y="3.2" width="7.2" height="7.2" rx="1.4" ' + SO + '/><rect x="3.2" y="13.6" width="7.2" height="7.2" rx="1.4" ' + SO + '/><rect x="13.6" y="13.6" width="7.2" height="7.2" rx="1.4" ' + SO + "/>",
    bookmarkTab: '<path d="M6 3.4h12a1.2 1.2 0 0 1 1.2 1.2v16.1l-7.2-4.6-7.2 4.6V4.6A1.2 1.2 0 0 1 6 3.4Z" ' + SO + "/>",
    personTag: '<rect x="2.6" y="2.6" width="18.8" height="18.8" rx="4.6" ' + SO + '/><circle cx="12" cy="10" r="2.9" ' + SO + '/><path d="M6.8 19c.7-2.8 2.8-4.4 5.2-4.4s4.5 1.6 5.2 4.4" ' + SO + "/>",
    location: '<path d="M12 21.5s7-6.3 7-11.2a7 7 0 1 0-14 0c0 4.9 7 11.2 7 11.2Z" ' + SO + '/><circle cx="12" cy="10.2" r="2.6" ' + SO + "/>",
    music: '<path d="M9 18.4V6.2l10-2v12" ' + SO + '/><circle cx="6.6" cy="18.4" r="2.6" ' + SO + '/><circle cx="16.6" cy="16.2" r="2.6" ' + SO + "/>",
    smiley: '<circle cx="12" cy="12" r="9.2" ' + SO + '/><path d="M8.4 14.2a4.4 4.4 0 0 0 7.2 0" ' + SO + '/><circle cx="9" cy="9.6" r="1.1" ' + SF + '/><circle cx="15" cy="9.6" r="1.1" ' + SF + "/>",
    image: '<rect x="2.8" y="4.4" width="18.4" height="15.2" rx="3.2" ' + SO + '/><circle cx="8.6" cy="9.8" r="1.8" ' + SO + '/><path d="m3.6 17.6 5-4.6 4.2 3.8 3.2-2.8 4.4 4" ' + SO + "/>",
    sun: '<circle cx="12" cy="12" r="4.4" ' + SO + '/><path d="M12 1.8v2.4M12 19.8v2.4M4.4 4.4l1.7 1.7M17.9 17.9l1.7 1.7M1.8 12h2.4M19.8 12h2.4M4.4 19.6l1.7-1.7M17.9 6.1l1.7-1.7" ' + SO + "/>",
    moon: '<path d="M20.6 14.3A8.6 8.6 0 0 1 9.7 3.4a8.8 8.8 0 1 0 10.9 10.9Z" ' + SO + "/>",
    trash: '<path d="M4.4 6.6h15.2M9.6 6.6V4.4a1.1 1.1 0 0 1 1.1-1.1h2.6a1.1 1.1 0 0 1 1.1 1.1v2.2" ' + SO + '/><path d="M6.6 6.6 7.6 20a1.2 1.2 0 0 0 1.2 1.1h6.4A1.2 1.2 0 0 0 16.4 20l1-13.4" ' + SO + "/>",
    refresh: '<path d="M20.4 12a8.4 8.4 0 1 1-2.5-6" ' + SO + '/><path d="M20.6 3.4v5.2h-5.2" ' + SO + "/>",
    check: '<path d="m4.8 12.6 5 5 9.4-11" ' + SO + "/>",
    lock: '<rect x="4.6" y="10.4" width="14.8" height="10.4" rx="3" ' + SO + '/><path d="M8.4 10.4V7.8a3.6 3.6 0 0 1 7.2 0v2.6" ' + SO + "/>",
    info: '<circle cx="12" cy="12" r="9.2" ' + SO + '/><path d="M12 10.8v6" ' + SO + '/><circle cx="12" cy="7.6" r="1.2" ' + SF + "/>",
    download: '<path d="M12 3.4v11.2" ' + SO + '/><path d="m7.4 10.4 4.6 4.6 4.6-4.6" ' + SO + '/><path d="M4.6 19.6h14.8" ' + SO + "/>",
    upload: '<path d="M12 20.6V9.4" ' + SO + '/><path d="m7.4 13.6 4.6-4.6 4.6 4.6" ' + SO + '/><path d="M4.6 4.4h14.8" ' + SO + "/>",
    eye: '<path d="M2.4 12S6 5.8 12 5.8 21.6 12 21.6 12 18 18.2 12 18.2 2.4 12 2.4 12Z" ' + SO + '/><circle cx="12" cy="12" r="3.1" ' + SO + "/>",
    volume: '<path d="M11 5.4 6.6 9.2H3.4v5.6h3.2L11 18.6Z" ' + SO + '/><path d="M15 9.4a3.7 3.7 0 0 1 0 5.2" ' + SO + '/><path d="M17.8 7a7.4 7.4 0 0 1 0 10" ' + SO + "/>",
    mute: '<path d="M11 5.4 6.6 9.2H3.4v5.6h3.2L11 18.6Z" ' + SO + '/><path d="m15.4 9.8 5 4.4M20.4 9.8l-5 4.4" ' + SO + "/>",
    hash: '<path d="M9.4 3.6 7.6 20.4M16.4 3.6l-1.8 16.8M3.6 8.6h16.8M2.6 15.4h16.8" ' + SO + "/>",
    at: '<circle cx="12" cy="12" r="4.2" ' + SO + '/><path d="M16.2 8.4v5a2.8 2.8 0 0 0 5.2 1.3A9.4 9.4 0 1 0 18 20.4" ' + SO + "/>",
    text: '<path d="M4.6 6.4V4.6h14.8v1.8" ' + SO + '/><path d="M12 4.6v14.8" ' + SO + '/><path d="M9 19.4h6" ' + SO + "/>",
    filter: '<circle cx="9" cy="9" r="5.2" ' + SO + '/><circle cx="15" cy="15" r="5.2" ' + SO + "/>",
    sticker: '<rect x="3.2" y="3.2" width="17.6" height="17.6" rx="4.4" ' + SO + '/><path d="M15.4 20.8v-3.2a2.2 2.2 0 0 1 2.2-2.2h3.2" ' + SO + "/>",
    collage: '<rect x="3" y="3.4" width="18" height="17.2" rx="3" ' + SO + '/><path d="M12 3.4v17.2M3 12h18" ' + SO + "/>",
    gift: '<rect x="3" y="8.6" width="18" height="12.2" rx="2.4" ' + SO + '/><path d="M2.4 8.6h19.2M12 8.6v12.2" ' + SO + '/><path d="M12 8.6S10.6 3 8 3a2.6 2.6 0 0 0 0 5.6Zm0 0S13.4 3 16 3a2.6 2.6 0 0 1 0 5.6Z" ' + SO + "/>",
    clock: '<circle cx="12" cy="12" r="9" ' + SO + '/><path d="M12 6.8V12l3.6 2.2" ' + SO + "/>",
    bell: '<path d="M6 17.2V10a6 6 0 0 1 12 0v7.2l1.6 2.4H4.4Z" ' + SO + '/><path d="M10 19.6a2.1 2.1 0 0 0 4 0" ' + SO + "/>",
    thread: '<path d="M12.4 21.5c-5.6 0-9.4-3.7-9.4-9.5S6.8 2.5 12.3 2.5c4.4 0 7.6 2.3 8.6 6" ' + SO + '/><path d="M12 17.6c-2.9 0-4.7-1.6-4.7-4 0-2.3 1.8-3.8 4.3-3.8 3 0 4.6 1.9 4.6 5.2 0 3-1.2 4.6-2.9 4.6-1.1 0-1.8-.7-1.9-2.1-.4 1.3-1.3 2-2.4 2-1.3 0-2.1-.9-2.1-2.4 0-1.9 1.3-3.1 3.2-3.1.8 0 1.6.3 2.1.7" ' + SO + "/>",
    /* ---- hikâye oynatıcı ---- */
    play: '<path d="M7.5 4.8 19.4 12 7.5 19.2Z" ' + SF + "/>",
    pause: '<rect x="6.4" y="4.6" width="4.2" height="14.8" rx="1.4" ' + SF + '/><rect x="13.4" y="4.6" width="4.2" height="14.8" rx="1.4" ' + SF + "/>",
    flash: '<path d="M13.4 2.6 5 13.4h5.6l-1 8 8.4-10.8h-5.6Z" ' + SO + "/>"
  };

  /**
   * İkonu SVG olarak döndürür.
   * @param {string} name  PATHS anahtarı
   * @param {{size?:number, cls?:string, fill?:boolean, stroke?:number}} [opts]
   */
  function icon(name, opts) {
    opts = opts || {};
    var size = opts.size || 24;
    var body = PATHS[name];
    if (!body) body = PATHS.info;
    if (opts.stroke) body = body.replace(/stroke-width="[\d.]+"/g, 'stroke-width="' + opts.stroke + '"');
    var cls = "ic ic--" + name + (opts.cls ? " " + opts.cls : "");
    return '<svg class="' + cls + '" viewBox="0 0 24 24" width="' + size + '" height="' + size +
      '" aria-hidden="true" focusable="false">' + body + "</svg>";
  }

  /** Mavi doğrulama rozeti (dalgalı yıldız + beyaz tik). */
  function verified(size) {
    size = size || 13;
    var path = starburst(12, 12, 11.6, 10.1, 9);
    return '<svg class="ic ic--verified" viewBox="0 0 24 24" width="' + size + '" height="' + size +
      '" aria-label="Doğrulanmış hesap" role="img">' +
      '<path d="' + path + '" fill="#0095f6"/>' +
      '<path d="m8.1 12.4 2.7 2.7 5.2-6" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>' +
      "</svg>";
  }

  /** Instagram yazı markası (script görünümlü) */
  function wordmark() {
    return '<span class="wordmark">Instagram</span>';
  }

  IG.Icons = { icon: icon, verified: verified, wordmark: wordmark, PATHS: PATHS, starburst: starburst };
})(window.IG);
