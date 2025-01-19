// إعدادات تنبيهات الصلاة
let notificationSettings = {
    enabled: false,
    muezzin: 'tobar',
    timing: 0,
    latitude: null,
    longitude: null
};

// إعدادات الأذان والتنبيهات
let azanSettings = {
    enabled: false,
    muezzin: 'tobar',
    volume: 70,
    notificationTiming: 15
};

// قائمة المدن لكل دولة
const citiesData = {
    'EG': {
        'القاهرة': { lat: 30.0444, lng: 31.2357 },
        'الإسكندرية': { lat: 31.2001, lng: 29.9187 },
        'الجيزة': { lat: 30.0131, lng: 31.2089 },
        'شرم الشيخ': { lat: 27.9158, lng: 34.3300 },
        'الأقصر': { lat: 25.6872, lng: 32.6396 },
        'أسوان': { lat: 24.0889, lng: 32.8998 },
        'المنصورة': { lat: 31.0409, lng: 31.3785 },
        'طنطا': { lat: 30.7865, lng: 31.0004 },
        'الزقازيق': { lat: 30.5833, lng: 31.5167 },
        'بورسعيد': { lat: 31.2667, lng: 32.3000 }
    },
    'SA': {
        'مكة المكرمة': { lat: 21.3891, lng: 39.8579 },
        'المدينة المنورة': { lat: 24.5247, lng: 39.5692 },
        'الرياض': { lat: 24.7136, lng: 46.6753 },
        'جدة': { lat: 21.5433, lng: 39.1728 },
        'الدمام': { lat: 26.4207, lng: 50.0888 },
        'تبوك': { lat: 28.3835, lng: 36.5662 },
        'الطائف': { lat: 21.2667, lng: 40.4167 },
        'خميس مشيط': { lat: 18.3000, lng: 42.7333 }
    },
    'AE': {
        'دبي': { lat: 25.2048, lng: 55.2708 },
        'أبو ظبي': { lat: 24.4539, lng: 54.3773 },
        'الشارقة': { lat: 25.3463, lng: 55.4209 },
        'العين': { lat: 24.1302, lng: 55.8013 },
        'رأس الخيمة': { lat: 25.7895, lng: 55.9432 }
    },
    'KW': {
        'الكويت': { lat: 29.3759, lng: 47.9774 },
        'الجهراء': { lat: 29.3375, lng: 47.6581 },
        'حولي': { lat: 29.3375, lng: 48.0239 }
    },
    'QA': {
        'الدوحة': { lat: 25.2867, lng: 51.5333 },
        'الوكرة': { lat: 25.1715, lng: 51.6034 },
        'الخور': { lat: 25.6839, lng: 51.5058 }
    },
    'BH': {
        'المنامة': { lat: 26.2285, lng: 50.5860 },
        'المحرق': { lat: 26.2540, lng: 50.6119 },
        'الرفاع': { lat: 26.1167, lng: 50.5500 }
    },
    'OM': {
        'مسقط': { lat: 23.5859, lng: 58.4059 },
        'صلالة': { lat: 17.0175, lng: 54.0828 },
        'صحار': { lat: 24.3425, lng: 56.7467 }
    }
};

// عرض وإخفاء الأقسام
function showPrayerTimes() {
    hideAllSections();
    document.getElementById('prayer-times-section').style.display = 'block';
    updatePrayerTimes();
}

function showQibla() {
    hideAllSections();
    document.getElementById('qibla-section').style.display = 'block';
    initQibla();
}

function hideSection(sectionId) {
    document.getElementById(sectionId).style.display = 'none';
}

function hideAllSections() {
    const sections = document.querySelectorAll('.section-content');
    sections.forEach(section => section.style.display = 'none');
}

// تحميل الإعدادات المحفوظة
function loadNotificationSettings() {
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
        notificationSettings = JSON.parse(saved);
        document.getElementById('enableNotifications').checked = notificationSettings.enabled;
        document.getElementById('muezzinVoice').value = notificationSettings.muezzin;
        document.getElementById('notificationTiming').value = notificationSettings.timing;
    }
}

// حفظ الإعدادات
function saveNotificationSettings() {
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
}

// تحميل إعدادات الأذان
function loadAzanSettings() {
    const savedSettings = localStorage.getItem('azanSettings');
    if (savedSettings) {
        azanSettings = JSON.parse(savedSettings);
        document.getElementById('azan-toggle').checked = azanSettings.enabled;
        document.getElementById('muezzin-select').value = azanSettings.muezzin;
        document.getElementById('azan-volume').value = azanSettings.volume;
        document.getElementById('notification-timing').value = azanSettings.notificationTiming;
    }
}

