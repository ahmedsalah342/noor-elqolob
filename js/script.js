// تبديل القائمة المنسدلة
let isMenuOpen = false;

function toggleMenu() {
    const menu = document.querySelector('.dropdown-menu');
    const button = document.querySelector('.menu-button');
    
    if (!isMenuOpen) {
        menu.classList.add('show');
        isMenuOpen = true;
        
        // إضافة مستمع الحدث بعد فتح القائمة
        setTimeout(() => {
            document.addEventListener('click', closeMenuOnClickOutside);
        }, 0);
    } else {
        closeMenu();
    }
}

function closeMenu() {
    const menu = document.querySelector('.dropdown-menu');
    menu.classList.remove('show');
    isMenuOpen = false;
    document.removeEventListener('click', closeMenuOnClickOutside);
}

function closeMenuOnClickOutside(event) {
    const menu = document.querySelector('.dropdown-menu');
    const button = document.querySelector('.menu-button');
    
    if (!menu.contains(event.target) && !button.contains(event.target)) {
        closeMenu();
    }
}

// إغلاق النافذة المنبثقة
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    // إذا كان معرف النافذة يحتوي على -modal
    if (modalId.endsWith('-modal')) {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    } else {
        // إذا لم يكن يحتوي على -modal، نضيفه
        const modalWithSuffix = document.getElementById(modalId + '-modal');
        if (modalWithSuffix) {
            modalWithSuffix.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
}

// التعامل مع النوافذ المنبثقة
function showModal(modalId) {
    const modal = document.getElementById(modalId + '-modal') || document.getElementById(modalId + 'Modal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        closeMenu();
        
        // إغلاق النافذة عند النقر خارجها
        modal.onclick = function(event) {
            if (event.target === modal) {
                closeModal(modal.id);
            }
        };
    }
}

// إضافة مستمعات الأحداث عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // استعادة الإعدادات
    initializeSettings();
    
    // إضافة مستمعي الأحداث لأزرار الإغلاق
    const closeButtons = document.querySelectorAll('.close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });

    // إغلاق النافذة عند الضغط على ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const visibleModal = document.querySelector('.modal[style*="display: block"]');
            if (visibleModal) {
                closeModal(visibleModal.id);
            }
        }
    });
});

// التحكم في الإعدادات
function initializeSettings() {
    // استعادة الإعدادات المحفوظة
    const savedBrightness = localStorage.getItem('brightness') || 100;
    const savedFontSize = localStorage.getItem('fontSize') || 24;
    const savedFont = localStorage.getItem('fontFamily') || 'Amiri';

    // تطبيق الإعدادات
    const brightnessSlider = document.getElementById('brightnessSlider');
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    const fontSelect = document.getElementById('fontSelector');

    if (brightnessSlider) {
        brightnessSlider.value = savedBrightness;
        updateBrightness(savedBrightness);
        brightnessSlider.addEventListener('input', (e) => updateBrightness(e.target.value));
    }

    if (fontSizeSlider) {
        fontSizeSlider.value = savedFontSize;
        updateFontSize(savedFontSize);
        fontSizeSlider.addEventListener('input', (e) => updateFontSize(e.target.value));
    }

    if (fontSelect) {
        fontSelect.value = savedFont;
        updateFontFamily(savedFont);
        fontSelect.addEventListener('change', (e) => updateFontFamily(e.target.value));
    }
}

// تحديث السطوع
function updateBrightness(value) {
    document.body.style.filter = `brightness(${value}%)`;
    const brightnessValue = document.querySelector('.brightness-value');
    if (brightnessValue) {
        brightnessValue.textContent = `${value}%`;
    }
    localStorage.setItem('brightness', value);
}

// تحديث حجم الخط
function updateFontSize(size) {
    const elements = document.querySelectorAll('.reading-section, .quran-text, .arabic-text, .modal-content:not(#settings-modal .modal-content), body, h1, h2, h3, p, .card h2');
    elements.forEach(element => {
        element.style.fontSize = size + 'px';
    });
    
    const fontSizeValue = document.getElementById('font-size-value');
    if (fontSizeValue) {
        fontSizeValue.textContent = size;
    }
    
    localStorage.setItem('fontSize', size);
}

