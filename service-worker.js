// تخزين مؤقت للموارد الأساسية
const CACHE_NAME = 'zad-muslim-v1';
const RESOURCES_TO_CACHE = [
    '/',
    '/index.html',
    '/css/style.css',
    '/css/app.css',
    '/css/prayer_times.css',
    '/css/modal_styles.css',
    '/css/qibla.css',
    '/css/settings.css',
    '/js/app.js',
    '/js/prayer-notifications.js',
    '/js/settings.js',
    '/js/language-manager.js',
    '/audio/azan.mp3',
    '/audio/notification.mp3',
    '/icons/notification-icon.png',
    '/icons/badge-icon.png'
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(RESOURCES_TO_CACHE);
        })
    );
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// التعامل مع التنبيهات
self.addEventListener('push', (event) => {
    const options = {
        body: event.data.text(),
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        vibrate: [200, 100, 200],
        tag: 'prayer-notification',
        renotify: true
    };

    event.waitUntil(
        self.registration.showNotification('موعد الصلاة', options)
    );
});

// التعامل مع النقر على التنبيه
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});

// استقبال رسائل من التطبيق
self.addEventListener('message', (event) => {
    if (event.data.type === 'PRAYER_TIME') {
        // تشغيل الأذان
        event.waitUntil(
            clients.matchAll().then((clients) => {
                clients.forEach((client) => {
                    client.postMessage({
                        type: 'PLAY_AZAN',
                        prayerName: event.data.prayerName
                    });
                });
            })
        );
    }
});

// التعامل مع طلبات الشبكة
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // إذا وجد الملف في التخزين المؤقت، أعده
                if (response) {
                    return response;
                }

                // إذا لم يوجد، حاول جلبه من الشبكة
                return fetch(event.request)
                    .then((response) => {
                        // تأكد من أن الاستجابة صالحة
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // انسخ الاستجابة لتخزينها
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // إذا فشل الطلب وكان طلب صفحة
                        if (event.request.mode === 'navigate') {
                            return caches.match('/offline.html');
                        }
                        
                        // إذا كان طلب صورة، أعد صورة بديلة
                        if (event.request.destination === 'image') {
                            return caches.match('/images/offline-image.png');
                        }
                    });
            })
    );
});