// حفظ إعدادات الأذان
function saveAzanSettings() {
    localStorage.setItem('azanSettings', JSON.stringify(azanSettings));
}

// تحديث الموقع
async function updateLocation() {
    try {
        const position = await getCurrentPosition();
        notificationSettings.latitude = position.coords.latitude;
        notificationSettings.longitude = position.coords.longitude;
        
        document.getElementById('locationStatus').textContent = 
            `تم تحديد الموقع: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
        
        saveNotificationSettings();
        updatePrayerTimes();
    } catch (error) {
        document.getElementById('locationStatus').textContent = 'فشل في تحديد الموقع. الرجاء الاختيار يدوياً.';
        openModal('location');
    }
}

// الحصول على الموقع الحالي
function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('متصفحك لا يدعم تحديد الموقع'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

// تحديث قائمة المدن مع إمكانية البحث
function updateCities() {
    const country = document.getElementById('country').value;
    const citySelect = document.getElementById('city');
    const searchInput = document.getElementById('citySearch');
    
    // حفظ آخر دولة تم اختيارها
    localStorage.setItem('lastCountry', country);
    
    updateCityList();
}

// تحديث قائمة المدن حسب البحث
function updateCityList(searchTerm = '') {
    const country = document.getElementById('country').value;
    const citySelect = document.getElementById('city');
    citySelect.innerHTML = '<option value="">اختر المدينة</option>';
    
    if (country && citiesData[country]) {
        const cities = Object.keys(citiesData[country]);
        const filteredCities = searchTerm ? 
            cities.filter(city => city.includes(searchTerm)) : 
            cities;
            
        filteredCities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    }
}

// تحميل آخر موقع تم اختياره
function loadLastLocation() {
    const lastCountry = localStorage.getItem('lastCountry');
    const lastCity = localStorage.getItem('lastCity');
    
    if (lastCountry) {
        document.getElementById('country').value = lastCountry;
        updateCities();
        
        if (lastCity) {
            document.getElementById('city').value = lastCity;
        }
    }
}

// حفظ الموقع المختار
function saveLocation() {
    const country = document.getElementById('country').value;
    const city = document.getElementById('city').value;
    
    if (!country || !city) {
        alert('الرجاء اختيار الدولة والمدينة');
        return;
    }
    
    const cityData = citiesData[country][city];
    notificationSettings.latitude = cityData.lat;
    notificationSettings.longitude = cityData.lng;
    
    // حفظ آخر مدينة تم اختيارها
    localStorage.setItem('lastCity', city);
    
    saveNotificationSettings();
    updatePrayerTimes();
    closeModal('location');
}

// فتح نافذة تغيير الموقع
function openLocationSettings() {
    loadLastLocation();
    openModal('location');
}

// تفعيل/تعطيل التنبيهات
function toggleNotifications(enabled) {
    notificationSettings.enabled = enabled;
    saveNotificationSettings();
    
    if (enabled) {
        requestNotificationPermission();
        updatePrayerTimes();
    }
}

// تحديث صوت الأذان
function updateAzanVoice(voice) {
    notificationSettings.muezzin = voice;
    saveNotificationSettings();
}

// تحديث توقيت التنبيه
function updateNotificationTiming(timing) {
    notificationSettings.timing = parseInt(timing);
    saveNotificationSettings();
}

// طلب إذن التنبيهات
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        alert('متصفحك لا يدعم التنبيهات');
        return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        alert('يجب السماح بالتنبيهات لتلقي تنبيهات الصلاة');
        document.getElementById('enableNotifications').checked = false;
        notificationSettings.enabled = false;
        saveNotificationSettings();
    }
}

// تحديث مواقيت الصلاة
async function updatePrayerTimes() {
    if (!notificationSettings.enabled || !notificationSettings.latitude || !notificationSettings.longitude) return;
    
    try {
        const response = await fetch(
            `https://api.aladhan.com/v1/timings/${Math.floor(Date.now() / 1000)}?latitude=${notificationSettings.latitude}&longitude=${notificationSettings.longitude}&method=4`
        );
        const data = await response.json();
        
        if (data.data && data.data.timings) {
            setupPrayerNotifications(data.data.timings);
            updatePrayerTimesDisplay(data.data.timings);
        }
    } catch (error) {
        console.error('خطأ في جلب مواقيت الصلاة:', error);
    }
}

