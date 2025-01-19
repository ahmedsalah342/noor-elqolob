// تكوين اللغات المدعومة
const supportedLanguages = {
    ar: {
        name: 'العربية',
        flag: 'flags/sa.png',
        direction: 'rtl'
    },
    en: {
        name: 'English',
        flag: 'flags/gb.png',
        direction: 'ltr'
    },
    tr: {
        name: 'Türkçe',
        flag: 'flags/tr.png',
        direction: 'ltr'
    },
    ur: {
        name: 'اردو',
        flag: 'flags/pk.png',
        direction: 'rtl'
    },
    id: {
        name: 'Bahasa Indonesia',
        flag: 'flags/id.png',
        direction: 'ltr'
    },
    fr: {
        name: 'Français',
        flag: 'flags/fr.png',
        direction: 'ltr'
    }
};

// تحميل الترجمات
async function loadTranslations(lang) {
    try {
        const response = await fetch(`translations/${lang}.json`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error loading translations:', error);
        return null;
    }
}

// تغيير اللغة
async function changeLanguage(lang) {
    if (!supportedLanguages[lang]) {
        console.error('Language not supported:', lang);
        return;
    }

    // تحميل ملف الترجمة
    const translations = await loadTranslations(lang);
    if (!translations) return;

    // تحديث اتجاه الصفحة
    document.documentElement.dir = supportedLanguages[lang].direction;
    document.documentElement.lang = lang;

    // تحديث النصوص
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[key]) {
            element.textContent = translations[key];
        }
    });

    // تحديث العنوان
    document.title = translations.app_title || 'زاد المسلم';

    // حفظ اللغة المختارة
    localStorage.setItem('selectedLanguage', lang);
}

// تهيئة اللغة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // إضافة الأعلام إلى قائمة اللغات
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.innerHTML = Object.entries(supportedLanguages)
            .map(([code, lang]) => `
                <option value="${code}" ${code === 'ar' ? 'selected' : ''}>
                    <img src="${lang.flag}" alt="${lang.name}" class="language-flag">
                    ${lang.name}
                </option>
            `).join('');
    }

    // تحميل اللغة المحفوظة أو الافتراضية
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'ar';
    changeLanguage(savedLanguage);
});
