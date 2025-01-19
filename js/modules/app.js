// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// Handle section navigation
function openSection(sectionId) {
    // Store current section in localStorage
    localStorage.setItem('currentSection', sectionId);
    
    // Load section content
    const content = getSectionContent(sectionId);
    document.querySelector('main').innerHTML = `
        <div class="section-header">
            <button onclick="goBack()" class="back-button">رجوع</button>
            <h2>${content.title}</h2>
        </div>
        <div class="section-content">
            ${content.html}
        </div>
    `;
}

function goBack() {
    window.location.reload();
}

// Content for each section
function getSectionContent(sectionId) {
    const sections = {
        'quran-ruqya': {
            title: 'الرقية بالقرآن',
            html: `
                <div class="ruqya-content">
                    <div class="ayah">
                        <h3>الفاتحة</h3>
                        <p>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ ﴿١﴾ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾ الرَّحْمَنِ الرَّحِيمِ ﴿٣﴾ مَالِكِ يَوْمِ الدِّينِ ﴿٤﴾ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٥﴾ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٦﴾ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٧﴾</p>
                    </div>
                    <div class="ayah">
                        <h3>آية الكرسي</h3>
                        <p>اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ...</p>
                    </div>
                    <!-- المزيد من الآيات -->
                </div>
            `
        },
        // يمكن إضافة المزيد من الأقسام هنا
    };

    return sections[sectionId] || {
        title: 'خطأ',
        html: '<p>المحتوى غير متوفر</p>'
    };
}