// إعداد التنبيهات
function setupPrayerNotifications(timings) {
    if (!azanSettings.enabled) return;
    
    const prayers = {
        Fajr: 'الفجر',
        Dhuhr: 'الظهر',
        Asr: 'العصر',
        Maghrib: 'المغرب',
        Isha: 'العشاء'
    };
    
    for (const [prayer, arabicName] of Object.entries(prayers)) {
        const time = timings[prayer];
        const [hours, minutes] = time.split(':');
        
        const now = new Date();
        const prayerTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
        
        // وقت التنبيه المسبق
        if (azanSettings.notificationTiming > 0) {
            const preAlertTime = new Date(prayerTime);
            preAlertTime.setMinutes(preAlertTime.getMinutes() - azanSettings.notificationTiming);
            
            if (preAlertTime > now) {
                const timeUntilPreAlert = preAlertTime - now;
                setTimeout(() => {
                    showPrayerNotification(arabicName, true);
                }, timeUntilPreAlert);
            }
        }
        
        // وقت الأذان
        if (prayerTime > now) {
            const timeUntilPrayer = prayerTime - now;
            setTimeout(() => {
                showPrayerNotification(arabicName, false);
            }, timeUntilPrayer);
        }
    }
}

// تحسين نظام التنبيهات
function showPrayerNotification(prayerName, isPreAlert = false) {
    if (!azanSettings.enabled) return;
    
    const title = isPreAlert ? 
        `اقتربت صلاة ${prayerName}` : 
        `حان الآن موعد صلاة ${prayerName}`;
        
    const options = {
        body: isPreAlert ? 
            `بقي ${azanSettings.notificationTiming} دقيقة على صلاة ${prayerName}` :
            'حي على الصلاة، حي على الفلاح',
        icon: 'icons/mosque.png',
        badge: 'icons/badge.png',
        vibrate: [200, 100, 200]
    };

    if (Notification.permission === 'granted') {
        new Notification(title, options);
        if (!isPreAlert) {
            playAzan(prayerName);
        }
    }
}

// تشغيل الأذان
function playAzan(prayerName) {
    if (azanSettings.enabled) {
        const audio = new Audio(`sounds/${azanSettings.muezzin}_azan.mp3`);
        audio.volume = azanSettings.volume / 100;
        audio.play();
    }
}

// تحديث الساعة الرقمية
function updateDigitalClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const timeElements = document.querySelectorAll('#current-time');
    timeElements.forEach(element => {
        element.textContent = `${hours}:${minutes}:${seconds}`;
    });

    updatePrayerCountdown();
}

// تحديث العد التنازلي للصلاة التالية
function updatePrayerCountdown() {
    if (!currentPrayerTimes) return;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const prayers = {
        'الفجر': convertToMinutes(currentPrayerTimes.Fajr),
        'الظهر': convertToMinutes(currentPrayerTimes.Dhuhr),
        'العصر': convertToMinutes(currentPrayerTimes.Asr),
        'المغرب': convertToMinutes(currentPrayerTimes.Maghrib),
        'العشاء': convertToMinutes(currentPrayerTimes.Isha)
    };

    let nextPrayer = null;
    let nextPrayerTime = null;
    let minDiff = Infinity;

    for (const [prayer, time] of Object.entries(prayers)) {
        const diff = time - currentTime;
        if (diff > 0 && diff < minDiff) {
            minDiff = diff;
            nextPrayer = prayer;
            nextPrayerTime = time;
        }
    }

    // إذا لم نجد صلاة تالية، نفترض أن الفجر هو التالي
    if (!nextPrayer) {
        nextPrayer = 'الفجر';
        nextPrayerTime = prayers['الفجر'] + 24 * 60; // إضافة يوم كامل
        minDiff = nextPrayerTime - currentTime;
    }

    // تحديث اسم الصلاة التالية
    const nextPrayerElements = document.querySelectorAll('#next-prayer-name');
    nextPrayerElements.forEach(element => {
        element.textContent = nextPrayer;
    });

    // تحديث العد التنازلي
    const countdownElements = document.querySelectorAll('#prayer-countdown');
    countdownElements.forEach(element => {
        element.textContent = `${String(minDiff / 60).padStart(2, '0')}:${String(minDiff % 60).padStart(2, '0')}`;
    });

    // تحديث تأثير الصلاة التالية
    const cards = document.querySelectorAll('.prayer-time-card');
    cards.forEach(card => {
        const prayerLabel = card.querySelector('.prayer-label').textContent;
        if (prayerLabel === nextPrayer) {
            card.classList.add('next-prayer');
        } else {
            card.classList.remove('next-prayer');
        }
    });
}

// تحويل الوقت إلى دقائق
function convertToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

// تحديث الساعة كل ثانية
setInterval(updateDigitalClock, 1000);

