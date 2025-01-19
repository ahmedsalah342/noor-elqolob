// وظائف مواقيت الصلاة
function getPrayerTimes() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async function(position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            
            try {
                const response = await fetch(`https://api.aladhan.com/v1/timings/${new Date().getTime() / 1000}?latitude=${latitude}&longitude=${longitude}&method=4`);
                const data = await response.json();
                
                if (data && data.data && data.data.timings) {
                    const timings = data.data.timings;
                    document.getElementById('fajrTime').textContent = timings.Fajr;
                    document.getElementById('sunriseTime').textContent = timings.Sunrise;
                    document.getElementById('dhuhrTime').textContent = timings.Dhuhr;
                    document.getElementById('asrTime').textContent = timings.Asr;
                    document.getElementById('maghribTime').textContent = timings.Maghrib;
                    document.getElementById('ishaTime').textContent = timings.Isha;
                    
                    // حفظ المواقيت في التخزين المحلي
                    localStorage.setItem('prayerTimes', JSON.stringify({
                        timings: data.data.timings,
                        timestamp: new Date().getTime()
                    }));
                }
            } catch (error) {
                console.error('خطأ في جلب مواقيت الصلاة:', error);
                // استخدام المواقيت المخزنة محلياً في حالة الخطأ
                const savedTimes = localStorage.getItem('prayerTimes');
                if (savedTimes) {
                    const { timings } = JSON.parse(savedTimes);
                    document.getElementById('fajrTime').textContent = timings.Fajr;
                    document.getElementById('sunriseTime').textContent = timings.Sunrise;
                    document.getElementById('dhuhrTime').textContent = timings.Dhuhr;
                    document.getElementById('asrTime').textContent = timings.Asr;
                    document.getElementById('maghribTime').textContent = timings.Maghrib;
                    document.getElementById('ishaTime').textContent = timings.Isha;
                }
            }
        }, function(error) {
            console.error('خطأ في تحديد الموقع:', error);
            // استخدام المواقيت المخزنة محلياً في حالة الخطأ
            const savedTimes = localStorage.getItem('prayerTimes');
            if (savedTimes) {
                const { timings } = JSON.parse(savedTimes);
                document.getElementById('fajrTime').textContent = timings.Fajr;
                document.getElementById('sunriseTime').textContent = timings.Sunrise;
                document.getElementById('dhuhrTime').textContent = timings.Dhuhr;
                document.getElementById('asrTime').textContent = timings.Asr;
                document.getElementById('maghribTime').textContent = timings.Maghrib;
                document.getElementById('ishaTime').textContent = timings.Isha;
            }
        });
    }
}

// وظائف اتجاه القبلة
function getQiblaDirection() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            
            // حساب اتجاه القبلة (مكة المكرمة)
            const makkahLat = 21.422487;
            const makkahLng = 39.826206;
            
            // حساب الاتجاه والمسافة
            const qiblaAngle = calculateQiblaAngle(latitude, longitude, makkahLat, makkahLng);
            const distance = calculateDistance(latitude, longitude, makkahLat, makkahLng);
            
            // تحديث واجهة المستخدم
            document.getElementById('qiblaDirection').textContent = Math.round(qiblaAngle) + '°';
            document.getElementById('qiblaDistance').textContent = Math.round(distance) + ' كم';
            
            // تدوير سهم البوصلة
            const arrow = document.getElementById('qiblaArrow');
            if (arrow) {
                arrow.style.transform = `rotate(${qiblaAngle}deg)`;
            }
        });
    }
}

// وظيفة حساب زاوية القبلة
function calculateQiblaAngle(lat1, lon1, lat2, lon2) {
    // تحويل الإحداثيات إلى راديان
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    // حساب اتجاه القبلة
    const y = Math.sin(Δλ);
    const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ);
    let qiblaAngle = Math.atan2(y, x) * 180 / Math.PI;
    
    // تحويل الزاوية إلى درجات موجبة
    return (qiblaAngle + 360) % 360;
}

