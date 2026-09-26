var CACHE_NAME = "shahrdari-arak-v92" // 6.9.68-mod1: 🧩 جداسازیِ ۱۳ بلوکِ اسکریپتِ درون‌خطی به فایل‌هایِ جداگانه (part01..13.js) — بدونِ تغییرِ منطق، فقط ساختار (فازِ ۱، مرحلهٔ ۲) // 6.9.65: 🔐 حذفِ رمزِ خوانا از بکاپ + 🔢 برابریِ رقم‌ها (ورکر ۶.۹.۶۵) // 6.9.64: 🔒 سفت‌کاریِ خواندنِ بی‌نام + 🐌 صبرِ کشیدنِ بسته‌هایِ درشت (ورکر ۶.۹.۶۴) // 6.9.63: 🧾 دفترچهٔ رویدادِ دستگاه + 🆘 رفعِ قفلی (فقط سایت — ورکر دست‌نخورده) // 6.9.62: 🩺 دکمهٔ «چک‌آپ» در تنظیمات (فقط سایت — ورکر دست‌نخورده) // 6.9.61: 🛟 تورِ نجاتِ کاربرها (عکسِ روزانه + بازگردانی) // 6.9.60: 📤 صبرِ مسیرِ ارسال + صف/کدِ وضعیت + دکمهٔ «ارسالِ همین حالا» // 6.9.59: 📊 نمایِ مصرفِ AI (usage.html/usage.js) + ورکرِ ۶.۹.۵۹ // 6.9.58: 🔧 بوت‌استرپ // 6.9.57: 🔄 به‌روزرسانیِ خودکار // 6.9.54: 🎨 رندرِ طرح روی عکسِ واقعی (طرحِ پولی) // 6.9.53: 🧬 DNA عملیات + 📷 ویژن روی صفحه پارامحور // 6.9.52: 🔐 طرحِ هوش مصنوعی رایگان/پولی // 6.9.51: ویژن روی داشبوردِ مدیر اجرایی و ناظر فنی // 6.9.50: عکسِ نمونهٔ AI برای طرح‌ها // 6.9.49: طرح‌های پیشنهادیِ قابلِ اجرا در تحلیل عکس // 6.9.43: ۱۳ موردِ مصوب (چاپ‌ها/امضا و علت/دستیار/گشت→دستور/درخواست→دستور/نقشه/دوربین) // 6.9.42: هشدار تکراریِ شکایت + توضیح کلامیِ نمرهٔ ترکیبی // 6.9.41 // 6.9.37: ذخیرهٔ اختیاریِ پرسش‌وپاسخِ دستیار (📌/️) // 6.9.34: دستیار هوشمند عملیات شهری (دموی محلی + endpoint /api/ai) // 6.9.33: صفحهٔ قرمز (کرش حرارتی) + چارت زندهٔ دسته‌ها + دکمهٔ نظر ناظر + تمیزکاری نوار نقشه // 6.9.32: داشبوردهای نقش‌محور + صفحه اصلی زنده + خروج یک‌تکه + نقشه راهنما // 6.9.28: چیدمان Field First + بستهٔ آراستن + PDF سربرگ‌دار آفلاین (jsPDF + Vazirmatn) // 6.9.27: طرح پیشنهادی از عکس // 6.9.24: GIS میدانی (مرز مناطق GeoJSON/KML + اندازه‌گیری متراژ + منطقه خودکار با GPS) // 6.9.15: دکمهٔ خروج کوچک‌تر + پیام «خروج موفق» // 6.9.14: دکمهٔ خروج خوانا + بستن خودکار نشست; // v6.9.10: سخت‌سازی امنیتی + لاگ ورود ناموفق + بک‌آپ کامل + حریم خصوصی + _headers + ورکر امن | v6.9.9: صدای یادآور به IDB + حذف گروهی | v6.8.2: فیکس آفلاین
// 6.9.20: کتابخانهٔ نقشه هم داخل پری‌کش است (نقشه حتی در اولین اجرای آفلاین بالا می‌آید)
var APP_SHELL = ["index.html", "public-intake.html", "usage.html", "usage.js", "manifest.json", "icon-192.png", "icon-512.png", "cloud-sync.js", "sw.js", "leaflet.css", "leaflet.js", "leaflet-heat.js", "fonts/Vazirmatn-Regular.ttf", "fonts/Vazirmatn-Bold.ttf", "part01.js", "part02.js", "part03.js", "part04.js", "part05.js", "part06.js", "part07.js", "part08.js", "part09.js", "part10.js", "part11.js", "part12.js", "part13.js"]; // 6.9.28: فونت‌های PDF آفلاین
/* 6.9.20: کش پایدار تایل‌های نقشه — عمداً با بامپ نسخهٔ برنامه پاک نمی‌شود تا نقشه‌ای که
   یک بار دیده شده، در به‌روزرسانی‌های بعدی هم بدون اینترنت/فیلترشکن کار کند (رفع مشکل «قبلاً باز می‌شد»). */