// تحديث أوقات الصلاة كل دقيقة
setInterval(() => {
    if (notificationSettings.latitude && notificationSettings.longitude) {
        updatePrayerTimes();
    }
}, 60000);

// تحديث التنبيهات كل يوم
setInterval(updatePrayerTimes, 24 * 60 * 60 * 1000);

// تحديث أوقات الصلاة في الواجهة
function updatePrayerTimesDisplay(timings) {
    document.getElementById('fajr-time').textContent = timings.Fajr;
    document.getElementById('dhuhr-time').textContent = timings.Dhuhr;
    document.getElementById('asr-time').textContent = timings.Asr;
    document.getElementById('maghrib-time').textContent = timings.Maghrib;
    document.getElementById('isha-time').textContent = timings.Isha;
    
    // تحديث الوقت التالي
    updateNextPrayer(timings);
}

// تحديث الوقت التالي
function updateNextPrayer(timings) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const prayerTimes = {
        'الفجر': convertToMinutes(timings.Fajr),
        'الظهر': convertToMinutes(timings.Dhuhr),
        'العصر': convertToMinutes(timings.Asr),
        'المغرب': convertToMinutes(timings.Maghrib),
        'العشاء': convertToMinutes(timings.Isha)
    };
    
    let nextPrayer = null;
    let minDiff = Infinity;
    
    for (const [prayer, time] of Object.entries(prayerTimes)) {
        const diff = time - currentTime;
        if (diff > 0 && diff < minDiff) {
            minDiff = diff;
            nextPrayer = prayer;
        }
    }
    
    // إذا لم نجد صلاة تالية، نفترض أن الفجر هو التالي
    if (!nextPrayer) {
        nextPrayer = 'الفجر';
        minDiff = 24 * 60 - currentTime; // إضافة يوم كامل
    }

    // تحديث اسم الصلاة التالية
    const nextPrayerElements = document.querySelectorAll('#next-prayer-name');
    nextPrayerElements.forEach(element => {
        element.textContent = nextPrayer;
    });

    // تحديث تأثير الصلاة التالية
    const cards = document.querySelectorAll('.prayer-time-card');
    cards.forEach(card => {
        const prayerLabel = card.querySelector('.prayer-label').textContent;
        if (prayerLabel === nextPrayer) {
            card.classList.add('next-prayer');
        } else {
            card.classList.remove('next-prayer');
        }
    });
}

// حساب اتجاه القبلة
function calculateQiblaDirection(latitude, longitude) {
    const makkahLat = 21.3891;
    const makkahLng = 39.8579;
    
    const latRad = latitude * (Math.PI / 180);
    const longRad = longitude * (Math.PI / 180);
    const makkahLatRad = makkahLat * (Math.PI / 180);
    const makkahLongRad = makkahLng * (Math.PI / 180);
    
    const y = Math.sin(makkahLongRad - longRad);
    const x = Math.cos(latRad) * Math.tan(makkahLatRad) - Math.sin(latRad) * Math.cos(makkahLongRad - longRad);
    let qiblaDirection = Math.atan2(y, x) * (180 / Math.PI);
    
    // تحويل الزاوية إلى درجات موجبة
    if (qiblaDirection < 0) {
        qiblaDirection += 360;
    }
    
    return qiblaDirection;
}

// حساب المسافة إلى مكة
function calculateDistanceToMakkah(latitude, longitude) {
    const makkahLat = 21.3891;
    const makkahLng = 39.8579;
    const R = 6371; // نصف قطر الأرض بالكيلومتر
    
    const lat1 = latitude * (Math.PI / 180);
    const lat2 = makkahLat * (Math.PI / 180);
    const deltaLat = (makkahLat - latitude) * (Math.PI / 180);
    const deltaLng = (makkahLng - longitude) * (Math.PI / 180);
    
    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return Math.round(distance);
}

// تحديث البوصلة
function updateCompass(heading, qiblaDirection) {
    const arrow = document.querySelector('.compass .arrow');
    if (arrow) {
        // تحويل اتجاه البوصلة إلى الشمال
        const rotation = qiblaDirection - heading;
        arrow.style.transform = `translate(-50%, -100%) rotate(${rotation}deg)`;
        
        // تحديث معلومات القبلة
        document.getElementById('qibla-degree').textContent = `${Math.round(qiblaDirection)}°`;
    }
}

// تهيئة البوصلة
function initializeCompass() {
    if ('permissions' in navigator) {
        navigator.permissions.query({ name: 'geolocation' })
            .then(function(result) {
                if (result.state === 'granted') {
                    startCompass();
                } else {
                    alert('يرجى السماح بالوصول إلى موقعك لتحديد اتجاه القبلة');
                }
            });
    }
}

