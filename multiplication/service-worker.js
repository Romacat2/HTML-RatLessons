// Версію кешу підвищуй при кожному релізі зі зміненими файлами —
// це єдиний спосіб змусити SW підхопити нові версії файлів.
const CACHE_NAME = "rat-multiplication-v1";

// Шляхи відносні до розташування самого service-worker.js, тому коректно
// працюють і в корені домену, і в піддиректорії (напр. GitHub Pages
// username.github.io/repo-name/).
const ASSETS = [
  "./",
  "index.html",
  "test.html",
  "test.js",
  "result.html",
  "style.css",
  "../nav.js",
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-192.png",
  "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png",
  "favicon.png",
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
  // Кешуємо лише GET-запити того ж походження; усе інше йде напряму в мережу.
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }
          const responseClone = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => {
          // Офлайн і сторінки немає в кеші — показуємо хоча б головну,
          // щоб не ловити "сайт недоступний" на навігаційних запитах.
          if (event.request.mode === "navigate") {
            return caches.match("index.html");
          }
        });
    }),
  );
});
