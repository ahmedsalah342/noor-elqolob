// ثوابت التطبيق
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

function toggleAdhan() {
    console.log('تم الضغط على زر التشغيل/الإيقاف');
    
    const button = document.getElementById('toggleAdhan');
    if (!button) {
        console.error('لم يتم العثور على زر التشغيل');
        return;
    }

    const icon = button.querySelector('.toggle-icon i');
    const text = button.querySelector('.toggle-text');
    
    if (!isPlaying) {
        console.log('محاولة تشغيل الأذان...');
        const muadhin = document.getElementById('muadhin').value;
        const volume = document.getElementById('adhanVolume').value / 100;
        
        console.log('المؤذن:', muadhin);
        console.log('مستوى الصوت:', volume);
        
        try {
            if (!window.audioManager) {
                console.error('مدير الصوت غير موجود!');
                return;
            }
            
            window.audioManager.playAdhan(muadhin, volume);
            isPlaying = true;
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
            text.textContent = 'إيقاف';
            button.classList.add('playing');
            console.log('تم تشغيل الأذان بنجاح');
        } catch (error) {
            console.error('خطأ في تشغيل الأذان:', error);
            alert('حدث خطأ في تشغيل الأذان');
        }
    } else {
        console.log('محاولة إيقاف الأذان...');
        try {
            window.audioManager.stopAdhan();
            isPlaying = false;
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
            text.textContent = 'معاينة الأذان';
            button.classList.remove('playing');
            console.log('تم إيقاف الأذان بنجاح');
        } catch (error) {
            console.error('خطأ في إيقاف الأذان:', error);
        }
    }
}

// إيقاف صوت الأذان
function stopAdhan() {
    window.audioManager.stopAdhan();
    isPlaying = false;
    const button = document.getElementById('toggleAdhan');
    if (button) {
        const icon = button.querySelector('.toggle-icon i');
        const text = button.querySelector('.toggle-text');
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
        text.textContent = 'معاينة الأذان';
        button.classList.remove('playing');
    }
}

// تهيئة الإعدادات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    console.log('تم تحميل الصفحة...');
    
    try {
        // تحميل الإعدادات المحفوظة
        loadAdhanSettings();
        console.log('تم تحميل الإعدادات بنجاح');
        
        // إضافة مستمعي الأحداث
        const muadhinSelect = document.getElementById('muadhin');
        if (muadhinSelect) {
            muadhinSelect.addEventListener('change', saveAdhanSettings);
            console.log('تم إضافة مستمع التغيير للمؤذن');
        }
        
        const volumeInput = document.getElementById('adhanVolume');
        if (volumeInput) {
            volumeInput.addEventListener('input', (e) => {
                const volumeValue = document.querySelector('.volume-value');
                if (volumeValue) {
                    volumeValue.textContent = e.target.value + '%';
                }
                
                if (isPlaying && window.audioManager) {
                    window.audioManager.setVolume(e.target.value / 100);
                }
                
                saveAdhanSettings();
            });
            console.log('تم إضافة مستمع تغيير مستوى الصوت');
        }
        
        // إضافة مستمع الحدث للزر
        const toggleButton = document.getElementById('toggleAdhan');
        if (toggleButton) {
            toggleButton.addEventListener('click', toggleAdhan);
            console.log('تم إضافة مستمع النقر لزر التشغيل');
            
            if (window.audioManager && window.audioManager.audio) {
                window.audioManager.audio.addEventListener('ended', () => {
                    console.log('انتهى تشغيل الأذان');
                    isPlaying = false;
                    const icon = toggleButton.querySelector('.toggle-icon i');
                    const text = toggleButton.querySelector('.toggle-text');
                    icon.classList.remove('fa-pause');
                    icon.classList.add('fa-play');
                    text.textContent = 'معاينة الأذان';
                    toggleButton.classList.remove('playing');
                });
                console.log('تم إضافة مستمع انتهاء الصوت');
            } else {
                console.error('مدير الصوت أو عنصر الصوت غير موجود!');
            }
        } else {
            console.error('لم يتم العثور على زر التشغيل!');
        }
        
        // إضافة مستمعي أحداث لباقي عناصر التحكم
        const elements = [
            'soundNotification',
            'vibrationNotification',
            'screenNotification',
            'beforePrayerTime',
            'prayerConfirmation'
        ];
        
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', saveAdhanSettings);
                console.log(`تم إضافة مستمع التغيير لـ ${id}`);
            }
        });
    } catch (error) {
        console.error('خطأ في تهيئة الإعدادات:', error);
    }
});
