// إعدادات التنبيهات
const NOTIFICATION_SETTINGS = {
    BEFORE_PRAYER: 15, // دقائق قبل وقت الصلاة
    REMINDER_DELAY: 20, // دقائق بعد وقت الصلاة إذا لم يتم التأكيد
};

// أسماء الصلوات بالعربية
const PRAYER_NAMES = {
    fajr: 'الفجر',
    sunrise: 'الشروق',
    dhuhr: 'الظهر',
    asr: 'العصر',
    maghrib: 'المغرب',
    isha: 'العشاء'
};

// دالة لإنشاء التنبيهات
function createPrayerNotifications(prayerTimes) {
    // التأكد من دعم التنبيهات
    if (!("Notification" in window)) {
        console.log("هذا المتصفح لا يدعم التنبيهات");
        return;
    }

    // طلب إذن التنبيهات
    Notification.requestPermission().then(function(permission) {
        if (permission === "granted") {
            setupPrayerNotifications(prayerTimes);
        }
    });
}

// إعداد التنبيهات لكل صلاة
function setupPrayerNotifications(prayerTimes) {
    Object.entries(prayerTimes).forEach(([prayer, time]) => {
        if (prayer in PRAYER_NAMES) {
            const prayerTime = new Date(time);
            
            // تنبيه قبل وقت الصلاة
            const beforePrayerTime = new Date(prayerTime.getTime() - NOTIFICATION_SETTINGS.BEFORE_PRAYER * 60000);
            scheduleNotification(beforePrayerTime, `اقتربت صلاة ${PRAYER_NAMES[prayer]}`);
            
            // تنبيه عند دخول وقت الصلاة
            scheduleNotification(prayerTime, `حان الآن وقت صلاة ${PRAYER_NAMES[prayer]}`);
            
            // تنبيه تذكيري
            const reminderTime = new Date(prayerTime.getTime() + NOTIFICATION_SETTINGS.REMINDER_DELAY * 60000);
            scheduleNotification(reminderTime, `تذكير: هل صليت ${PRAYER_NAMES[prayer]}؟`);
        }
    });
}

// جدولة التنبيه
function scheduleNotification(time, message) {
    const now = new Date();
    if (time > now) {
        const delay = time.getTime() - now.getTime();
        setTimeout(() => {
            new Notification("نور القلوب", {
                body: message,
                icon: "/icons/icon-192x192.png",
                badge: "/icons/icon-72x72.png",
                vibrate: [200, 100, 200]
            });
        }, delay);
    }
}

// دالة لتحديث إعدادات التنبيهات
function updateNotificationSettings(settings) {
    Object.assign(NOTIFICATION_SETTINGS, settings);
}

// تصدير الدوال
export {
    createPrayerNotifications,
    updateNotificationSettings,
    NOTIFICATION_SETTINGS
};
