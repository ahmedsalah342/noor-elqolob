// تخزين مؤقت للموارد الأساسية
const CACHE_NAME = 'zad-muslim-v1';
const RESOURCES_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/modal_styles.css',
    '/prayer_notifications.css',
    '/sounds/azan.mp3',
    '/sounds/notification.mp3'
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
