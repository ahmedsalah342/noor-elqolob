// الترجمات
const translations = {
    'ar': {
        "app_title": "زاد المسلم",
        "settings": "الإعدادات",
        "brightness": "السطوع",
        "notifications": "التنبيهات",
        "language": "اللغة",
        "prayer_times": "مواقيت الصلاة",
        "qibla": "اتجاه القبلة",
        "ruqya_sunnah": "الرقية بالسنة",
        "ruqya_quran": "الرقية بالقرآن",
        "surah_mulk": "سورة الملك",
        "prophets_stories": "قصص الأنبياء",
        "prophet_seerah": "السيرة النبوية",
        "surah_kahf": "سورة الكهف",
        "scholars": "أعلام الأمة",
        "companions": "قصص الصحابة",
        "about": "من نحن",
        "contact": "اتصل بنا"
    },
    'en': {
        "app_title": "Muslim's Provision",
        "settings": "Settings",
        "brightness": "Brightness",
        "notifications": "Notifications",
        "language": "Language",
        "prayer_times": "Prayer Times",
        "qibla": "Qibla Direction",
        "ruqya_sunnah": "Ruqya from Sunnah",
        "ruqya_quran": "Ruqya from Quran",
        "surah_mulk": "Surah Al-Mulk",
        "prophets_stories": "Prophets Stories",
        "prophet_seerah": "Prophet's Biography",
        "surah_kahf": "Surah Al-Kahf",
        "scholars": "Islamic Scholars",
        "companions": "Companions Stories",
        "about": "About Us",
        "contact": "Contact Us"
    }
};

// تكوين اللغات المدعومة
const supportedLanguages = {
    'ar': {
        name: 'العربية',
        direction: 'rtl',
        font: 'Noto Sans Arabic'
    },
    'en': {
        name: 'English',
        direction: 'ltr',
        font: 'Roboto'
    }
};

// تحديث اتجاه الصفحة وخطها
function updatePageDirection(lang) {
    console.log('Updating page direction for:', lang);
    const dir = supportedLanguages[lang].direction;
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    document.body.style.fontFamily = supportedLanguages[lang].font;
}

// تحديث النصوص في الصفحة
function updatePageContent(lang) {
    console.log('Updating page content for:', lang);
    const elements = document.querySelectorAll('[data-translate]');
    console.log('Found elements to translate:', elements.length);
    
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        console.log('Translating element:', key);
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
            console.log('Translated:', key, 'to:', translations[lang][key]);
        } else {
            console.warn('Missing translation for:', key);
        }
    });
}

// تغيير اللغة
function changeLanguage(lang) {
    console.log('Changing language to:', lang);
    
    if (!supportedLanguages[lang]) {
        console.error(`Language ${lang} is not supported`);
        return;
    }

    // حفظ اللغة المختارة
    localStorage.setItem('selectedLanguage', lang);
    console.log('Language saved to localStorage');

    // تحديث اتجاه الصفحة والخط
    updatePageDirection(lang);

    // تحديث النصوص
    updatePageContent(lang);
    
    console.log('Language change completed');
}

// تهيئة اللغة عند تحميل الصفحة
function initializeLanguage() {
    console.log('Initializing language...');
    // استرجاع اللغة المحفوظة أو استخدام العربية كلغة افتراضية
    const savedLang = localStorage.getItem('selectedLanguage') || 'ar';
    console.log('Saved/default language:', savedLang);
    
    changeLanguage(savedLang);

    // تحديث قائمة اختيار اللغة
    const langSelect = document.getElementById('language-select');
    if (langSelect) {
        langSelect.value = savedLang;
        console.log('Language selector updated');
    } else {
        console.warn('Language selector not found');
    }
}

// تحميل اللغة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initializeLanguage);
