package com.example.islamicapp.utils

import android.content.Context
import android.view.View
import android.widget.FrameLayout
import android.widget.TextView
import com.example.islamicapp.R
import com.google.android.material.bottomsheet.BottomSheetBehavior
import com.google.android.material.bottomsheet.BottomSheetDialog

object BottomSheetManager {
    private var currentDialog: BottomSheetDialog? = null
    private var currentBehavior: BottomSheetBehavior<View>? = null

    fun showBottomSheet(context: Context, title: String, content: String) {
        // إغلاق النافذة السابقة إن وجدت
        dismissCurrentDialog()

        // إنشاء نافذة جديدة
        val dialog = BottomSheetDialog(context, R.style.BottomSheetDialogTheme)
        
        // تهيئة العرض
        val view = View.inflate(context, R.layout.bottom_sheet_layout, null)
        
        // تعيين العنوان والمحتوى
        view.findViewById<TextView>(R.id.titleTextView).text = title
        view.findViewById<TextView>(R.id.contentTextView).text = content

        // إضافة زر الإغلاق
        view.findViewById<View>(R.id.closeButton).setOnClickListener {
            dialog.dismiss()
        }

        // تعيين سلوك النافذة
        dialog.setContentView(view)
        
        // جعل النافذة تأخذ كامل المساحة
        dialog.setOnShowListener {
            val bottomSheet = dialog.findViewById<View>(com.google.android.material.R.id.design_bottom_sheet) as FrameLayout
            val behavior = BottomSheetBehavior.from(bottomSheet)
            
            // تعيين الارتفاع للحد الأقصى
            val layoutParams = bottomSheet.layoutParams
            layoutParams.height = FrameLayout.LayoutParams.MATCH_PARENT
            bottomSheet.layoutParams = layoutParams
            
            // فتح النافذة بشكل كامل
            behavior.state = BottomSheetBehavior.STATE_EXPANDED
            
            // منع السحب لأسفل
            behavior.isDraggable = false
            
            // حفظ المرجع
            currentBehavior = behavior
        }

        // تعيين مستمع للإغلاق
        dialog.setOnDismissListener {
            if (currentDialog == dialog) {
                currentDialog = null
                currentBehavior = null
            }
        }

        // حفظ المرجع
        currentDialog = dialog

        // عرض النافذة
        dialog.show()
    }

    fun dismissCurrentDialog() {
        currentDialog?.dismiss()
        currentDialog = null
        currentBehavior = null
    }

    fun isShowing(): Boolean {
        return currentDialog != null
    }
}