// تحديث نوع الخط
function updateFontFamily(font) {
    document.documentElement.style.setProperty('--font-family', font);
    const elements = document.querySelectorAll('.reading-section, .quran-text, .arabic-text, .modal-content, body, h1, h2, h3, p, .card h2');
    elements.forEach(element => {
        element.style.fontFamily = font;
    });
    localStorage.setItem('fontFamily', font);
}

// مواقيت الصلاة
function getPrayerTimes() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                const date = new Date();
                const timestamp = Math.floor(date.getTime() / 1000);

                // استخدام API لمواقيت الصلاة
                fetch(`https://api.aladhan.com/v1/timings/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=${localStorage.getItem('calculationMethod') || '5'}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.code === 200 && data.data && data.data.timings) {
                            updatePrayerTimesUI(data.data.timings);
                            setupPrayerNotifications(data.data.timings);
                        }
                    })
                    .catch(error => {
                        console.error('خطأ في جلب مواقيت الصلاة:', error);
                        // استخدام القيم المخزنة مسبقاً إذا كانت متوفرة
                        const savedTimings = localStorage.getItem('lastPrayerTimes');
                        if (savedTimings) {
                            updatePrayerTimesUI(JSON.parse(savedTimings));
                        }
                    });
            },
            error => {
                console.error('خطأ في تحديد الموقع:', error);
                // استخدام آخر موقع معروف
                const lastLocation = localStorage.getItem('lastLocation');
                if (lastLocation) {
                    const { latitude, longitude } = JSON.parse(lastLocation);
                    getPrayerTimesForLocation(latitude, longitude);
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    }
}

// تحديث واجهة مواقيت الصلاة
function updatePrayerTimesUI(timings) {
    const prayerNames = {
        Fajr: 'الفجر',
        Sunrise: 'الشروق',
        Dhuhr: 'الظهر',
        Asr: 'العصر',
        Maghrib: 'المغرب',
        Isha: 'العشاء'
    };

    // حفظ المواقيت في التخزين المحلي
    localStorage.setItem('lastPrayerTimes', JSON.stringify(timings));

    for (const [prayer, time] of Object.entries(timings)) {
        if (prayerNames[prayer]) {
            const element = document.getElementById(`${prayer.toLowerCase()}Time`);
            if (element) {
                element.textContent = formatTime(time);
            }
        }
    }

    // تحديث الوقت المتبقي للصلاة القادمة
    updateNextPrayer(timings);
}

// تحديث الوقت المتبقي للصلاة القادمة
function updateNextPrayer(timings) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const prayers = Object.entries(timings)
        .filter(([name]) => ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(name))
        .map(([name, time]) => {
            const [hours, minutes] = time.split(':').map(Number);
            return {
                name,
                time: hours * 60 + minutes
            };
        })
        .sort((a, b) => a.time - b.time);

    // إيجاد الصلاة القادمة
    let nextPrayer = prayers.find(prayer => prayer.time > currentTime);
    if (!nextPrayer) {
        // إذا كانت كل الصلوات لليوم قد انتهت، فالصلاة القادمة هي فجر اليوم التالي
        nextPrayer = prayers[0];
    }

    // حساب الوقت المتبقي
    let remainingMinutes = nextPrayer.time - currentTime;
    if (remainingMinutes < 0) {
        remainingMinutes += 24 * 60; // إضافة 24 ساعة
    }

    // تحديث العرض
    const hours = Math.floor(remainingMinutes / 60);
    const minutes = remainingMinutes % 60;
    const nextPrayerElement = document.getElementById('nextPrayer');
    const remainingTimeElement = document.getElementById('remainingTime');
    
    if (nextPrayerElement && remainingTimeElement) {
        nextPrayerElement.textContent = getPrayerName(nextPrayer.name);
        remainingTimeElement.textContent = `${hours}:${minutes.toString().padStart(2, '0')}`;
    }
}

// الحصول على اسم الصلاة بالعربية
function getPrayerName(prayer) {
    const names = {
        Fajr: 'الفجر',
        Dhuhr: 'الظهر',
        Asr: 'العصر',
        Maghrib: 'المغرب',
        Isha: 'العشاء'
    };
    return names[prayer] || prayer;
}

// تنسيق الوقت
function formatTime(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    return `${hours}:${minutes}`;
}

// تحديث التواريخ عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    updateDates();
    getPrayerTimes();
    
    // تحديث كل ساعة
    setInterval(() => {
        updateDates();
        getPrayerTimes();
    }, 3600000); // كل ساعة
});

// تحديث البوصلة واتجاه القبلة
function updateQiblaDirection(latitude, longitude) {
    const direction = calculateQiblaDirection(latitude, longitude);
    const directionElement = document.getElementById('qiblaDirection');
    const compassArrow = document.querySelector('.compass-arrow');
    
    if (directionElement && compassArrow) {
        directionElement.textContent = direction + ' درجة';
        compassArrow.style.transform = `translate(-50%, -100%) rotate(${direction}deg)`;
    }
}

// تحديث البوصلة
function updateQiblaCompass(heading) {
    const arrow = document.querySelector('.compass-arrow');
    const accuracy = document.getElementById('qiblaAccuracy');
    
    if (arrow && accuracy) {
        // حساب اتجاه القبلة
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            const qiblaDirection = calculateQiblaDirection(latitude, longitude);
            
            // تحديث السهم
            const rotation = qiblaDirection - heading;
            arrow.style.transform = `rotate(${rotation}deg)`;
            
            // تحديث نسبة الدقة
            const accuracyValue = Math.min(100, Math.round((1 - Math.abs(rotation % 360) / 360) * 100));
            accuracy.textContent = accuracyValue;
        });
    }
}

// إضافة مستمع لحركة الجهاز
function initQiblaCompass() {
    if ('DeviceOrientationEvent' in window) {
        window.addEventListener('deviceorientationabsolute', function(event) {
            let heading = event.alpha; // اتجاه البوصلة بالدرجات
            if (heading !== null) {
                updateQiblaCompass(heading);
            }
        });
    } else {
        document.querySelector('.qibla-accuracy').textContent = 'عذراً، جهازك لا يدعم البوصلة';
    }
}

// تحديث عند عرض قسم القبلة
document.getElementById('qiblaBtn').addEventListener('click', function() {
    const qiblaSection = document.getElementById('qiblaSection');
    if (qiblaSection) {
        const isHidden = qiblaSection.style.display === 'none';
        qiblaSection.style.display = isHidden ? 'block' : 'none';
        
        if (isHidden) {
            initQiblaCompass();
            getPrayerTimes(); // تحديث مواقيت الصلاة
        }
    }
});

// دالة تحديث اتجاه القبلة
function updateQiblaDirection(angle) {
    const arrow = document.querySelector('.compass-arrow');
    if (arrow) {
        arrow.style.setProperty('--qibla-direction', angle + 'deg');
    }
}

// استخدام حساس التوجيه إذا كان متوفراً
if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', function(event) {
        if (event.webkitCompassHeading) {
            // للأجهزة التي تدعم iOS
            updateQiblaDirection(event.webkitCompassHeading);
        } else if (event.alpha) {
            // للأجهزة التي تدعم Android
            updateQiblaDirection(360 - event.alpha);
        }
    });
} else {
    // للمتصفح على الكمبيوتر - حركة بسيطة للعرض فقط
    let angle = 0;
    setInterval(() => {
        angle = (angle + 1) % 360;
        updateQiblaDirection(angle);
    }, 100);
}

// نموذج اتصل بنا
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // جمع البيانات من النموذج
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value
    };
    
    // إظهار رسالة النجاح
    const successMessage = document.getElementById('successMessage');
    successMessage.classList.add('show');
    
    // إعادة تعيين النموذج
    this.reset();
    
    // إخفاء رسالة النجاح بعد 3 ثواني
    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 3000);
});

// Contact Form Functionality
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    // Disable submit button
    const submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    
    // Send email using EmailJS
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        from_name: name,
        reply_to: email,
        message: message
    }).then(
        function(response) {
            // Show success message
            const successMessage = document.getElementById('success-message');
            successMessage.style.display = 'block';
            
            // Reset form
            document.getElementById('contactForm').reset();
            
            // Hide success message after 3 seconds
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 3000);
        },
        function(error) {
            alert('عذراً، حدث خطأ في إرسال الرسالة. الرجاء المحاولة مرة أخرى.');
        }
    ).finally(() => {
        // Re-enable submit button
        submitBtn.disabled = false;
    });
});

// إغلاق النافذة عند النقر خارجها
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// إغلاق النافذة عند الضغط على ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modals = document.getElementsByClassName('modal');
        for (let modal of modals) {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }
    }
});

// إعدادات التنبيهات
let notificationSettings = {
    enabled: false,
    timing: 10,
    azanVoice: 'nasser-alqatami'
};

// تحميل إعدادات التنبيهات
function loadNotificationSettings() {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
        notificationSettings = JSON.parse(savedSettings);
        document.getElementById('enableNotifications').checked = notificationSettings.enabled;
        document.getElementById('notificationTiming').value = notificationSettings.timing;
        document.getElementById('azanVoice').value = notificationSettings.azanVoice;
    }
}

// تفعيل/تعطيل التنبيهات
async function toggleNotifications(enabled) {
    notificationSettings.enabled = enabled;
    if (enabled) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            setupPrayerNotifications();
        } else {
            notificationSettings.enabled = false;
            document.getElementById('enableNotifications').checked = false;
        }
    }
    saveNotificationSettings();
}

// تحديث توقيت التنبيه
function updateNotificationTiming(timing) {
    notificationSettings.timing = parseInt(timing);
    saveNotificationSettings();
    if (notificationSettings.enabled) {
        setupPrayerNotifications();
    }
}

// تحديث صوت الأذان
function updateAzanVoice(voice) {
    notificationSettings.azanVoice = voice;
    saveNotificationSettings();
}

// حفظ إعدادات التنبيهات
function saveNotificationSettings() {
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
}

// إعداد تنبيهات الصلاة
async function setupPrayerNotifications() {
    if (!notificationSettings.enabled) return;
    
    const prayerTimes = await getPrayerTimes();
    if (!prayerTimes) return;

    const prayers = {
        Fajr: 'الفجر',
        Dhuhr: 'الظهر',
        Asr: 'العصر',
        Maghrib: 'المغرب',
        Isha: 'العشاء'
    };

    const now = new Date();
    const minutesBeforePrayer = notificationSettings.timing;

    for (const [prayer, arabicName] of Object.entries(prayers)) {
        const [hours, minutes] = prayerTimes[prayer].split(':');
        const prayerTime = new Date();
        prayerTime.setHours(parseInt(hours), parseInt(minutes) - minutesBeforePrayer, 0);

        if (prayerTime > now) {
            const timeUntilPrayer = prayerTime.getTime() - now.getTime();
            setTimeout(() => {
                showPrayerNotification(arabicName);
            }, timeUntilPrayer);
        }
    }
}

// عرض تنبيه الصلاة
function showPrayerNotification(prayer) {
    if (!notificationSettings.enabled) return;

    // تشغيل صوت الأذان (تكبيرة واحدة فقط)
    const azanAudio = new Audio('audio/azan-nasser-alqatami-first-takbeer.mp3');
    azanAudio.play().catch(console.error);

    // إظهار التنبيه
    const notification = new Notification(`حان وقت صلاة ${prayer}`, {
        body: `حان الآن موعد صلاة ${prayer}`,
        icon: 'icons/mosque-icon.png',
        silent: true // نستخدم الصوت المخصص
    });

    notification.onclick = function() {
        window.focus();
        notification.close();
    };
}

// تحديث التنبيهات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    loadNotificationSettings();
    if (notificationSettings.enabled) {
        setupPrayerNotifications();
    }
});

// دالة تحويل التاريخ الميلادي إلى هجري
function getHijriDate() {
    const today = new Date();
    const options = { 
        calendar: 'islamic',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };
    return today.toLocaleDateString('ar-SA', options);
}

// دالة الحصول على التاريخ الميلادي
function getGregorianDate() {
    const today = new Date();
    const options = { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return today.toLocaleDateString('ar-EG', options);
}

// تحديث التواريخ في الواجهة
function updateDates() {
    const gregorianDate = getGregorianDate();
    const hijriDate = getHijriDate();
    
    const dateElements = document.querySelectorAll('.prayer-times-date div');
    if (dateElements.length >= 2) {
        dateElements[0].textContent = gregorianDate;
        dateElements[1].textContent = `الموافق ${hijriDate}`;
    }
}

// تبديل عرض مواقيت الصلاة
function togglePrayerTimes(event) {
    const popup = event.currentTarget.parentElement.querySelector('.prayer-times-popup');
    const arrow = event.currentTarget.querySelector('.fa-chevron-down');
    
    // إغلاق أي نوافذ منبثقة أخرى مفتوحة
    document.querySelectorAll('.prayer-times-popup.show').forEach(p => {
        if (p !== popup) {
            p.classList.remove('show');
            p.parentElement.querySelector('.fa-chevron-down').style.transform = 'rotate(0deg)';
        }
    });

    // تبديل حالة النافذة الحالية
    popup.classList.toggle('show');
    arrow.style.transform = popup.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';

    // إغلاق النافذة عند النقر خارجها
    if (popup.classList.contains('show')) {
        document.addEventListener('click', function closePopup(e) {
            if (!popup.contains(e.target) && !event.currentTarget.contains(e.target)) {
                popup.classList.remove('show');
                arrow.style.transform = 'rotate(0deg)';
                document.removeEventListener('click', closePopup);
            }
        });
    }
}

// تبديل الوضع المظلم
function toggleDarkMode() {
    const body = document.body;
    const icon = document.querySelector('#darkModeBtn i');
    
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        icon.className = 'fas fa-sun';
        localStorage.setItem('darkMode', 'enabled');
    } else {
        icon.className = 'fas fa-moon';
        localStorage.setItem('darkMode', 'disabled');
    }
}

// تحديث طريقة حساب المواقيت
function updateCalculationMethod(method) {
    localStorage.setItem('calculationMethod', method);
    if (window.prayerTimesManager) {
        window.prayerTimesManager.calculationMethod = parseInt(method);
        window.prayerTimesManager.updatePrayerTimes();
    }
}

// تحديث إعدادات التنبيهات
function updateAdhanNotification(minutes) {
    localStorage.setItem('adhanNotification', minutes);
}

function togglePrayerNotifications(enabled) {
    localStorage.setItem('prayerNotifications', enabled);
    if (enabled) {
        requestNotificationPermission();
    }
}

function toggleAthkarNotifications(enabled) {
    localStorage.setItem('athkarNotifications', enabled);
    if (enabled) {
        requestNotificationPermission();
    }
}

// طلب إذن التنبيهات
async function requestNotificationPermission() {
    if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    return false;
}

// تغيير اللغة
async function changeLanguage(lang) {
    const currentLang = localStorage.getItem('language') || 'ar';
    if (currentLang !== lang) {
        localStorage.setItem('language', lang);
        
        // تغيير اتجاه الصفحة
        document.documentElement.dir = ['ar', 'ur'].includes(lang) ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
        
        // تغيير نوع الخط حسب اللغة
        const fontFamily = ['ar', 'ur'].includes(lang) ? 'Amiri' : 'Roboto';
        document.documentElement.style.setProperty('--font-family', fontFamily);
        
        // إزالة الفئة النشطة من كل الأزرار
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // إضافة الفئة النشطة للزر المحدد
        const selectedBtn = document.querySelector(`[data-lang="${lang}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }

        // تحميل ملف الترجمة
        try {
            const response = await fetch(`translations/${lang}.json`);
            if (!response.ok) throw new Error('فشل تحميل ملف الترجمة');
            
            const translations = await response.json();
            
            // تحديث كل العناصر التي تحتاج للترجمة
            document.querySelectorAll('[data-translate]').forEach(element => {
                const key = element.getAttribute('data-translate');
                if (translations[key]) {
                    element.textContent = translations[key];
                }
            });

            // تحديث العناوين
            document.querySelectorAll('[data-section-title]').forEach(element => {
                const key = element.getAttribute('data-section-title');
                if (translations[key]) {
                    element.textContent = translations[key];
                }
            });

            // تحديث المحتوى
            document.querySelectorAll('[data-content]').forEach(element => {
                const key = element.getAttribute('data-content');
                if (translations[key]) {
                    element.textContent = translations[key];
                }
            });

            // تحديث النصوص الثابتة
            if (translations.static_text) {
                Object.entries(translations.static_text).forEach(([selector, text]) => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(element => {
                        element.textContent = text;
                    });
                });
            }

            // إعادة تحميل الصفحة لتطبيق التغييرات بشكل كامل
            window.location.reload();
        } catch (error) {
            console.error('خطأ في تحميل الترجمات:', error);
        }
    }
}

