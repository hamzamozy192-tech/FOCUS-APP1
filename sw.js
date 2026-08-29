/* FOCUS service worker - offline support (all assets are local, no internet needed) */
var CACHE = "focus-cache-v6";

var ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "icon-32.png",
  "icon-192.png",
  "icon-512.png",
  "apple-touch-icon.png",
  "intro.png",
  "logo.png",
  "focus.mp3",
  "alarm.mp3",
  "rain.mp3",
  "wind.mp3",
  "storm.mp3",
  "keyboard.mp3",
  "pen.mp3",
  "book.mp3",
  "ocean.mp3",
  "night.mp3",
  "fire.mp3",
  "cafe.mp3",
  "chimes.mp3"
];

self.addEventListener("install", function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      // cache assets individually so one failure doesn't abort the whole install
      return Promise.all(
        ASSETS.map(function (url) {
          return c.add(new Request(url)).catch(function () {});
        })
      );
    })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (k) { if (k !== CACHE) return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      if (cached) return cached;
      return fetch(e.request).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); }).catch(function () {});
        return res;
      }).catch(function () {
        return cached;
      });
    })
  );
});
