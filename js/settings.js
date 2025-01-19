// تحديث الإضاءة
function updateBrightness(value) {
    const root = document.documentElement;
    // تحويل القيمة إلى نسبة مئوية
    const brightness = value / 100;
    // تطبيق الإضاءة على العناصر
    root.style.setProperty('--brightness-filter', `brightness(${brightness})`);
    document.body.style.filter = `brightness(${brightness})`;
}

// تحديث حجم الخط
function updateFontSize(value) {
    const root = document.documentElement;
    // تحديث المتغير CSS للخط
    root.style.setProperty('--base-font-size', `${value}px`);
}

// تحديث نوع الخط
function updateFontFamily(font) {
    if (!font) return;
    
    const fontStyle = font === 'Cairo' || font === 'Tajawal' || font === 'Reem Kufi' || font === 'Harmattan' ? 'sans-serif' : 'serif';
    document.documentElement.style.setProperty('--font-family', `'${font}', ${fontStyle}`);
    localStorage.setItem('fontFamily', font);
}

// تحديث طريقة حساب المواقيت
function updatePrayerMethod(value) {
    // تخزين الإعداد في localStorage
    localStorage.setItem('prayerCalculationMethod', value);
    // إعادة حساب مواقيت الصلاة
    updatePrayerTimes();
}

// تحديث إعدادات التنبيهات
function updateNotificationSettings(value) {
    // تخزين إعدادات التنبيهات
    localStorage.setItem('notificationSettings', value);
    // تفعيل أو تعطيل التنبيهات بناءً على القيمة
    if (value === '2') { // تشغيل
        enableNotifications();
    } else { // إيقاف
        disableNotifications();
    }
}

// ثوابت إعدادات التنبيهات والأذان
const NOTIFICATION_SETTINGS = {
    STORAGE_KEY: 'prayerNotificationSettings',
    DEFAULT_BEFORE_PRAYER: '15',
    DEFAULT_REMINDER_DELAY: '20',
    DEFAULT_NOTIFICATIONS_ENABLED: true,
    DEFAULT_ADHAN: 'makkah',
    DEFAULT_VOLUME: 70
};

// حفظ إعدادات الأذان
function saveAdhanSettings() {
    const settings = {
        muadhin: document.getElementById('muadhin').value,
        volume: document.getElementById('adhanVolume').value,
        soundEnabled: document.getElementById('soundNotification').checked,
        vibrationEnabled: document.getElementById('vibrationNotification').checked,
        screenEnabled: document.getElementById('screenNotification').checked,
        beforePrayerTime: document.getElementById('beforePrayerTime').value,
        prayerConfirmation: document.getElementById('prayerConfirmation').value
    };
    
    localStorage.setItem('adhanSettings', JSON.stringify(settings));
}

// استرجاع إعدادات الأذان
function loadAdhanSettings() {
    try {
        const settings = JSON.parse(localStorage.getItem('adhanSettings')) || {
            muadhin: NOTIFICATION_SETTINGS.DEFAULT_ADHAN,
            volume: NOTIFICATION_SETTINGS.DEFAULT_VOLUME,
            soundEnabled: true,
            vibrationEnabled: true,
            screenEnabled: true,
            beforePrayerTime: '15',
            prayerConfirmation: '20'
        };

        document.getElementById('muadhin').value = settings.muadhin;
        document.getElementById('adhanVolume').value = settings.volume;
        document.getElementById('soundNotification').checked = settings.soundEnabled;
        document.getElementById('vibrationNotification').checked = settings.vibrationEnabled;
        document.getElementById('screenNotification').checked = settings.screenEnabled;
        document.getElementById('beforePrayerTime').value = settings.beforePrayerTime;
        document.getElementById('prayerConfirmation').value = settings.prayerConfirmation;
        
        // تحديث عرض مستوى الصوت
        document.querySelector('.volume-value').textContent = settings.volume + '%';
    } catch (error) {
        console.error('خطأ في تحميل الإعدادات:', error);
    }
}

// معاينة صوت الأذان
let isPlaying = false;
let adhanAudio = null;

// قائمة بمسارات الأذان المتوفرة
const ADHAN_PATHS = {
    'refaat': ['audio/adhan/refaat/azan.mp3', 'audio/azan1.mp3'],
    'makkah': ['audio/adhan/makkah/azan.mp3', 'audio/azan-short.mp3'],
    'madinah': ['audio/adhan/madinah/azan.mp3', 'audio/azan2.mp3'],
    'qatami': ['audio/adhan/qatami/azan.mp3', 'audio/azan-nasser-alqatami-first-takbeer.mp3'],
    'husary': ['audio/adhan/husary/azan.mp3'],
    'minshawi': ['audio/adhan/minshawi/azan.mp3'],
    'basit': ['audio/adhan/basit/azan.mp3'],
    'tobar': ['audio/adhan/tobar/azan.mp3'],
    'quds': ['audio/adhan/quds/azan.mp3']
};