// تحميل الترجمات
async function loadTranslations(lang) {
    try {
        const response = await fetch(`translations/${lang}.json`);
        if (!response.ok) throw new Error('فشل تحميل ملف الترجمة');
        
        const translations = await response.json();
        updateUIText(translations);
    } catch (error) {
        console.error('خطأ في تحميل الترجمات:', error);
    }
}

// تحديث نصوص الواجهة
function updateUIText(translations) {
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[key]) {
            element.textContent = translations[key];
        }
    });
}

// إضافة مستمعي الأحداث
document.addEventListener('DOMContentLoaded', () => {
    // تحميل الإعدادات المحفوظة
    const savedLang = localStorage.getItem('language') || 'ar';
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedFontSize = localStorage.getItem('fontSize') || 'medium';
    const savedFontFamily = localStorage.getItem('fontFamily') || 'Amiri';

    // تطبيق الإعدادات المحفوظة
    changeLanguage(savedLang);
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateFontSize(savedFontSize);
    updateFontFamily(savedFontFamily);

    // تهيئة الوظائف الأخرى
    initializePrayerFeatures();
    setupPrayerNotifications();
    initQiblaCompass();
});

// تحديث حجم الخط
function updateFontSize(size) {
    // تطبيق حجم الخط فقط على المتغيرات
    document.querySelectorAll('.reading-section, .quran-text, .arabic-text, .modal-content:not(#settings-modal .modal-content)').forEach(section => {
        section.style.fontSize = size + 'px';
    });
    
    // تحديث قيمة العداد
    const fontSizeValue = document.getElementById('font-size-value');
    if (fontSizeValue) {
        fontSizeValue.textContent = size;
    }
    
    // حفظ الإعداد
    localStorage.setItem('fontSize', size);
}

