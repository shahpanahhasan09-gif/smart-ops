// 6.9.71: 🛟 بوتِ حافظه‌اول + تایم‌اوت شبکه + پری‌کش مقاوم + ماژول آب‌وهوا و گشت صوتی
var CACHE_NAME = "shahrdari-arak-v94";
var SW_VERSION = "6.9.71";
var TILE_CACHE_NAME = "map-tiles-v1";
var WORKER_HOST = "ops-sync.shahpanahhasan09.workers.dev";
var TILE_HOSTS = ["basemaps.cartocdn.com", "tile.openstreetmap.org", "arcgisonline.com"];
var SHELL_TIMEOUT_MS = 3500;

var APP_SHELL = ["index.html", "public-intake.html", "usage.html", "usage.js", "manifest.json", "icon-192.png", "icon-512.png", "cloud-sync.js", "sw.js", "leaflet.css", "leaflet.js", "leaflet-heat.js", "jspdf.umd.min.js", "fonts/Vazirmatn-Regular.ttf", "fonts/Vazirmatn-Bold.ttf"];

function isMapTile(req) {
  try { var u = new URL(req.url); return TILE_HOSTS.some(function (h) { return u.host.indexOf(h) !== -1; }); }
  catch (e) { return false; }
}

function trimTileCache(cache) {
  cache.keys().then(function (keys) {
    if (keys.length > 1500) {
      for (var i = 0; i < 150; i++) cache.delete(keys[i]);
    }
  }).catch(function () {});
}

function fetchWithTimeout(req, ms) {
  try {
    if (typeof AbortController === "undefined") return fetch(req, { cache: "no-store" });
    var ctl = new AbortController();
    var timer = setTimeout(function () { try { ctl.abort(); } catch (e) {} }, ms);
    return fetch(req, { cache: "no-store", signal: ctl.signal }).then(function (res) {
      clearTimeout(timer); return res;
    }, function (err) {
      clearTimeout(timer); throw err;
    });
  } catch (e) {
    return fetch(req, { cache: "no-store" });
  }
}

self.addEventListener("install", function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      var jobs = APP_SHELL.map(function (name) {
        return fetchWithTimeout(new Request(name, { cache: "no-store" }), 15000).then(function (res) {
          if (res && (res.ok || res.type === "opaque")) return cache.put(name, res);
          throw new Error("bad-response " + name);
        }).then(function () { return { name: name, ok: true }; }, function (err) {
          return { name: name, ok: false, err: String((err && err.message) || err) };
        });
      });
      return Promise.all(jobs);
    }).catch(function () {})
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME && k !== TILE_CACHE_NAME; }).map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

function handleShell(req) {
  return caches.match(req, { ignoreSearch: true }).then(function (cached) {
    var netP = fetchWithTimeout(req, SHELL_TIMEOUT_MS).then(function (res) {
      try {
        if (res && (res.ok || res.type === "opaque")) {
          var rc = res.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(req, rc); }).catch(function () {});
        }
      } catch (e) {}
      return res;
    }).catch(function () { return null; });
    if (cached) return cached;
    return netP.then(function (res) {
      if (res) return res;
      if (req.mode === "navigate") {
        return caches.match(new Request(new URL("index.html", self.registration.scope).toString())).then(function (m) {
          if (m) return m;
          return caches.match(req, { ignoreSearch: true });
        });
      }
      return caches.match(req, { ignoreSearch: true });
    });
  });
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;

  if (req.url.indexOf(WORKER_HOST) !== -1 || req.url.indexOf("api.open-meteo.com") !== -1) {
    e.respondWith(fetch(req, { cache: "no-store" }));
    return;
  }

  var isShell = req.mode === "navigate" || APP_SHELL.some(function (name) { return req.url.indexOf(name) !== -1; });
  if (isShell) {
    e.respondWith(handleShell(req));
    return;
  }

  if (isMapTile(req)) {
    e.respondWith(
      caches.open(TILE_CACHE_NAME).then(function (cache) {
        return cache.match(req).then(function (m) {
          if (m) return m;
          return fetch(req).then(function (res) {
            try { if (res && (res.ok || res.type === "opaque")) { var rc = res.clone(); cache.put(req, rc); trimTileCache(cache); } } catch (e2) {}
            return res;
          });
        });
      })
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(function (cached) {
      return cached || fetch(req).then(function (res) {
        try {
          if (res && (res.ok || res.type === "opaque")) {
            var resClone = res.clone();
            caches.open(CACHE_NAME).then(function (cache) { cache.put(req, resClone); }).catch(function () {});
          }
        } catch (e2) {}
        return res;
      }).catch(function () { return cached; });
    })
  );
});