function preloadAudio(paths) {
    return new Promise((resolve, reject) => {
        // نحاول تحميل الملف من المسارات المتاحة بالترتيب
        const tryLoadAudio = (index) => {
            if (index >= paths.length) {
                reject(new Error('لم نتمكن من تحميل ملف الصوت'));
                return;
            }

            const audio = new Audio(paths[index]);
            
            audio.addEventListener('canplaythrough', () => {
                resolve(audio);
            }, { once: true });

            audio.addEventListener('error', () => {
                console.log(`فشل تحميل الملف من المسار: ${paths[index]}`);
                tryLoadAudio(index + 1);
            }, { once: true });

            // محاولة تحميل الملف
            audio.load();
        };

        tryLoadAudio(0);
    });
}

async function toggleAdhan() {
    const button = document.getElementById('toggleAdhan');
    const icon = button.querySelector('i');
    const span = button.querySelector('span');

    if (isPlaying && adhanAudio) {
        // إيقاف الصوت
        adhanAudio.pause();
        adhanAudio.currentTime = 0;
        isPlaying = false;
        button.classList.remove('playing');
        icon.className = 'fas fa-play'; 
        span.textContent = 'اختبار الصوت';
    } else {
        try {
            // تعطيل الزر أثناء التحميل
            button.disabled = true;
            icon.className = 'fas fa-spinner fa-spin';
            span.textContent = 'جاري التحميل...';
            
            // الحصول على المؤذن المختار
            const muadhin = document.getElementById('muadhin').value;
            const volume = document.getElementById('adhanVolume').value / 100;

            // إيقاف أي صوت حالي
            if (adhanAudio) {
                adhanAudio.pause();
                adhanAudio = null;
            }

            // الحصول على مسارات الصوت المتاحة
            const paths = ADHAN_PATHS[muadhin] || ADHAN_PATHS['makkah'];
            
            // محاولة تحميل الصوت
            adhanAudio = await preloadAudio(paths);
            adhanAudio.volume = volume;

            // تشغيل الصوت
            await adhanAudio.play();
            
            // تحديث حالة الزر
            isPlaying = true;
            button.classList.add('playing');
            icon.className = 'fas fa-pause'; 
            span.textContent = 'إيقاف';

            // تفعيل الزر مرة أخرى
            button.disabled = false;

            // عند انتهاء الصوت
            adhanAudio.onended = () => {
                isPlaying = false;
                button.classList.remove('playing');
                icon.className = 'fas fa-play'; 
                span.textContent = 'اختبار الصوت';
                adhanAudio = null;
            };

        } catch (error) {
            console.error('خطأ في تشغيل الصوت:', error);
            button.disabled = false;
            button.classList.remove('playing');
            icon.className = 'fas fa-play'; 
            span.textContent = 'اختبار الصوت';
            
            // عرض رسالة خطأ للمستخدم
            const errorModal = document.createElement('div');
            errorModal.className = 'error-message';
            errorModal.innerHTML = `
                <div class="error-content">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>عذراً، لم نتمكن من تحميل صوت الأذان</p>
                    <small>يرجى التأكد من اختيار المؤذن الصحيح وإعادة المحاولة</small>
                </div>
            `;
            document.body.appendChild(errorModal);
            
            // إزالة رسالة الخطأ بعد 3 ثواني
            setTimeout(() => {
                errorModal.remove();
            }, 3000);
        }
    }
}

// تفعيل وتعطيل الإضافات
function toggleAddon(value) {
    if (value === '0') return; // لا تفعل شيئاً إذا كان الاختيار هو "اختر إضافة"
    
    // حفظ حالة الإضافة في localStorage
    const activeAddons = JSON.parse(localStorage.getItem('activeAddons') || '{}');
    
    if (!activeAddons[value]) {
        // تفعيل الإضافة
        activeAddons[value] = true;
        showSuccessMessage(`تم تفعيل إضافة ${getAddonName(value)}`);
    } else {
        // تعطيل الإضافة
        delete activeAddons[value];
        showSuccessMessage(`تم تعطيل إضافة ${getAddonName(value)}`);
    }
    
    localStorage.setItem('activeAddons', JSON.stringify(activeAddons));
    updateAddonsList();
}

