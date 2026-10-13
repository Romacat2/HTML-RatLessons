const CACHE_NAME = "rat-games-v2";

const ASSETS = [
  "./",
  "index.html",
  "style.css",
  "nav.js",
  "manifest.json",

  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-192.png",
  "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png",
  "favicon.png",

  "multiplication/index.html",
  "multiplication/test.html",
  "multiplication/test.js",
  "multiplication/result.html",
  "multiplication/404.html",
  "multiplication/favicon.png",

  "lessons/index.html",
  "lessons/editor.html",
  "lessons/test.html",
  "lessons/test.js",
  "lessons/result.html",
  "lessons/lessons.js",
  "lessons/favicon.png",

  "spelling/index.html",
  "spelling/editor.html",
  "spelling/test.html",
  "spelling/test.js",
  "spelling/result.html",
  "spelling/lessons.js",
  "spelling/favicon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic")
            return response;
          const clone = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          if (event.request.mode === "navigate")
            return caches.match("index.html");
        });
    }),
  );
});
