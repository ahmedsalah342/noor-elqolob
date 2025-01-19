// التحكم في النوافذ المنبثقة
function showModal(modalId) {
    const modal = document.getElementById(modalId + '-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    // حذف '-modal' من نهاية modalId إذا كان موجوداً
    modalId = modalId.replace('-modal', '');
    const modal = document.getElementById(modalId + '-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// إضافة مستمعات الأحداث عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // إضافة مستمع لجميع أزرار الإغلاق
    const closeButtons = document.querySelectorAll('.close-button');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });

    // إغلاق النافذة عند النقر خارجها
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
});
