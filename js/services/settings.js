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

// تحديث قائمة الإضافات النشطة
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

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
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
});