// وظيفة حساب المسافة
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // نصف قطر الأرض بالكيلومتر
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
             Math.cos(φ1) * Math.cos(φ2) *
             Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}

// تحديث الساعة
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const timeString = `${hours}:${minutes}:${seconds}`;
    document.getElementById('currentTime').textContent = timeString;
}

// تحديث الساعة كل ثانية
setInterval(updateClock, 1000);

// مواقيت الصلاة الثابتة (يمكن تحديثها لاحقاً من API)
const prayerTimes = {
    fajr: '05:15',
    sunrise: '06:45',
    dhuhr: '12:10',
    asr: '15:20',
    maghrib: '17:40',
    isha: '19:10'
};

// تهيئة مواقيت الصلاة
function initializePrayerTimes() {
    // تحديث العناصر في الصفحة
    document.getElementById('fajr-time').textContent = prayerTimes.fajr;
    document.getElementById('sunrise-time').textContent = prayerTimes.sunrise;
    document.getElementById('dhuhr-time').textContent = prayerTimes.dhuhr;
    document.getElementById('asr-time').textContent = prayerTimes.asr;
    document.getElementById('maghrib-time').textContent = prayerTimes.maghrib;
    document.getElementById('isha-time').textContent = prayerTimes.isha;
}

// تحديث الوقت الحالي
function updateCurrentTime() {
    const timeElement = document.getElementById('current-time');
    const dateElement = document.getElementById('current-date');
    
    // تنسيق الوقت (09:08)
    timeElement.textContent = '09:08';
    
    // تنسيق التاريخ (9 يناير 2025)
    dateElement.textContent = '9 يناير 2025';
}

// تحديث الصلاة النشطة
function updateActivePrayer() {
    const currentTime = '09:08';
    const [currentHour, currentMinute] = currentTime.split(':').map(Number);
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    const prayers = document.querySelectorAll('.prayer-card');
    let nextPrayerFound = false;

    prayers.forEach(prayer => {
        const timeElement = prayer.querySelector('.prayer-time');
        const [prayerHour, prayerMinute] = timeElement.textContent.split(':').map(Number);
        const prayerTotalMinutes = prayerHour * 60 + prayerMinute;

        prayer.classList.remove('active');
        
        if (!nextPrayerFound && prayerTotalMinutes > currentTotalMinutes) {
            prayer.classList.add('active');
            nextPrayerFound = true;
        }
    });
}

// إعداد المؤذن
function setupAdhanSettings() {
    const muezzinSelect = document.getElementById('muezzin-select');
    const notificationToggle = document.getElementById('notification-toggle');
    const minutesBeforeElement = document.getElementById('minutes-before');
    
    // زيادة الدقائق
    document.getElementById('increase-minutes').addEventListener('click', () => {
        let value = parseInt(minutesBeforeElement.textContent);
        if (value < 30) {
            minutesBeforeElement.textContent = value + 1;
        }
    });
    
    // إنقاص الدقائق
    document.getElementById('decrease-minutes').addEventListener('click', () => {
        let value = parseInt(minutesBeforeElement.textContent);
        if (value > 0) {
            minutesBeforeElement.textContent = value - 1;
        }
    });
    
    // تغيير المؤذن
    muezzinSelect.addEventListener('change', (e) => {
        localStorage.setItem('selectedMuezzin', e.target.value);
    });
    
    // تفعيل/تعطيل الإشعارات
    notificationToggle.addEventListener('change', (e) => {
        localStorage.setItem('notificationsEnabled', e.target.checked);
        if (e.target.checked && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    });
}

// تهيئة كل الوظائف
function initializePrayerFeatures() {
    initializePrayerTimes();
    updateCurrentTime();
    updateActivePrayer();
    setupAdhanSettings();
}

// تحديث مواقيت الصلاة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    updateClock();
    getPrayerTimes();
    initializePrayerFeatures();
    
    // إضافة مستمعي الأحداث لأزرار الإغلاق
    document.querySelectorAll('.close-modal, .close-btn, .close-button').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal, .settings-modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
});
