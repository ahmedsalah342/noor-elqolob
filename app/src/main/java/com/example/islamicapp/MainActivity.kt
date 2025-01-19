package com.example.islamicapp

import android.os.Bundle
import android.content.Intent
import android.view.View
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.cardview.widget.CardView
import com.google.android.material.bottomsheet.BottomSheetDialog

class MainActivity : AppCompatActivity() {
    private var currentDialog: BottomSheetDialog? = null
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // تهيئة البطاقات
        setupCards()
    }

    private fun setupCards() {
        // الرقية الشرعية
        findViewById<CardView>(R.id.ruqyaCard).setOnClickListener {
            showBottomSheet(
                "الرقية الشرعية",
                "الرقية الشرعية هي العلاج بالقرآن الكريم والأدعية المأثورة عن النبي ﷺ"
            )
        }

        // الرقية بالسنة
        findViewById<CardView>(R.id.sunnahRuqyaCard).setOnClickListener {
            showBottomSheet(
                "الرقية بالسنة",
                "الرقية بالسنة النبوية المطهرة وما ورد عن النبي ﷺ من أذكار وأدعية"
            )
        }

        // أعلام الإسلام
        findViewById<CardView>(R.id.islamicScholarsCard).setOnClickListener {
            showBottomSheet(
                "أعلام الإسلام",
                "تعرف على علماء الإسلام الأجلاء وسيرهم العطرة"
            )
        }

        // القرآن الكريم
        findViewById<CardView>(R.id.quranRuqyaCard).setOnClickListener {
            currentDialog?.dismiss()  // إغلاق أي نافذة مفتوحة
            startActivity(Intent(this, QuranRuqyaActivity::class.java))
        }
    }

    private fun showBottomSheet(title: String, content: String) {
        // إغلاق النافذة السابقة إن وجدت
        currentDialog?.dismiss()
        
        // إنشاء نافذة جديدة
        val dialog = BottomSheetDialog(this)
        val view = layoutInflater.inflate(R.layout.bottom_sheet_layout, null)
        
        // تعيين العنوان والمحتوى
        view.findViewById<TextView>(R.id.titleTextView).text = title
        view.findViewById<TextView>(R.id.contentTextView).text = content
        
        // إضافة زر الإغلاق
        view.findViewById<View>(R.id.closeButton).setOnClickListener {
            dialog.dismiss()
        }

        dialog.setContentView(view)
        dialog.setOnDismissListener {
            if (currentDialog == dialog) {
                currentDialog = null
            }
        }

        currentDialog = dialog
        dialog.show()
    }

    override fun onPause() {
        super.onPause()
        currentDialog?.dismiss()
        currentDialog = null
    }
}