// الحصول على اسم الإضافة بالعربية
function getAddonName(value) {
    const names = {
        'quran': 'القرآن الكريم',
        'hadith': 'الأحاديث النبوية',
        'athkar': 'الأذكار',
        'tafsir': 'التفسير',
        'calendar': 'التقويم الهجري',
        'qibla': 'القبلة',
        'names': 'أسماء الله الحسنى',
        'dua': 'الأدعية المأثورة'
    };
    return names[value] || value;
}

// تحديث قائمة الإضافات
function updateAddonsList() {
    const activeAddons = JSON.parse(localStorage.getItem('activeAddons') || '{}');
    const addonsSelector = document.getElementById('addonsSelector');
    
    if (addonsSelector) {
        // تحديث حالة الاختيارات في القائمة المنسدلة
        Array.from(addonsSelector.options).forEach(option => {
            if (option.value !== '0') {
                option.text = `${getAddonName(option.value)} ${activeAddons[option.value] ? '✓' : ''}`;
            }
        });
    }
}

// إظهار رسالة نجاح
function showSuccessMessage(message) {
    // يمكنك تخصيص طريقة عرض الرسالة هنا
    console.log(message);
    // مثال: إنشاء عنصر div للرسالة
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    // إخفاء الرسالة بعد ثانيتين
    setTimeout(() => {
        messageDiv.remove();
    }, 2000);
}

// طلب الأذونات المطلوبة للتطبيق
async function requestAppPermissions() {
    try {
        // طلب إذن الموقع للقبلة ومواقيت الصلاة
        if ('geolocation' in navigator) {
            const locationPermission = await navigator.permissions.query({ name: 'geolocation' });
            if (locationPermission.state === 'prompt') {
                await new Promise((resolve) => {
                    navigator.geolocation.getCurrentPosition(resolve, resolve);
                });
            }
        }

        // طلب إذن الإشعارات
        if ('Notification' in window) {
            const notificationPermission = await Notification.requestPermission();
            if (notificationPermission === 'granted') {
                enableNotifications();
            }
        }

        // التأكد من دعم تخزين البيانات المحلي
        if ('storage' in navigator && 'persist' in navigator.storage) {
            await navigator.storage.persist();
        }

        return true;
    } catch (error) {
        console.error('خطأ في طلب الأذونات:', error);
        return false;
    }
}

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', async () => {
    // طلب الأذونات المطلوبة
    await requestAppPermissions();
    
    // استرجاع وتطبيق الإعدادات المحفوظة
    const brightnessSlider = document.getElementById('brightnessSlider');
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    const prayerMethod = document.getElementById('prayerCalcMethod');
    const notificationSettings = document.getElementById('notificationSettings');
    const addonsSelector = document.getElementById('addonsSelector');
    const fontSelector = document.getElementById('fontSelector');

    // تطبيق الإعدادات المحفوظة
    if (brightnessSlider) {
        brightnessSlider.addEventListener('input', (e) => updateBrightness(e.target.value));
        // استرجاع قيمة الإضاءة المحفوظة
        const savedBrightness = localStorage.getItem('brightness') || 100;
        brightnessSlider.value = savedBrightness;
        updateBrightness(savedBrightness);
    }

    if (fontSizeSlider) {
        fontSizeSlider.addEventListener('input', (e) => updateFontSize(e.target.value));
        // استرجاع حجم الخط المحفوظ
        const savedFontSize = localStorage.getItem('fontSize') || 16;
        fontSizeSlider.value = savedFontSize;
        updateFontSize(savedFontSize);
    }

    if (prayerMethod) {
        prayerMethod.addEventListener('change', (e) => updatePrayerMethod(e.target.value));
        // استرجاع طريقة حساب المواقيت المحفوظة
        const savedMethod = localStorage.getItem('prayerCalculationMethod') || '1';
        prayerMethod.value = savedMethod;
        updatePrayerMethod(savedMethod);
    }

    if (notificationSettings) {
        notificationSettings.addEventListener('change', (e) => updateNotificationSettings(e.target.value));
        // استرجاع إعدادات التنبيهات المحفوظة
        const savedNotifications = localStorage.getItem('notificationSettings') || '1';
        notificationSettings.value = savedNotifications;
        updateNotificationSettings(savedNotifications);
    }

    if (addonsSelector) {
        addonsSelector.addEventListener('change', (e) => toggleAddon(e.target.value));
        // تحديث قائمة الإضافات
        updateAddonsList();
    }

    const savedFont = localStorage.getItem('fontFamily') || 'Amiri';
    if (fontSelector) {
        fontSelector.value = savedFont;
    }
    updateFontFamily(savedFont);

    // استرجاع وتطبيق إعدادات الأذان
    loadAdhanSettings();
});