var TILE_CACHE_NAME = "map-tiles-v1";
var TILE_HOSTS = ["basemaps.cartocdn.com", "tile.openstreetmap.org", "arcgisonline.com"];
function isMapTile(req) {
  try { var u = new URL(req.url); return TILE_HOSTS.some(function (h) { return u.host.indexOf(h) !== -1; }); }
  catch (e) { return false; }
}
function trimTileCache(cache) { // سقف حجم: نگه‌داشتن حداکثر ~۱۵۰۰ تایل
  cache.keys().then(function (keys) {
    if (keys.length > 1500) {
      for (var i = 0; i < 150; i++) cache.delete(keys[i]);
    }
  }).catch(function () {});
}
// درخواست‌هایی که به سرور سینک (Cloudflare Worker) می‌روند هرگز نباید کش شوند —
// این‌ها همیشه باید تازه‌ترین داده‌ی سرور را بدهند، وگرنه سینک یک‌طرفه/کند به‌نظر می‌رسد.
var WORKER_HOST = "ops-sync.shahpanahhasan09.workers.dev";

self.addEventListener("install", function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL);
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

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;

  // درخواست به سرور سینک: همیشه مستقیم از شبکه (Network-only)، هرگز کش نشود
  if (req.url.indexOf(WORKER_HOST) !== -1) {
    e.respondWith(fetch(req, { cache: "no-store" }));
    return;
  }

  // نکته‌ی مهم: وقتی کاربر مستقیم آدرس پوشه (مثل .../ops/) رو باز می‌کنه، درخواست شامل
  // کلمه‌ی "index.html" نیست، پس باید حالت ناوبری (mode:"navigate") رو هم جدا تشخیص بدیم
  // وگرنه همین یک مورد باعث می‌شد نسخه‌ی جدید هیچ‌وقت واقعاً از شبکه گرفته نشه.
  var isShell = req.mode === "navigate" || APP_SHELL.some(function (name) { return req.url.indexOf(name) !== -1; });

  if (isShell) {
    // Network-first for the app itself: always try to get the latest version when online,
    // so updates you upload to GitHub show up immediately. Falls back to the cached copy
    // only when there's no internet connection.
    e.respondWith(
      fetch(req, { cache: "no-store" }).then(function (res) {
        var resClone = res.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(req, resClone); });
        return res;
      }).catch(function () {
        // آفلاین: ۱) دقیقاً همین درخواست (با نادیده‌گرفتن پیراپیشا مثل ?v=2 تا سوال‌مارک‌های
        // چک نسخه/کوئری به خطا نخورند) ۲) اگر ناوبریه و پیدا نشد (مثل باز کردن آدرس ریشه)،
        // صفحه‌ی اصلی کش‌شده را بده تا برنامه همیشه، حتی بدون اینترنت، بالا بیاید.
        return caches.match(req, { ignoreSearch: true }).then(function (m) {
          if (m) return m;
          if (req.mode === "navigate") {
            return caches.match(new Request(new URL("index.html", self.registration.scope).toString()));
          }
          return m;
        });
      })
    );
    return;
  }

  // 6.9.20: تایل نقشه → cache-first از کش پایدار (با آپدیت نسخه نمی‌میرد)؛
  // اگر کش نبود از شبکه می‌آید و برای همیشه در کش پایدار ذخیره می‌شود.
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

  // Cache-first for everything else (external map libraries, etc.)
  e.respondWith(
    caches.match(req).then(function (cached) {
      return cached || fetch(req).then(function (res) {
        var resClone = res.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(req, resClone); });
        return res;
      }).catch(function () { return cached; });
    })
  );
});
