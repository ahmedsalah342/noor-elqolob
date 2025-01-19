const express = require('express');
const app = express();
const path = require('path');

// السماح بالوصول إلى الملفات الثابتة
app.use(express.static(__dirname));

// توجيه كل الطلبات إلى index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// تشغيل الخادم على المنفذ 3000
const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