// بدء عمل البوصلة
function startCompass() {
    if ('DeviceOrientationEvent' in window) {
        window.addEventListener('deviceorientationabsolute', function(event) {
            const heading = event.alpha;
            if (heading && notificationSettings.latitude && notificationSettings.longitude) {
                const qiblaDirection = calculateQiblaDirection(
                    notificationSettings.latitude,
                    notificationSettings.longitude
                );
                updateCompass(heading, qiblaDirection);
                
                // تحديث المسافة إلى مكة
                const distance = calculateDistanceToMakkah(
                    notificationSettings.latitude,
                    notificationSettings.longitude
                );
                document.getElementById('makkah-distance').textContent = `${distance} كم`;
            }
        });
    } else {
        alert('عذراً، جهازك لا يدعم البوصلة');
    }
}

// تحديث صوت المؤذن
function updateAzanVoice(voice) {
    azanSettings.muezzin = voice;
    saveAzanSettings();
}

// تحديث مستوى الصوت
function updateAzanVolume(volume) {
    azanSettings.volume = volume;
    saveAzanSettings();
}

// تفعيل/تعطيل الأذان
function toggleAzan(enabled) {
    azanSettings.enabled = enabled;
    saveAzanSettings();
}

// تحديث توقيت التنبيه
function updateNotificationTiming(timing) {
    azanSettings.notificationTiming = parseInt(timing);
    saveAzanSettings();
}

// تحديث حجم الخط للأقسام الرئيسية فقط
function updateFontSize(size) {
    const mainSections = document.querySelectorAll('.prayer-card, .azan-section, .qibla-section');
    mainSections.forEach(section => {
        section.style.fontSize = size + 'px';
    });
    
    // تحديث معاينة حجم الخط
    document.querySelector('.font-size-preview .small').style.fontSize = (size * 0.8) + 'px';
    document.querySelector('.font-size-preview .large').style.fontSize = (size * 1.2) + 'px';
    
    // حفظ الإعداد
    localStorage.setItem('fontSize', size);
}

// استرجاع حجم الخط عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
        document.getElementById('font-size').value = savedFontSize;
        updateFontSize(savedFontSize);
    }
});

// تحميل الإعدادات عند بدء التطبيق
document.addEventListener('DOMContentLoaded', () => {
    loadNotificationSettings();
    loadAzanSettings();
    if (document.getElementById('qibla-compass-modal')) {
        initializeCompass();
    }
    if (azanSettings.enabled) {
        requestNotificationPermission();
        updateLocation();
    }
});

// تحديث دائرة العد التنازلي
function updateCountdownCircle(timeLeft, totalTime) {
    const circle = document.querySelector('.progress-ring-circle');
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    const offset = circumference - (timeLeft / totalTime) * circumference;
    circle.style.strokeDashoffset = offset;
}

// تحديث اتجاه القبلة
function updateQiblaDirection(angle) {
    const arrow = document.querySelector('.compass-arrow');
    arrow.style.transform = `translateX(-50%) rotate(${angle}deg)`;
}

// استمع لتغيرات اتجاه الجهاز
window.addEventListener('deviceorientationabsolute', function(event) {
    if (event.alpha !== null) {
        const qiblaAngle = calculateQiblaAngle(); // دالة لحساب زاوية القبلة
        const deviceAngle = 360 - event.alpha;
        const finalAngle = (qiblaAngle - deviceAngle + 360) % 360;
        updateQiblaDirection(finalAngle);
    }
});

// تحديث الوقت المتبقي للصلاة القادمة
function updateNextPrayer() {
    const now = new Date();
    const prayerTimes = calculatePrayerTimes(now); // دالة لحساب أوقات الصلاة
    const nextPrayer = getNextPrayer(prayerTimes, now); // دالة للحصول على الصلاة القادمة
    
    if (nextPrayer) {
        const timeLeft = nextPrayer.time - now;
        const totalTime = 3600000; // ساعة واحدة بالمللي ثانية
        
        updateCountdownCircle(timeLeft, totalTime);
        document.querySelector('.prayer-name').textContent = nextPrayer.name;
        document.querySelector('.countdown-time').textContent = formatTimeLeft(timeLeft);
    }
}

// تحديث كل ثانية
setInterval(updateNextPrayer, 1000);

// تحديث أول مرة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    updateNextPrayer();
    // طلب الإذن لاستخدام موقع المستخدم لحساب اتجاه القبلة
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const qiblaAngle = calculateQiblaAngle(position.coords.latitude, position.coords.longitude);
            updateQiblaDirection(qiblaAngle);
        });
    }
});