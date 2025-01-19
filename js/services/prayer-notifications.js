// التعامل مع تنبيهات الصلاة
class PrayerNotifications {
    constructor() {
        this.azanAudio = new Audio('sounds/azan.mp3');
        this.notificationAudio = new Audio('sounds/notification.mp3');
        this.serviceWorkerRegistration = null;
        this.initializeServiceWorker();
    }

    // تهيئة Service Worker
    async initializeServiceWorker() {
        try {
            if ('serviceWorker' in navigator) {
                this.serviceWorkerRegistration = await navigator.serviceWorker.register('./service-worker.js');
                console.log('Service Worker تم تسجيل');
                this.initializePushNotifications();
            }
        } catch (error) {
            console.error('خطأ في تسجيل Service Worker:', error);
        }
    }

    // تهيئة إشعارات Push
    async initializePushNotifications() {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('تم منح إذن الإشعارات');
            }
        } catch (error) {
            console.error('خطأ في طلب إذن الإشعارات:', error);
        }
    }

    // جدولة التنبيهات للصلوات
    schedulePrayerNotifications(prayerTimes) {
        for (const [prayer, time] of Object.entries(prayerTimes)) {
            const [hours, minutes] = time.split(':');
            const prayerTime = new Date();
            prayerTime.setHours(parseInt(hours));
            prayerTime.setMinutes(parseInt(minutes));
            prayerTime.setSeconds(0);

            // إذا كان الوقت قد مر، جدول لليوم التالي
            if (prayerTime < new Date()) {
                prayerTime.setDate(prayerTime.getDate() + 1);
            }

            const timeUntilPrayer = prayerTime.getTime() - new Date().getTime();
            
            // جدولة التنبيه
            setTimeout(() => {
                this.showPrayerNotification(prayer);
                this.playAzan();
            }, timeUntilPrayer);

            // جدولة تنبيه قبل الصلاة بـ 15 دقيقة
            if (timeUntilPrayer > 15 * 60 * 1000) {
                setTimeout(() => {
                    this.showPrePrayerNotification(prayer);
                }, timeUntilPrayer - (15 * 60 * 1000));
            }
        }
    }

    // عرض تنبيه الصلاة
    async showPrayerNotification(prayerName) {
        const prayerNames = {
            Fajr: 'الفجر',
            Sunrise: 'الشروق',
            Dhuhr: 'الظهر',
            Asr: 'العصر',
            Maghrib: 'المغرب',
            Isha: 'العشاء'
        };

        const options = {
            body: `حان الآن موعد صلاة ${prayerNames[prayerName]}`,
            icon: '/icons/notification-icon.png',
            badge: '/icons/badge-icon.png',
            vibrate: [200, 100, 200],
            tag: 'prayer-notification',
            renotify: true
        };

        if (this.serviceWorkerRegistration) {
            try {
                await this.serviceWorkerRegistration.showNotification('موعد الصلاة', options);
            } catch (error) {
                console.error('خطأ في عرض الإشعار:', error);
            }
        } else if ('Notification' in window) {
            new Notification('موعد الصلاة', options);
        }
    }

    // عرض تنبيه قبل الصلاة
    async showPrePrayerNotification(prayerName) {
        const prayerNames = {
            Fajr: 'الفجر',
            Sunrise: 'الشروق',
            Dhuhr: 'الظهر',
            Asr: 'العصر',
            Maghrib: 'المغرب',
            Isha: 'العشاء'
        };

        const options = {
            body: `باقي 15 دقيقة على صلاة ${prayerNames[prayerName]}`,
            icon: '/icons/notification-icon.png',
            badge: '/icons/badge-icon.png',
            vibrate: [100, 50, 100],
            tag: 'pre-prayer-notification',
            renotify: true
        };

        if (this.serviceWorkerRegistration) {
            try {
                await this.serviceWorkerRegistration.showNotification('تذكير بالصلاة', options);
                this.notificationAudio.play();
            } catch (error) {
                console.error('خطأ في عرض الإشعار:', error);
            }
        }
    }

    // تشغيل الأذان
    async playAzan() {
        try {
            await this.azanAudio.play();
        } catch (error) {
            console.error('خطأ في تشغيل الأذان:', error);
        }
    }

    // إيقاف الأذان
    stopAzan() {
        this.azanAudio.pause();
        this.azanAudio.currentTime = 0;
    }
}

// تصدير الكلاس
window.PrayerNotifications = PrayerNotifications;