// تحديث نوع الخط
function updateFontFamily(font) {
    document.documentElement.style.setProperty('--font-family', font);
    localStorage.setItem('fontFamily', font);
}

// تحديث طريقة حساب المواقيت
function updateCalculationMethod(method) {
    localStorage.setItem('calculationMethod', method);
    if (window.prayerTimesManager) {
        window.prayerTimesManager.calculationMethod = parseInt(method);
        window.prayerTimesManager.updatePrayerTimes();
    }
}

// تحديث إعدادات التنبيهات
function updateAdhanNotification(minutes) {
    localStorage.setItem('adhanNotification', minutes);
}

function togglePrayerNotifications(enabled) {
    localStorage.setItem('prayerNotifications', enabled);
    if (enabled) {
        requestNotificationPermission();
    }
}

function toggleAthkarNotifications(enabled) {
    localStorage.setItem('athkarNotifications', enabled);
    if (enabled) {
        requestNotificationPermission();
    }
}

// طلب إذن التنبيهات
async function requestNotificationPermission() {
    if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    return false;
}

// تغيير اللغة
function changeLanguage(lang) {
    const currentLang = localStorage.getItem('language') || 'ar';
    if (currentLang !== lang) {
        localStorage.setItem('language', lang);
        
        // إزالة الفئة النشطة من كل الأزرار
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // إضافة الفئة النشطة للزر المحدد
        const selectedBtn = document.querySelector(`[data-lang="${lang}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }

        // تحميل ملف الترجمة
        loadTranslations(lang);
    }
}

// تحميل الترجمات
async function loadTranslations(lang) {
    try {
        const response = await fetch(`translations/${lang}.json`);
        if (!response.ok) throw new Error('فشل تحميل ملف الترجمة');
        
        const translations = await response.json();
        updateUIText(translations);
    } catch (error) {
        console.error('خطأ في تحميل الترجمات:', error);
    }
}

// تحديث نصوص الواجهة
function updateUIText(translations) {
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[key]) {
            element.textContent = translations[key];
        }
    });
}

// إضافة مستمعي الأحداث
document.addEventListener('DOMContentLoaded', () => {
    // تحميل الإعدادات المحفوظة
    const savedLang = localStorage.getItem('language') || 'ar';
    const savedMethod = localStorage.getItem('calculationMethod') || '5';
    const savedAdhanNotification = localStorage.getItem('adhanNotification') || '0';
    const savedFontSize = localStorage.getItem('fontSize') || '16';
    const savedFontFamily = localStorage.getItem('fontFamily') || 'Amiri';
    const prayerNotifications = localStorage.getItem('prayerNotifications') === 'true';
    const athkarNotifications = localStorage.getItem('athkarNotifications') === 'true';

    // تطبيق الإعدادات المحفوظة
    changeLanguage(savedLang);
    updateCalculationMethod(savedMethod);
    updateAdhanNotification(savedAdhanNotification);
    updateFontSize(savedFontSize);
    updateFontFamily(savedFontFamily);
    
    // تحديث حالة زر التنبيهات
    document.getElementById('prayer-notifications').checked = prayerNotifications;
    document.getElementById('athkar-notifications').checked = athkarNotifications;
    
    // إضافة مستمعي أحداث لأزرار اللغة
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            changeLanguage(lang);
        });
    });
});

// تحميل الإعدادات عند بدء التطبيق
document.addEventListener('DOMContentLoaded', loadSavedSettings);

// تحديث حجم الخط
function updateFontSize(size) {
    // تطبيق حجم الخط فقط على المتغيرات
    document.querySelectorAll('.reading-section, .quran-text, .arabic-text, .modal-content:not(#settings-modal .modal-content)').forEach(section => {
        section.style.fontSize = size + 'px';
    });
    
    // تحديث قيمة العداد
    const fontSizeValue = document.getElementById('font-size-value');
    if (fontSizeValue) {
        fontSizeValue.textContent = size;
    }
    
    // حفظ الإعداد
    localStorage.setItem('fontSize', size);
}

// تحديث نوع الخط
function updateFontFamily(font) {
    document.documentElement.style.setProperty('--font-family', font);
    localStorage.setItem('fontFamily', font);
}

// تحديث طريقة حساب المواقيت
function updateCalculationMethod(method) {
    localStorage.setItem('calculationMethod', method);
    if (window.prayerTimesManager) {
        window.prayerTimesManager.calculationMethod = parseInt(method);
        window.prayerTimesManager.updatePrayerTimes();
    }
}

// تحديث إعدادات التنبيهات
function updateAdhanNotification(minutes) {
    localStorage.setItem('adhanNotification', minutes);
}

function togglePrayerNotifications(enabled) {
    localStorage.setItem('prayerNotifications', enabled);
    if (enabled) {
        requestNotificationPermission();
    }
}

function toggleAthkarNotifications(enabled) {
    localStorage.setItem('athkarNotifications', enabled);
    if (enabled) {
        requestNotificationPermission();
    }
}

// طلب إذن التنبيهات
async function requestNotificationPermission() {
    if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    return false;
}

// تغيير اللغة
function changeLanguage(lang) {
    const currentLang = localStorage.getItem('language') || 'ar';
    if (currentLang !== lang) {
        localStorage.setItem('language', lang);
        
        // إزالة الفئة النشطة من كل الأزرار
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // إضافة الفئة النشطة للزر المحدد
        const selectedBtn = document.querySelector(`[data-lang="${lang}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }

        // تحميل ملف الترجمة
        loadTranslations(lang);
    }
}

// تحميل الترجمات
async function loadTranslations(lang) {
    try {
        const response = await fetch(`translations/${lang}.json`);
        if (!response.ok) throw new Error('فشل تحميل ملف الترجمة');
        
        const translations = await response.json();
        updateUIText(translations);
    } catch (error) {
        console.error('خطأ في تحميل الترجمات:', error);
    }
}

// تحديث نصوص الواجهة
function updateUIText(translations) {
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[key]) {
            element.textContent = translations[key];
        }
    });
}

