// ثوابت التطبيق
const NOTIFICATION_SETTINGS = {
    STORAGE_KEY: 'prayerNotificationSettings',
    DEFAULT_BEFORE_PRAYER: '15',
    DEFAULT_REMINDER_DELAY: '20',
    DEFAULT_NOTIFICATIONS_ENABLED: true,
    DEFAULT_ADHAN: 'makkah',
    DEFAULT_VOLUME: 70
};

let isPreviewPlaying = false;

// معاينة صوت الأذان
function previewAdhan() {
    const previewButton = document.getElementById('previewAdhan');
    const stopButton = document.getElementById('stopAdhan');
    const muadhin = document.getElementById('muadhin').value;
    const volume = document.getElementById('adhanVolume').value / 100;
    
    if (!isPreviewPlaying) {
        // التأكد من وجود مدير الصوت
        if (!window.audioManager) {
            window.audioManager = new AudioManager();
        }
        
        try {
            // تشغيل الأذان
            window.audioManager.playAdhan(muadhin, volume);
            isPreviewPlaying = true;
            
            // تحديث حالة الأزرار
            previewButton.style.display = 'none';
            stopButton.style.display = 'inline-block';
            
            // إضافة مستمع لإنتهاء الصوت
            window.audioManager.audio.addEventListener('ended', stopPreview);
        } catch (error) {
            console.error('خطأ في تشغيل الأذان:', error);
        }
    }
}

// إيقاف المعاينة
function stopPreview() {
    const previewButton = document.getElementById('previewAdhan');
    const stopButton = document.getElementById('stopAdhan');
    
    if (window.audioManager) {
        window.audioManager.stopAdhan();
        // إزالة مستمع الإنتهاء
        window.audioManager.audio.removeEventListener('ended', stopPreview);
    }
    
    isPreviewPlaying = false;
    previewButton.style.display = 'inline-block';
    stopButton.style.display = 'none';
}

// تحديث عرض الوضع الصامت
function updateSilentModeDisplay() {
    const silentMode = document.getElementById('silentMode');
    const silentModeTimesDiv = document.querySelector('.silent-mode-times');
    
    if (silentMode.checked) {
        silentModeTimesDiv.style.display = 'block';
    } else {
        silentModeTimesDiv.style.display = 'none';
    }
}

// حفظ إعدادات الأذان والتنبيهات
function saveSettings() {
    const settings = {
        muadhin: document.getElementById('muadhin').value,
        volume: document.getElementById('adhanVolume').value,
        beforePrayerTime: document.getElementById('beforePrayerTime').value,
        prayerConfirmation: document.getElementById('prayerConfirmation').value,
        notifications: {
            sound: document.getElementById('soundNotification').checked,
            vibration: document.getElementById('vibrationNotification').checked,
            screen: document.getElementById('screenNotification').checked
        },
        silentMode: {
            enabled: document.getElementById('silentMode').checked,
            startTime: document.getElementById('silentModeStart').value,
            endTime: document.getElementById('silentModeEnd').value
        }
    };
    
    localStorage.setItem('prayerSettings', JSON.stringify(settings));
}

// استرجاع الإعدادات
function loadSettings() {
    try {
        const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {
            muadhin: NOTIFICATION_SETTINGS.DEFAULT_ADHAN,
            volume: NOTIFICATION_SETTINGS.DEFAULT_VOLUME,
            beforePrayerTime: NOTIFICATION_SETTINGS.DEFAULT_BEFORE_PRAYER,
            prayerConfirmation: NOTIFICATION_SETTINGS.DEFAULT_REMINDER_DELAY,
            notifications: {
                sound: NOTIFICATION_SETTINGS.DEFAULT_NOTIFICATIONS_ENABLED,
                vibration: NOTIFICATION_SETTINGS.DEFAULT_NOTIFICATIONS_ENABLED,
                screen: NOTIFICATION_SETTINGS.DEFAULT_NOTIFICATIONS_ENABLED
            },
            silentMode: {
                enabled: false,
                startTime: '22:00',
                endTime: '05:00'
            }
        };

        // تعيين قيم المؤذن ومستوى الصوت
        document.getElementById('muadhin').value = settings.muadhin;
        document.getElementById('adhanVolume').value = settings.volume;
        document.querySelector('.volume-value').textContent = settings.volume + '%';

        // تعيين قيم التنبيهات
        document.getElementById('beforePrayerTime').value = settings.beforePrayerTime;
        document.getElementById('prayerConfirmation').value = settings.prayerConfirmation;
        
        // تعيين حالة صناديق الاختيار
        document.getElementById('soundNotification').checked = settings.notifications.sound;
        document.getElementById('vibrationNotification').checked = settings.notifications.vibration;
        document.getElementById('screenNotification').checked = settings.notifications.screen;

        // تعيين إعدادات الوضع الصامت
        document.getElementById('silentMode').checked = settings.silentMode.enabled;
        document.getElementById('silentModeStart').value = settings.silentMode.startTime;
        document.getElementById('silentModeEnd').value = settings.silentMode.endTime;
        updateSilentModeDisplay();
    } catch (error) {
        console.error('خطأ في تحميل الإعدادات:', error);
    }
}

// تهيئة الإعدادات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    try {
        // تحميل الإعدادات المحفوظة
        loadSettings();
        
        // إضافة مستمعي الأحداث للمؤذن ومستوى الصوت
        document.getElementById('muadhin')?.addEventListener('change', saveSettings);
        document.getElementById('adhanVolume')?.addEventListener('input', (e) => {
            document.querySelector('.volume-value').textContent = e.target.value + '%';
            
            // تحديث مستوى الصوت أثناء التشغيل
            if (isPreviewPlaying && window.audioManager) {
                window.audioManager.setVolume(e.target.value / 100);
            }
            
            saveSettings();
        });
        
        // إضافة مستمعي الأحداث لأزرار المعاينة
        document.getElementById('previewAdhan')?.addEventListener('click', previewAdhan);
        document.getElementById('stopAdhan')?.addEventListener('click', stopPreview);
        
        // إضافة مستمعي أحداث للتنبيهات
        document.getElementById('beforePrayerTime')?.addEventListener('change', saveSettings);
        document.getElementById('prayerConfirmation')?.addEventListener('change', saveSettings);
        document.getElementById('soundNotification')?.addEventListener('change', saveSettings);
        document.getElementById('vibrationNotification')?.addEventListener('change', saveSettings);
        document.getElementById('screenNotification')?.addEventListener('change', saveSettings);

        // إضافة مستمعي أحداث للوضع الصامت
        document.getElementById('silentMode')?.addEventListener('change', () => {
            updateSilentModeDisplay();
            saveSettings();
        });
        document.getElementById('silentModeStart')?.addEventListener('change', saveSettings);
        document.getElementById('silentModeEnd')?.addEventListener('change', saveSettings);
    } catch (error) {
        console.error('خطأ في تهيئة الإعدادات:', error);
    }
});
