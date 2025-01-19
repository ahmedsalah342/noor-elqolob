// Clock Module
export function initClock() {
    setupAnalogClock();
    setupDigitalClock();
    startClock();
}

function setupAnalogClock() {
    const clockContainer = document.getElementById('analog-clock');
    if (!clockContainer) return;

    // Create clock face
    const clockFace = document.createElement('div');
    clockFace.className = 'clock-face';

    // Add hour markers
    for (let i = 1; i <= 12; i++) {
        const marker = document.createElement('div');
        marker.className = 'hour-marker';
        marker.style.transform = `rotate(${i * 30}deg)`;
        clockFace.appendChild(marker);
    }

    // Add clock hands
    const hands = ['hour', 'minute', 'second'].map(type => {
        const hand = document.createElement('div');
        hand.className = `hand ${type}`;
        return hand;
    });

    hands.forEach(hand => clockFace.appendChild(hand));
    clockContainer.appendChild(clockFace);
}

function setupDigitalClock() {
    const digitalClock = document.getElementById('digital-clock');
    if (!digitalClock) return;
}

// تحديث الساعة التناظرية والرقمية
function updateClock() {
    const now = new Date();
    updateAnalogClock(now);
    updateDigitalClock(now);
    updateRemainingTime(now);
}

// تحديث الساعة التناظرية
function updateAnalogClock(now) {
    const secondHand = document.querySelector('.analog-clock .hand.second');
    const minuteHand = document.querySelector('.analog-clock .hand.minute');
    const hourHand = document.querySelector('.analog-clock .hand.hour');

    if (!secondHand || !minuteHand || !hourHand) return;

    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours();

    const secondsDegrees = ((seconds / 60) * 360);
    const minutesDegrees = ((minutes + seconds/60) / 60) * 360;
    const hoursDegrees = ((hours % 12 + minutes/60) / 12) * 360;

    secondHand.style.setProperty('--rotation', secondsDegrees);
    minuteHand.style.setProperty('--rotation', minutesDegrees);
    hourHand.style.setProperty('--rotation', hoursDegrees);
}

// تحديث الساعة الرقمية
function updateDigitalClock(now) {
    const digitalClock = document.querySelector('.digital-clock');
    if (!digitalClock) return;

    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    digitalClock.textContent = `${hours}:${minutes}:${seconds}`;
}

// تحديث الوقت المتبقي
function updateRemainingTime(now) {
    const nextPrayerElement = document.querySelector('.next-prayer');
    const timeRemainingElement = document.querySelector('.time-remaining');
    
    if (!nextPrayerElement || !timeRemainingElement) return;

    // الحصول على وقت الصلاة التالية
    const prayerTimes = getPrayerTimes();
    const { nextPrayer, remainingTime } = getNextPrayer(now, prayerTimes);
    
    // تحديث اسم الصلاة التالية
    nextPrayerElement.textContent = getPrayerNameInArabic(nextPrayer);
    
    // تحديث الوقت المتبقي
    const hours = Math.floor(remainingTime / 3600000);
    const minutes = Math.floor((remainingTime % 3600000) / 60000);
    const seconds = Math.floor((remainingTime % 60000) / 1000);
    
    timeRemainingElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateRemainingTime() {
    const now = new Date();
    const nextPrayer = getNextPrayer();
    if (nextPrayer) {
        const remainingTime = calculateRemainingTime(nextPrayer.time);
        document.querySelector('.prayer-time').textContent = remainingTime;
        document.querySelector('#remaining-prayer-name').textContent = nextPrayer.name;
    }
}

// تحويل اسم الصلاة إلى العربية
function getPrayerNameInArabic(prayer) {
    const prayerNames = {
        'Fajr': 'الفجر',
        'Dhuhr': 'الظهر',
        'Asr': 'العصر',
        'Maghrib': 'المغرب',
        'Isha': 'العشاء'
    };
    return prayerNames[prayer] || prayer;
}

// تحديث الساعة كل ثانية
function startClock() {
    updateClock();
    setInterval(updateClock, 1000);
}

function updateDate() {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const months = ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    
    const now = new Date();
    const dayName = days[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();

    document.querySelectorAll('.day-name').forEach(el => {
        el.textContent = dayName;
    });
    
    document.querySelectorAll('.date').forEach(el => {
        el.textContent = `${day} ${month} ${year}`;
    });
}

// Hijri Date
export function getHijriDate() {
    const today = new Date();
    
    // Convert to Hijri using a simple approximation
    // Note: For precise calculations, use a proper Hijri calendar library
    const hijriYear = Math.floor((today.getFullYear() - 622) * (33/32));
    
    // Get month and day names in Arabic
    const hijriMonths = [
        'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
        'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
        'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
    ];

    const dayNames = [
        'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء',
        'الخميس', 'الجمعة', 'السبت'
    ];

    return {
        year: hijriYear,
        month: hijriMonths[today.getMonth()],
        day: today.getDate(),
        dayName: dayNames[today.getDay()]
    };
}

// Update Hijri date display
export function updateHijriDate() {
    const hijriDateElement = document.getElementById('hijri-date');
    if (!hijriDateElement) return;

    const { year, month, day, dayName } = getHijriDate();
    hijriDateElement.textContent = `${dayName} ${day} ${month} ${year}هـ`;
}

// تحديث التاريخ كل دقيقة
setInterval(updateDate, 60000);
// تحديث التاريخ عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', updateDate);

// بدء تشغيل الساعة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', startClock);
