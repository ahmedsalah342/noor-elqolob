class PrayerTimesManager {
    constructor() {
        this.API_URL = 'https://api.aladhan.com/v1/timings';
        this.lastUpdate = null;
        this.timings = null;
        this.coordinates = null;
        this.locationInfo = null;
        this.calculationMethod = 5; // Egyptian General Authority of Survey
        
        this.initialize();
    }

    async initialize() {
        try {
            // محاولة تحميل الأوقات المحفوظة
            const savedData = localStorage.getItem('prayerTimes');
            if (savedData) {
                const { timings, coordinates, lastUpdate } = JSON.parse(savedData);
                const lastUpdateDate = new Date(lastUpdate);
                const now = new Date();
                
                // إذا كانت الأوقات المحفوظة من نفس اليوم
                if (lastUpdateDate.toDateString() === now.toDateString()) {
                    this.timings = timings;
                    this.coordinates = coordinates;
                    this.lastUpdate = lastUpdateDate;
                    console.log('Loaded saved prayer times:', this.timings);
                }
            }

            // تحديث الساعة الرقمية والتناظرية
            this.updateDigitalClock();
            this.initAnalogClock();
            setInterval(() => this.updateDigitalClock(), 1000);
            
            // الحصول على الموقع وتحديث الأوقات
            await this.getUserLocation();
            
            // تحديث الوقت المتبقي كل دقيقة
            this.updateRemainingTime();
            setInterval(() => this.updateRemainingTime(), 60000);
            
            // تحديث أوقات الصلاة كل ساعة
            setInterval(() => this.updatePrayerTimes(), 3600000);

            // تحديث فوري للأوقات إذا لم تكن هناك أوقات محفوظة
            if (!this.timings) {
                await this.updatePrayerTimes();
            }

        } catch (error) {
            console.error('خطأ في التهيئة:', error);
        }
    }

    initAnalogClock() {
        const clockContainer = document.querySelector('.analog-clock');
        if (!clockContainer) return;

        // إضافة الأرقام إذا لم تكن موجودة
        if (clockContainer.querySelectorAll('.number').length === 0) {
            for (let i = 1; i <= 12; i++) {
                const numberDiv = document.createElement('div');
                numberDiv.className = `number n${i}`;
                const span = document.createElement('span');
                span.textContent = this.toArabicNumeral(i);
                numberDiv.appendChild(span);
                clockContainer.appendChild(numberDiv);
            }
        }

        // تحديث العقارب كل ثانية
        setInterval(() => this.updateAnalogClock(), 1000);
    }

    toArabicNumeral(num) {
        const arabicNumerals = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩','١٠','١١','١٢'];
        return arabicNumerals[num];
    }

    updateAnalogClock() {
        const now = new Date();
        const hours = now.getHours() % 12;
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        const hourHand = document.querySelector('.analog-clock .hour');
        const minuteHand = document.querySelector('.analog-clock .minute');
        const secondHand = document.querySelector('.analog-clock .second');

        if (!hourHand || !minuteHand || !secondHand) return;

        const hourDeg = (hours * 30) + (minutes * 0.5);
        const minuteDeg = minutes * 6;
        const secondDeg = seconds * 6;

        hourHand.style.transform = `rotate(${hourDeg}deg)`;
        minuteHand.style.transform = `rotate(${minuteDeg}deg)`;
        secondHand.style.transform = `rotate(${secondDeg}deg)`;
    }

    formatTime(time24) {
        const [hours, minutes] = time24.split(':').map(Number);
        const period = hours >= 12 ? 'م' : 'ص';
        const hours12 = hours % 12 || 12;
        return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    }

    updateDigitalClock() {
        const now = new Date();
        const seconds = now.getSeconds();
        
        // تحديث عقرب الثواني فقط
        const secondHand = document.querySelector('.second');
        if (secondHand) {
            const secondDeg = ((seconds / 60) * 360) + 90;
            secondHand.style.transform = `rotate(${secondDeg}deg)`;
        }
    }

    async getUserLocation() {
        try {
            // إظهار رسالة للمستخدم
            const locationMessage = document.getElementById('location-message');
            
            if (!locationMessage) return;

            if (navigator.geolocation) {
                locationMessage.textContent = 'جاري تحديد موقع الصلاة...';
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        this.coordinates = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        };
                        
                        // تحديث المواقيت بعد تحديد الموقع
                        this.updatePrayerTimes();
                        
                        // إخفاء رسالة تحديد الموقع
                        locationMessage.style.display = 'none';
                    },
                    (error) => {
                        console.error('Error getting location:', error);
                        locationMessage.textContent = 'تعذر تحديد الموقع. يرجى تفعيل خدمة الموقع.';
                        locationMessage.style.color = '#ff4444';
                    }
                );
            } else {
                locationMessage.textContent = 'متصفحك لا يدعم تحديد الموقع';
                locationMessage.style.color = '#ff4444';
            }

        } catch (error) {
            console.error('خطأ في تحديد الموقع:', error);
            
            // في حالة رفض تحديد الموقع
            this.coordinates = {
                latitude: 30.0444,
                longitude: 31.2357
            };

            const errorMessage = document.createElement('div');
            errorMessage.className = 'location-message error';
            errorMessage.textContent = 'تعذر تحديد موقعك. تم استخدام الموقع الافتراضي';
            document.querySelector('.modal-content').prepend(errorMessage);
            setTimeout(() => errorMessage.remove(), 5000);

            // تحديث الأوقات بالموقع الافتراضي
            await this.updatePrayerTimes();
        }
    }

    async updatePrayerTimes() {
        try {
            if (!this.coordinates) {
                throw new Error('لم يتم تحديد الموقع بعد');
            }

            const { latitude, longitude } = this.coordinates;
            const date = new Date();
            const timestamp = Math.floor(date.getTime() / 1000);

            const response = await fetch(`${this.API_URL}/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=${this.calculationMethod}`);
            const data = await response.json();

            if (data.code === 200) {
                this.timings = data.data.timings;
                this.lastUpdate = date;
                
                // حفظ البيانات محلياً
                localStorage.setItem('prayerTimes', JSON.stringify({
                    timings: this.timings,
                    coordinates: this.coordinates,
                    lastUpdate: date
                }));

                // تحديث العرض
                this.updatePrayerTimesDisplay();
                this.updateRemainingTime();
                
                // التحقق من موعد الأذان والتنبيهات
                this.checkPrayerAlerts();
            }
        } catch (error) {
            console.error('خطأ في تحديث أوقات الصلاة:', error);
        }
    }

    updatePrayerTimesDisplay() {
        const prayerElements = document.querySelectorAll('.prayer-time');
        prayerElements.forEach(element => {
            const prayerName = element.getAttribute('data-prayer');
            const timeElement = element.querySelector('.time');
            if (timeElement && this.timings[prayerName]) {
                const formattedTime = this.formatTime(this.timings[prayerName]);
                timeElement.textContent = formattedTime;
            }
        });
    }

    checkPrayerAlerts() {
        if (!this.timings) return;

        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        // التحقق من كل وقت صلاة
        Object.entries(this.timings).forEach(([prayer, time]) => {
            if (['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(prayer)) {
                this.checkPrayerTime(prayer, time, currentTime);
            }
        });
    }

    checkPrayerTime(prayer, time, currentTime) {
        const prayerDate = new Date();
        const [prayerHours, prayerMinutes] = time.split(':');
        prayerDate.setHours(parseInt(prayerHours), parseInt(prayerMinutes), 0);

        const now = new Date();
        const timeDiff = (prayerDate - now) / (1000 * 60); // الفرق بالدقائق

        // الحصول على إعدادات التنبيهات
        const settings = JSON.parse(localStorage.getItem('prayerNotificationSettings') || '{}');
        const notificationsEnabled = settings.enabled ?? true;
        const beforePrayerTime = parseInt(settings.beforePrayerTime ?? '15');

        if (!notificationsEnabled) return;

        // تنبيه قبل الصلاة
        if (timeDiff > 0 && timeDiff <= beforePrayerTime) {
            const lastAlert = localStorage.getItem(`lastAlert_${prayer}_${now.toDateString()}`);
            if (!lastAlert) {
                this.showPrayerAlert(prayer, true);
                localStorage.setItem(`lastAlert_${prayer}_${now.toDateString()}`, 'true');
            }
        }

        // الأذان عند دخول وقت الصلاة
        if (Math.abs(timeDiff) < 1) { // في حدود دقيقة واحدة
            const lastAdhan = localStorage.getItem(`lastAdhan_${prayer}_${now.toDateString()}`);
            if (!lastAdhan) {
                this.playAdhan(prayer);
                localStorage.setItem(`lastAdhan_${prayer}_${now.toDateString()}`, 'true');
            }
        }
    }

    showPrayerAlert(prayer, isBeforePrayer = true) {
        const prayerNames = {
            Fajr: 'الفجر',
            Dhuhr: 'الظهر',
            Asr: 'العصر',
            Maghrib: 'المغرب',
            Isha: 'العشاء'
        };

        const arabicName = prayerNames[prayer];
        const message = isBeforePrayer ? 
            `اقتربت صلاة ${arabicName}` :
            `حان الآن موعد صلاة ${arabicName}`;

        // عرض إشعار
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(message, {
                icon: 'icons/prayer-icon.png',
                body: this.timings[prayer],
                silent: true // لأننا سنستخدم الصوت الخاص بنا
            });
        }

        // تشغيل صوت التنبيه
        if (window.audioManager) {
            if (isBeforePrayer) {
                window.audioManager.playPrayerReminder();
            } else {
                window.audioManager.playSalawat();
            }
        }
    }

    playAdhan(prayer) {
        if (window.audioManager) {
            const prayerNames = {
                Fajr: 'الفجر',
                Dhuhr: 'الظهر',
                Asr: 'العصر',
                Maghrib: 'المغرب',
                Isha: 'العشاء'
            };
            
            window.audioManager.playAdhan(prayerNames[prayer]);
        }
    }

    updateRemainingTime() {
        if (!this.timings) return;

        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTotalMinutes = (currentHours * 60) + currentMinutes;

        const prayers = {
            'Fajr': 'الفجر',
            'Dhuhr': 'الظهر',
            'Asr': 'العصر',
            'Maghrib': 'المغرب',
            'Isha': 'العشاء'
        };

        let nextPrayer = null;
        let minDiff = Infinity;

        for (const [prayer, arabicName] of Object.entries(prayers)) {
            if (!this.timings[prayer]) continue;

            const [prayerHours, prayerMinutes] = this.timings[prayer].split(':').map(Number);
            const prayerTotalMinutes = (prayerHours * 60) + prayerMinutes;
            
            let diff = prayerTotalMinutes - currentTotalMinutes;
            if (diff < 0) {
                diff += 24 * 60; // إضافة يوم كامل إذا كان الوقت قد مر
            }

            if (diff < minDiff) {
                minDiff = diff;
                nextPrayer = {
                    name: arabicName,
                    time: diff
                };
            }
        }

        if (nextPrayer) {
            const hours = Math.floor(nextPrayer.time / 60);
            const minutes = nextPrayer.time % 60;
            
            const nextPrayerNameElement = document.getElementById('next-prayer-name');
            const nextPrayerTimeElement = document.getElementById('next-prayer-time');
            
            if (nextPrayerNameElement && nextPrayerTimeElement) {
                nextPrayerNameElement.textContent = nextPrayer.name;
                nextPrayerTimeElement.textContent = `${hours}:${minutes.toString().padStart(2, '0')}`;
            }
        }
    }
}

// تهيئة مدير أوقات الصلاة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    console.log('بدء تهيئة مدير أوقات الصلاة...');
    window.prayerTimesManager = new PrayerTimesManager();
});