// إضافة مستمعي الأحداث
document.addEventListener('DOMContentLoaded', () => {
    // تحميل الإعدادات المحفوظة
    const savedLang = localStorage.getItem('language') || 'ar';
    const savedMethod = localStorage.getItem('calculationMethod') || '5';
    const savedAdhanNotification = localStorage.getItem('adhanNotification') || '0';
    const savedFontSize = localStorage.getItem('fontSize') || '16';
    const savedFontFamily = localStorage.getItem('fontFamily') || 'Amiri';
    const prayerNotifications = localStorage.getItem('prayerNotifications') === 'true';
    const athkarNotifications = localStorage.getItem('athkarNotifications') === 'true';

    // تطبيق الإعدادات المحفوظة
    changeLanguage(savedLang);
    updateCalculationMethod(savedMethod);
    updateAdhanNotification(savedAdhanNotification);
    updateFontSize(savedFontSize);
    updateFontFamily(savedFontFamily);
    
    // تحديث حالة زر التنبيهات
    document.getElementById('prayer-notifications').checked = prayerNotifications;
    document.getElementById('athkar-notifications').checked = athkarNotifications;
    
    // إضافة مستمعي أحداث لأزرار اللغة
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            changeLanguage(lang);
        });
    });
});

// تهيئة البوصلة واتجاه القبلة
function initQiblaCompass() {
    if ('DeviceOrientationEvent' in window) {
        // طلب الإذن في iOS 13+
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        enableCompass();
                    }
                })
                .catch(console.error);
        } else {
            // للأجهزة الأخرى
            enableCompass();
        }
    } else {
        document.querySelector('.qibla-accuracy').textContent = 'عذراً، جهازك لا يدعم البوصلة';
    }
}

