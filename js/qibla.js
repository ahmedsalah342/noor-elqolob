// مدير القبلة
class QiblaManager {
    constructor() {
        this.initializeQibla();
    }

    // تهيئة القبلة
    async initializeQibla() {
        // عناصر البوصلة
        this.compass = document.querySelector('.compass-container');
        this.arrow = document.querySelector('.compass-arrow');
        this.angleDisplay = document.getElementById('qibla-angle');
        
        // الحصول على موقع المستخدم
        try {
            const position = await this.getCurrentPosition();
            const qiblaAngle = this.calculateQiblaDirection(position.coords.latitude, position.coords.longitude);
            
            // بدء تتبع البوصلة
            this.startCompassTracking(qiblaAngle);
        } catch (error) {
            console.error('خطأ في الحصول على الموقع:', error);
            this.handleLocationError(error);
        }
    }

    // عرض اتجاه القبلة الثابت في المتصفح
    showStaticQiblaDirection(qiblaAngle, position) {
        // تدوير البوصلة لتشير إلى القبلة
        if (this.compass) {
            this.compass.style.transform = `rotate(${qiblaAngle}deg)`;
        }
        
        // عرض الزاوية
        if (this.angleDisplay) {
            this.angleDisplay.textContent = Math.round(qiblaAngle) + '°';
        }
    }

    // عرض رسالة للمستخدم
    showMessage(message) {
        if (this.messageElement) {
            this.messageElement.innerHTML = message;
        }
    }

    // الحصول على الموقع الحالي
    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('خدمة تحديد الموقع غير متوفرة في متصفحك'));
                return;
            }

            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            });
        });
    }

    // حساب اتجاه القبلة
    calculateQiblaDirection(latitude, longitude) {
        // إحداثيات مكة المكرمة
        const meccaLat = 21.422487;
        const meccaLong = 39.826206;

        const yDirection = Math.sin((meccaLong - longitude) * (Math.PI / 180));
        const xDirection = Math.cos(latitude * (Math.PI / 180)) * Math.tan(meccaLat * (Math.PI / 180)) -
                          Math.sin(latitude * (Math.PI / 180)) * Math.cos((meccaLong - longitude) * (Math.PI / 180));
        
        let qiblaAngle = Math.atan2(yDirection, xDirection) * (180 / Math.PI);
        
        // تحويل الزاوية إلى قيمة موجبة
        if (qiblaAngle < 0) {
            qiblaAngle += 360;
        }

        return qiblaAngle;
    }

    // بدء تتبع البوصلة
    startCompassTracking(qiblaAngle) {
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientationabsolute', (event) => {
                this.handleDeviceOrientation(event, qiblaAngle);
            }, true);

            window.addEventListener('deviceorientation', (event) => {
                this.handleDeviceOrientation(event, qiblaAngle);
            }, true);
        } else {
            console.error('متصفحك لا يدعم حساسات التوجيه');
        }
    }

    // معالجة توجيه الجهاز
    handleDeviceOrientation(event, qiblaAngle) {
        let compass = 0;
        
        if (event.webkitCompassHeading) {
            // نظام iOS
            compass = event.webkitCompassHeading;
        } else if (event.alpha) {
            // نظام Android
            compass = event.alpha;
            if (window.screen.orientation) {
                // تصحيح الزاوية حسب اتجاه الشاشة
                const screenOrientation = window.screen.orientation.angle || 0;
                compass = (compass + screenOrientation) % 360;
            }
        }

        // حساب زاوية التوجيه
        const rotation = (360 - compass) % 360;
        const qiblaRotation = (qiblaAngle - rotation + 360) % 360;

        // تحديث واجهة المستخدم
        if (this.compass) {
            this.compass.style.transform = `rotate(${rotation}deg)`;
        }
        
        if (this.angleDisplay) {
            this.angleDisplay.textContent = Math.round(qiblaRotation) + '°';
        }
    }

    // معالجة أخطاء الموقع
    handleLocationError(error) {
        let message = '';
        switch(error.code) {
            case error.PERMISSION_DENIED:
                message = 'تم رفض الوصول إلى الموقع';
                break;
            case error.POSITION_UNAVAILABLE:
                message = 'معلومات الموقع غير متوفرة';
                break;
            case error.TIMEOUT:
                message = 'انتهت مهلة طلب الموقع';
                break;
            default:
                message = 'حدث خطأ غير معروف';
                break;
        }
        console.error(message);
        // يمكن إضافة عرض رسالة للمستخدم هنا
    }
}

// إنشاء مدير القبلة عند فتح النافذة
document.addEventListener('DOMContentLoaded', () => {
    window.qiblaManager = new QiblaManager();
});
