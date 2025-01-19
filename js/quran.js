let currentFontSize = 1.5;
const MIN_FONT_SIZE = 1.0;
const MAX_FONT_SIZE = 2.5;

async function loadSurahKahf() {
    try {
        showLoading(true);
        
        // Load from local JSON file
        const response = await fetch('app/src/main/assets/surah_kahf.json');
        const data = await response.json();
        
        // If local file fails, try using the API directly
        if (!data || !data.data || !data.data.ayahs) {
            const apiResponse = await fetch('https://api.alquran.cloud/v1/surah/18');
            data = await apiResponse.json();
        }
        
        const verses = data.data.ayahs;
        const surahContainer = document.querySelector('.surah-container');
        if (!surahContainer) return;
        
        // Clear existing content
        surahContainer.innerHTML = '';
        
        // Add controls
        const controls = createControls();
        surahContainer.appendChild(controls);
        
        // Add Bismillah
        const bismillah = document.createElement('div');
        bismillah.className = 'bismillah';
        bismillah.textContent = 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ';
        surahContainer.appendChild(bismillah);
        
        // Add verses
        verses.forEach(verse => {
            const verseDiv = document.createElement('div');
            verseDiv.className = 'verse';
            
            // Add copy button
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-button';
            copyButton.innerHTML = '<i class="fas fa-copy"></i>';
            copyButton.onclick = (e) => {
                e.stopPropagation();
                copyVerse(verse.text);
            };
            verseDiv.appendChild(copyButton);
            
            // Add verse text
            const verseText = document.createElement('span');
            verseText.className = 'verse-text';
            verseText.textContent = `${verse.text} `;
            verseDiv.appendChild(verseText);
            
            // Add verse number
            const verseNumber = document.createElement('span');
            verseNumber.className = 'verse-number';
            verseNumber.textContent = `﴿${verse.numberInSurah}﴾`;
            verseDiv.appendChild(verseNumber);
            
            // Add click handler for highlighting
            verseDiv.onclick = (e) => {
                if (e.target !== copyButton && e.target !== copyButton.firstChild) {
                    toggleHighlight(verseDiv);
                }
            };
            
            surahContainer.appendChild(verseDiv);
        });
        
        showLoading(false);
    } catch (error) {
        console.error('Error loading Surah Al-Kahf:', error);
        showError('حدث خطأ في تحميل السورة. يرجى المحاولة مرة أخرى.');
    }
}

function createControls() {
    const controls = document.createElement('div');
    controls.className = 'surah-controls';
    
    // Font size controls
    const fontControls = document.createElement('div');
    fontControls.className = 'font-size-control';
    
    const decreaseBtn = document.createElement('button');
    decreaseBtn.textContent = 'تصغير الخط';
    decreaseBtn.onclick = () => changeFontSize(-0.1);
    
    const increaseBtn = document.createElement('button');
    increaseBtn.textContent = 'تكبير الخط';
    increaseBtn.onclick = () => changeFontSize(0.1);
    
    fontControls.appendChild(decreaseBtn);
    fontControls.appendChild(increaseBtn);
    
    controls.appendChild(fontControls);
    
    return controls;
}

function changeFontSize(delta) {
    const newSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, currentFontSize + delta));
    if (newSize !== currentFontSize) {
        currentFontSize = newSize;
        document.querySelectorAll('.verse').forEach(verse => {
            verse.style.fontSize = `${currentFontSize}em`;
        });
    }
}

function toggleHighlight(verseDiv) {
    verseDiv.classList.toggle('highlighted');
}

async function copyVerse(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('تم نسخ الآية بنجاح');
    } catch (err) {
        console.error('Failed to copy verse:', err);
        showNotification('فشل نسخ الآية', 'error');
    }
}

function showLoading(show) {
    const container = document.querySelector('.surah-container');
    if (!container) return;
    
    if (show) {
        const loading = document.createElement('div');
        loading.className = 'loading-container';
        loading.innerHTML = '<div class="loading-spinner"></div>';
        container.appendChild(loading);
    } else {
        const loading = container.querySelector('.loading-container');
        if (loading) loading.remove();
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

function showError(message) {
    const container = document.querySelector('.surah-container');
    if (!container) return;
    
    const error = document.createElement('div');
    error.className = 'error-message';
    error.textContent = message;
    container.appendChild(error);
}

// Load Surah Al-Kahf when the page loads
document.addEventListener('DOMContentLoaded', loadSurahKahf);
