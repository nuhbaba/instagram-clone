/* ==========================================================================
   sw.js — Uygulama kabuğu önbelleği + uzak görseller için çalışma zamanı
   önbelleği. Amaç: çevrimdışıyken de arayüzün açılması.
   ========================================================================== */
const VERSION = "v1.5.0";
const SHELL_CACHE = `ig-shell-${VERSION}`;
const IMG_CACHE = `ig-img-${VERSION}`;

const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/styles.css",
  "./js/icons.js",
  "./js/data.js",
  "./js/store.js",
  "./js/components.js",
  "./js/app.js",
  "./icons/favicon-32.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn("[sw] kabuk önbelleği kurulamadı:", err))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== SHELL_CACHE && k !== IMG_CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

function isImageRequest(url) {
  return /picsum\.photos|pravatar\.cc|\.(png|jpe?g|webp|gif|svg)$/i.test(url);
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // Uygulama kabuğu: önce önbellek, sonra ağ (hızlı açılış)
  if (sameOrigin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req).then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        }).catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Uzak görseller: önce önbellek, arka planda tazele (stale-while-revalidate)
  if (isImageRequest(req.url)) {
    event.respondWith(
      caches.open(IMG_CACHE).then((cache) =>
        cache.match(req).then((cached) => {
          const fetched = fetch(req).then((res) => {
            if (res && res.ok) cache.put(req, res.clone());
            return res;
          }).catch(() => cached);
          return cached || fetched;
        })
      )
    );
    return;
  }

  // Diğer uzak istekler: ağ, hata olursa önbellek
  event.respondWith(fetch(req).catch(() => caches.match(req)));
});

self.addEventListener("message", (event) => {
  if (event.data === "skip-waiting") self.skipWaiting();
});
