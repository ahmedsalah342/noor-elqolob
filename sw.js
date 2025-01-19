const CACHE_NAME = 'zad-muslim-v1';
const urlsToCache = [
    './',
    './index.html',
    './css/style.css',
    './css/qibla.css',
    './css/prayer_times.css',
    './css/dark-mode.css',
    './css/modal.css',
    './css/settings.css',
    './css/quran.css',
    './css/ruqya.css',
    './css/about.css',
    './css/seerah.css',
    './css/companions.css',
    './css/scholars.css',
    './css/prophets.css',
    './css/mulk.css',
    './css/kahf.css',
    './js/script.js',
    './js/qibla.js',
    './js/prayer_times.js',
    './js/dark_mode.js',
    './js/settings.js',
    './js/notifications.js',
    './icons/icon-72x72.png',
    './icons/icon-96x96.png',
    './icons/icon-128x128.png',
    './icons/icon-144x144.png',
    './icons/icon-152x152.png',
    './icons/icon-192x192.png',
    './icons/icon-384x384.png',
    './icons/icon-512x512.png',
    './manifest.json'
];

// تثبيت Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// استخدام الملفات المخزنة
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // إذا وجد الملف في التخزين المؤقت، استخدمه
                if (response) {
                    return response;
                }

                // إذا لم يوجد، حاول جلبه من الإنترنت
                return fetch(event.request)
                    .then(response => {
                        // تأكد من أن الاستجابة صحيحة
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // انسخ الاستجابة لأن الاستجابة يمكن استخدامها مرة واحدة فقط
                        const responseToCache = response.clone();

                        // أضف الملف إلى التخزين المؤقت
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    });
            })
    );
});

// تحديث Service Worker
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
