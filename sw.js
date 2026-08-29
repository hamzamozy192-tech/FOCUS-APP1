/* FOCUS service worker - offline support (all assets are local, no internet needed) */
var CACHE = "focus-cache-v6";

var ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-32.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./assets/img/intro.png",
  "./assets/img/logo.png",
  "./assets/audio/focus.mp3",
  "./assets/audio/alarm.mp3",
  "./assets/audio/rain.mp3",
  "./assets/audio/wind.mp3",
  "./assets/audio/storm.mp3",
  "./assets/audio/keyboard.mp3",
  "./assets/audio/pen.mp3",
  "./assets/audio/book.mp3",
  "./assets/audio/ocean.mp3",
  "./assets/audio/night.mp3",
  "./assets/audio/fire.mp3",
  "./assets/audio/cafe.mp3",
  "./assets/audio/chimes.mp3"
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
