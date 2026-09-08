const CACHE_NAME = "pwa-cache-v6-lien";
const CORE_ASSETS = [
  "/",
  "/lien-logo.png",
  "/favicon.ico",
  "/manifest.json?v=20260908-lien",
  "/icon.png?v=20260908-lien",
  "/apple-icon.png?v=20260908-lien",
  "/icon-192.png?v=20260908-lien",
  "/icon-512.png?v=20260908-lien",
  "/icon-512-maskable.png?v=20260908-lien",
  "/icon-180.png?v=20260908-lien"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  const accept = event.request.headers.get("accept") || "";
  const isNavigation = event.request.mode === "navigate" || accept.includes("text/html");

  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (
            response &&
            response.ok &&
            response.status === 200 &&
            response.type === "basic" &&
            url.origin === self.location.origin
          ) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (
            response &&
            response.ok &&
            response.status === 200 &&
            response.type === "basic" &&
            url.origin === self.location.origin
          ) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    }),
  );
});
