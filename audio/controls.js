// التحكم في تقديم وتأخير الصوت
function seekAudio(seconds) {
    const player = document.getElementById('quranPlayer');
    if (player && player.contentWindow) {
        try {
            // الحصول على مشغل الصوت داخل الـ iframe
            const audio = player.contentWindow.document.querySelector('audio');
            if (audio) {
                // تحديث وقت التشغيل
                audio.currentTime = Math.max(0, audio.currentTime + seconds);
            }
        } catch (e) {
            console.log('لا يمكن الوصول إلى مشغل الصوت داخل الـ iframe');
        }
    }
}

// إضافة اختصارات لوحة المفاتيح
document.addEventListener('keydown', function(e) {
    // السهم الأيمن: تقديم 10 ثواني
    if (e.key === 'ArrowRight') {
        seekAudio(10);
    }
    // السهم الأيسر: تأخير 10 ثواني
    else if (e.key === 'ArrowLeft') {
        seekAudio(-10);
    }
});