function enableCompass() {
    window.addEventListener('deviceorientationabsolute', handleOrientation, true);
    window.addEventListener('deviceorientation', handleOrientation, true);
}

function handleOrientation(event) {
    let heading = null;
    
    // الحصول على الاتجاه من مختلف أنواع الأجهزة
    if (event.webkitCompassHeading) {
        // للأجهزة iOS
        heading = event.webkitCompassHeading;
    } else if (event.alpha) {
        // للأجهزة الأخرى
        heading = 360 - event.alpha;
    }

    if (heading !== null) {
        updateQiblaCompass(heading);
    }
}

// تحديث البوصلة واتجاه القبلة
function updateQiblaCompass(heading) {
    const arrow = document.querySelector('.compass-arrow');
    const accuracy = document.getElementById('qiblaAccuracy');
    
    if (arrow && accuracy) {
        // الحصول على الموقع الحالي
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                const qiblaDirection = calculateQiblaDirection(latitude, longitude);
                
                // تحديث اتجاه السهم
                const rotation = qiblaDirection - heading;
                arrow.style.transform = `rotate(${rotation}deg)`;
                
                // تحديث نص الدقة
                const accuracyValue = Math.min(100, Math.round((1 - Math.abs(rotation % 360) / 360) * 100));
                accuracy.textContent = accuracyValue + '%';
            },
            error => {
                console.error('خطأ في تحديد الموقع:', error);
                accuracy.textContent = 'يرجى تفعيل خدمة الموقع';
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    }
}

// حساب اتجاه القبلة
function calculateQiblaDirection(latitude, longitude) {
    // إحداثيات الكعبة
    const KAABA_LAT = 21.4225;
    const KAABA_LNG = 39.8262;
    
    // تحويل الإحداثيات إلى راديان
    const lat1 = toRadians(latitude);
    const lat2 = toRadians(KAABA_LAT);
    const dLng = toRadians(KAABA_LNG - longitude);
    
    // حساب اتجاه القبلة
    const y = Math.sin(dLng);
    const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(dLng);
    let qibla = toDegrees(Math.atan2(y, x));
    
    // تحويل النتيجة إلى درجات موجبة (0-360)
    return (qibla + 360) % 360;
}

// تحويل الدرجات إلى راديان
function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

// تحويل الراديان إلى درجات
function toDegrees(radians) {
    return radians * 180 / Math.PI;
}
