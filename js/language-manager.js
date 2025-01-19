// مدير اللغات
class LanguageManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('appLanguage') || 'ar';
        this.translations = null;
        this.rtlLanguages = ['ar', 'ur'];
        this.initialized = false;
    }

    // تهيئة مدير اللغات
    async initialize() {
        if (this.initialized) return;
        
        await this.loadTranslations(this.currentLanguage);
        this.updatePageDirection();
        this.initialized = true;
        
        // تحديث القائمة المنسدلة
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.value = this.currentLanguage;
        }
    }

    // تحميل ملف الترجمة
    async loadTranslations(lang) {
        try {
            console.log('Loading translations for:', lang);
            const response = await fetch(`languages/${lang}.json`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.translations = await response.json();
            console.log('Translations loaded successfully');
            return true;
        } catch (error) {
            console.error('Error loading translations:', error);
            return false;
        }
    }

    // تحديث اتجاه الصفحة
    updatePageDirection() {
        const dir = this.rtlLanguages.includes(this.currentLanguage) ? 'rtl' : 'ltr';
        document.documentElement.dir = dir;
        document.documentElement.lang = this.currentLanguage;
        
        // تحديث الخط حسب اللغة
        if (this.rtlLanguages.includes(this.currentLanguage)) {
            document.body.style.fontFamily = "'Amiri', 'Traditional Arabic', serif";
        } else {
            document.body.style.fontFamily = "'Segoe UI', 'Roboto', sans-serif";
        }
    }

    // تحديث النصوص في الصفحة
    updatePageContent() {
        if (!this.translations) return;

        // تحديث العناصر التي تحتوي على data-translate
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (this.translations[key]) {
                element.textContent = this.translations[key];
            }
        });

        // تحديث العناوين في الأقسام
        document.querySelectorAll('[data-section-title]').forEach(element => {
            const key = element.getAttribute('data-section-title');
            if (this.translations[key]) {
                element.textContent = this.translations[key];
            }
        });

        // تحديث النصوص في الأقسام
        document.querySelectorAll('[data-content]').forEach(element => {
            const key = element.getAttribute('data-content');
            if (this.translations[key]) {
                element.textContent = this.translations[key];
            }
        });

        // تحديث عنوان الصفحة
        if (this.translations.app_title) {
            document.title = this.translations.app_title;
        }
    }

    // تغيير اللغة
    async changeLanguage(lang) {
        console.log('Changing language to:', lang);
        
        if (this.currentLanguage === lang) {
            console.log('Language is already set to:', lang);
            return;
        }

        const success = await this.loadTranslations(lang);
        if (!success) {
            console.error('Failed to load language:', lang);
            return;
        }

        this.currentLanguage = lang;
        localStorage.setItem('appLanguage', lang);
        
        this.updatePageDirection();
        this.updatePageContent();
        
        // تحديث واجهة المستخدم
        const event = new CustomEvent('languageChanged', { detail: { language: lang } });
        document.dispatchEvent(event);
        
        console.log('Language changed successfully to:', lang);
    }

    // الحصول على النص المترجم
    translate(key) {
        return this.translations && this.translations[key] ? 
            this.translations[key] : key;
    }
}

// إنشاء كائن مدير اللغات
const languageManager = new LanguageManager();

// تهيئة مدير اللغات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    languageManager.initialize();
});

// دالة تغيير اللغة المتاحة عالمياً
function changeLanguage(lang) {
    languageManager.changeLanguage(lang);
}
