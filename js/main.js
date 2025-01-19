// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
    initMenuButton();
    initGridItems();
});

// تهيئة الوضع الليلي
function initDarkMode() {
    const darkModeBtn = document.querySelector('.dark-mode-btn');
    darkModeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });
}

// تهيئة زر القائمة
function initMenuButton() {
    const menuBtn = document.querySelector('.menu-btn');
    menuBtn.addEventListener('click', () => {
        document.querySelector('.menu-dropdown').classList.toggle('show');
    });
}

// تهيئة البطاقات
function initGridItems() {
    const gridItems = document.querySelectorAll('.grid-item');
    gridItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            navigateToPage(page);
        });
    });
}

// الانتقال إلى الصفحة
function navigateToPage(page) {
    const item = document.querySelector(`[data-page="${page}"]`);
    item.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        item.style.transform = '';
        window.location.href = `${page}.html`;
    }, 200);
}
