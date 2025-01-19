// تكوين مشغل الصوت
document.addEventListener('DOMContentLoaded', function() {
    const audioPlayer = new Plyr('#kahfAudio', {
        controls: [
            'play',
            'progress',
            'current-time',
            'duration',
            'mute',
            'volume'
        ],
        i18n: {
            play: 'تشغيل',
            pause: 'إيقاف',
            mute: 'كتم الصوت',
            unmute: 'تشغيل الصوت'
        }
    });
});
