// حفظ إعدادات المظهر في localStorage
function saveAppearanceSettings() {
    const brightness = document.getElementById('brightnessSlider').value;
    const fontSize = document.getElementById('fontSizeSlider').value;
    const fontFamily = document.getElementById('fontSelector').value;

    localStorage.setItem('brightness', brightness);
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('fontFamily', fontFamily);
}

// استرجاع إعدادات المظهر من localStorage
function loadAppearanceSettings() {
    const brightness = localStorage.getItem('brightness') || '100';
    const fontSize = localStorage.getItem('fontSize') || '16';
    const fontFamily = localStorage.getItem('fontFamily') || 'Amiri';

    document.getElementById('brightnessSlider').value = brightness;
    document.getElementById('fontSizeSlider').value = fontSize;
    document.getElementById('fontSelector').value = fontFamily;

    updateBrightness(brightness);
    updateFontSize(fontSize);
    updateFontFamily(fontFamily);
}

// تحديث مستوى الإضاءة
function updateBrightness(value) {
    document.querySelector('.brightness-value').textContent = value + '%';
    document.documentElement.style.filter = `brightness(${value}%)`;
    saveAppearanceSettings();
}

// تحديث حجم الخط
function updateFontSize(size) {
    document.querySelector('.font-size-value').textContent = size;
    document.documentElement.style.setProperty('--base-font-size', size + 'px');
    saveAppearanceSettings();
}

// تحديث نوع الخط
function updateFontFamily(font) {
    document.documentElement.style.setProperty('--font-family', font);
    saveAppearanceSettings();
}

// تحميل الإعدادات عند بدء التطبيق
document.addEventListener('DOMContentLoaded', () => {
    loadAppearanceSettings();
});
