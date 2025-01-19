// تحديث الساعة الرقمية والتناظرية
function updateClocks() {
    const now = new Date();
    let hours = now.getHours() % 12;
    hours = hours ? hours : 12; // تحويل 0 إلى 12
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    // تحديث الساعة الرقمية
    const digitalClock = document.querySelector('.digital-clock');
    if (digitalClock) {
        digitalClock.textContent = `${hours}:${minutes}:${seconds}`;
    }
    
    // تحديث الساعة التناظرية
    const hourHand = document.querySelector('.analog-clock .hour');
    const minuteHand = document.querySelector('.analog-clock .minute');
    const secondHand = document.querySelector('.analog-clock .second');
    
    if (hourHand && minuteHand && secondHand) {
        const hourDegrees = ((hours % 12) * 30) + (minutes * 0.5);
        const minuteDegrees = minutes * 6;
        const secondDegrees = seconds * 6;
        
        hourHand.style.transform = `rotate(${hourDegrees}deg)`;
        minuteHand.style.transform = `rotate(${minuteDegrees}deg)`;
        secondHand.style.transform = `rotate(${secondDegrees}deg)`;
    }
}

// تحديث الساعتين كل ثانية
setInterval(updateClocks, 1000);

// تحديث الساعتين عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    updateClocks();
});
