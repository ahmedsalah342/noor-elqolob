class AudioManager {
    constructor() {
        this.audio = new Audio();
        // تحديث مسارات الصوت لتتطابق مع الملفات الموجودة
        this.adhanSounds = {
            makkah: '../audio/adhan/makkah/azan.mp3',      // الحرم المكي
            madinah: '../audio/adhan/madinah/azan.mp3',    // مشاري راشد العفاسي
            tobar: '../audio/adhan/tobar/azan.mp3',        // نصر الدين طوبار
            qatami: '../audio/adhan/qatami/azan.mp3',      // ناصر القطامي
            refaat: '../audio/adhan/refaat/azan.mp3',      // محمد رفعت
            husary: '../audio/adhan/husary/azan.mp3',      // محمود الحصري
            minshawi: '../audio/adhan/minshawi/azan.mp3',  // محمد صديق المنشاوي
            basit: '../audio/adhan/basit/azan.mp3',        // عبد الباسط عبد الصمد
            quds: '../audio/adhan/quds/azan.mp3'           // أذان القدس
        };
        
        // إضافة مستمع لمعالجة الأخطاء
        this.audio.addEventListener('error', (e) => {
            console.error('خطأ في تحميل أو تشغيل الصوت:', e);
            console.log('مسار الملف الحالي:', this.audio.src);
            alert('عذراً، لم يتم العثور على ملف الصوت. يرجى التأكد من وجود الملف في المجلد الصحيح.');
        });

        // إضافة مستمع لتأكيد تحميل الملف
        this.audio.addEventListener('loadeddata', () => {
            console.log('تم تحميل ملف الصوت بنجاح');
        });

        // إضافة مستمع لبدء التحميل
        this.audio.addEventListener('loadstart', () => {
            console.log('جاري تحميل الصوت...');
        });

        // إضافة مستمع لاكتمال التشغيل
        this.audio.addEventListener('ended', () => {
            console.log('انتهى تشغيل الأذان');
        });
    }

    // تشغيل صوت الأذان
    async playAdhan(muadhin, volume = 1) {
        try {
            if (this.adhanSounds[muadhin]) {
                // إيقاف أي صوت حالي
                this.stopAdhan();
                
                // تعيين المسار ومستوى الصوت
                const audioPath = this.adhanSounds[muadhin];
                console.log('محاولة تشغيل الصوت من المسار:', audioPath);
                
                this.audio.src = audioPath;
                this.audio.volume = volume;
                
                // محاولة تشغيل الصوت
                await this.audio.play();
                console.log('تم بدء تشغيل الأذان:', muadhin);
            } else {
                console.error('لم يتم العثور على صوت الأذان المحدد:', muadhin);
                alert('عذراً، لم يتم العثور على صوت الأذان المحدد.');
            }
        } catch (error) {
            console.error('خطأ في تشغيل الأذان:', error);
            alert('عذراً، حدث خطأ في تشغيل الصوت. يرجى التأكد من وجود الملف في المجلد الصحيح.');
        }
    }

    // إيقاف صوت الأذان
    stopAdhan() {
        try {
            this.audio.pause();
            this.audio.currentTime = 0;
        } catch (error) {
            console.error('خطأ في إيقاف الصوت:', error);
        }
    }

    // تعيين مستوى الصوت
    setVolume(volume) {
        try {
            this.audio.volume = Math.min(Math.max(volume, 0), 1);
        } catch (error) {
            console.error('خطأ في تعيين مستوى الصوت:', error);
        }
    }
}

// إنشاء كائن مدير الصوت وإضافته للنافذة
window.audioManager = new AudioManager();
