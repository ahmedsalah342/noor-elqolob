package com.example.islamicapp

import android.content.Context
import android.media.MediaPlayer
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.ImageButton
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.islamicapp.adapters.QuranAdapter
import com.example.islamicapp.models.Ayah
import com.example.islamicapp.models.LocalQuranResponse
import com.google.gson.Gson
import kotlinx.coroutines.*

class QuranRuqyaActivity : AppCompatActivity() {
    
    private lateinit var recyclerView: RecyclerView
    private lateinit var progressBar: ProgressBar
    private lateinit var emptyView: TextView
    private lateinit var quranAdapter: QuranAdapter
    private var mediaPlayer: MediaPlayer? = null
    private val bookmarkedAyahs = mutableSetOf<Int>()
    private val coroutineScope = CoroutineScope(Dispatchers.Main + Job())
    
    companion object {
        private const val TAG = "QuranRuqyaActivity"
        private const val BOOKMARKS_PREF = "quran_bookmarks"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_quran_ruqya)
        
        setupViews()
        loadBookmarks()
        setupRecyclerView()
        loadSurahKahf()
        loadRuqyaSunnah()
    }

    private fun setupViews() {
        findViewById<ImageButton>(R.id.backButton).setOnClickListener {
            finish()
        }

        recyclerView = findViewById(R.id.recyclerView)
        progressBar = findViewById(R.id.progressBar)
        emptyView = findViewById(R.id.emptyView)
    }

    private fun setupRecyclerView() {
        quranAdapter = QuranAdapter(
            onPlayClick = { ayah -> playAudio(ayah) },
            onBookmarkClick = { ayah -> toggleBookmark(ayah) }
        )
        
        recyclerView.apply {
            adapter = quranAdapter
            layoutManager = LinearLayoutManager(this@QuranRuqyaActivity)
            setHasFixedSize(true)
        }
    }

    private fun loadSurahKahf() {
        Log.d(TAG, "بدء تحميل سورة الكهف")
        showLoading()
        
        try {
            val jsonString = assets.open("surah_kahf.json").bufferedReader().use { it.readText() }
            val response = Gson().fromJson(jsonString, LocalQuranResponse::class.java)
            
            if (response?.data?.ayahs != null) {
                val verses = response.data.ayahs.map { ayah ->
                    Ayah(
                        number = ayah.number,
                        text = ayah.text,
                        numberInSurah = ayah.numberInSurah,
                        audioUrl = "https://cdn.islamic-network.com/quran/audio/128/ar.alafasy/${ayah.number}.mp3",
                        isBookmarked = bookmarkedAyahs.contains(ayah.number)
                    )
                }
                
                hideLoading()
                updateUI(verses)
                Log.d(TAG, "تم تحميل ${verses.size} آية بنجاح")
            } else {
                throw Exception("لم يتم العثور على الآيات في الملف")
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "خطأ في تحميل سورة الكهف", e)
            showError("حدث خطأ في تحميل السورة: ${e.localizedMessage}")
            hideLoading()
        }
    }

    private fun loadRuqyaSunnah() {
        val ruqyaSunnahContent = """
            الرقية النبوية الشريفة:

            ١- رقية جبريل عليه السلام للنبي ﷺ:
            «بِسْمِ اللهِ أَرْقِيكَ، مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ، اللهُ يَشْفِيكَ، بِسْمِ اللهِ أَرْقِيكَ»
            (رواه مسلم)

            ٢- رقية عائشة رضي الله عنها:
            كان النبي ﷺ إذا اشتكى يقرأ على نفسه بالمعوذات وينفث، فلما اشتد وجعه كنت أقرأ عليه وأمسح بيده رجاء بركتها
            (متفق عليه)

            ٣- رقية أبي سعيد الخدري رضي الله عنه:
            «أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ»
            (رواه مسلم)
            تقال ثلاث مرات صباحاً ومساءً للوقاية

            ٤- رقية الألم والوجع:
            «ضع يدك على الذي تألم من جسدك وقل: بِسْمِ اللهِ (ثلاثاً)، وقل سبع مرات: أَعُوذُ بِاللهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ»
            (رواه مسلم)

            ٥- رقية العين والحسد:
            «اللَّهُمَّ رَبَّ النَّاسِ، أَذْهِبِ الْبَأْسَ، اشْفِ أَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا»
            (رواه البخاري)

            شروط وآداب الرقية الشرعية:
            ١- أن تكون بكلام الله تعالى أو بأسمائه وصفاته أو بالأدعية المأثورة
            ٢- أن تكون باللسان العربي أو بما يُعرف معناه
            ٣- أن يعتقد أن الرقية سبب والشفاء من الله تعالى
            ٤- الطهارة والوضوء عند الرقية
            ٥- الإخلاص لله تعالى وحسن الظن به

            أوقات مستحبة للرقية:
            ١- بعد صلاة الفجر
            ٢- قبل النوم
            ٣- بعد الصلوات المكتوبة
            ٤- في الثلث الأخير من الليل
        """.trimIndent()
        
        findViewById<TextView>(R.id.ruqyaContentTextView).text = ruqyaSunnahContent
    }

    private fun updateUI(verses: List<Ayah>) {
        if (verses.isEmpty()) {
            recyclerView.visibility = View.GONE
            emptyView.visibility = View.VISIBLE
            emptyView.text = "لا توجد آيات للعرض"
            return
        }

        recyclerView.visibility = View.VISIBLE
        emptyView.visibility = View.GONE
        quranAdapter.submitList(verses)
    }

    private fun loadBookmarks() {
        val prefs = getSharedPreferences(BOOKMARKS_PREF, Context.MODE_PRIVATE)
        bookmarkedAyahs.clear()
        bookmarkedAyahs.addAll(
            prefs.getStringSet("bookmarks", emptySet())?.map { it.toInt() } ?: emptyList()
        )
    }

    private fun saveBookmarks() {
        val prefs = getSharedPreferences(BOOKMARKS_PREF, Context.MODE_PRIVATE)
        prefs.edit().putStringSet(
            "bookmarks",
            bookmarkedAyahs.map { it.toString() }.toSet()
        ).apply()
    }

    private fun toggleBookmark(ayah: Ayah) {
        if (bookmarkedAyahs.contains(ayah.number)) {
            bookmarkedAyahs.remove(ayah.number)
        } else {
            bookmarkedAyahs.add(ayah.number)
        }
        
        saveBookmarks()
        
        // تحديث حالة الإشارة المرجعية في القائمة
        val currentList = quranAdapter.currentList.toMutableList()
        val position = currentList.indexOfFirst { it.number == ayah.number }
        if (position != -1) {
            currentList[position] = ayah.copy(isBookmarked = !ayah.isBookmarked)
            quranAdapter.submitList(currentList)
        }
    }

    private fun playAudio(ayah: Ayah) {
        stopAudio()
        
        try {
            mediaPlayer = MediaPlayer().apply {
                setDataSource(ayah.audioUrl)
                prepareAsync()
                setOnPreparedListener { start() }
                setOnCompletionListener { stopAudio() }
                setOnErrorListener { _, _, _ ->
                    showError("حدث خطأ في تشغيل الصوت")
                    stopAudio()
                    true
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "خطأ في تشغيل الصوت", e)
            showError("حدث خطأ في تشغيل الصوت")
        }
    }

    private fun stopAudio() {
        mediaPlayer?.apply {
            if (isPlaying) {
                stop()
            }
            reset()
            release()
        }
        mediaPlayer = null
    }

    private fun showLoading() {
        progressBar.visibility = View.VISIBLE
        recyclerView.visibility = View.GONE
        emptyView.visibility = View.GONE
    }

    private fun hideLoading() {
        progressBar.visibility = View.GONE
    }

    private fun showError(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
        emptyView.visibility = View.VISIBLE
        emptyView.text = message
        recyclerView.visibility = View.GONE
    }

    override fun onPause() {
        super.onPause()
        stopAudio()
    }

    override fun onDestroy() {
        super.onDestroy()
        stopAudio()
        coroutineScope.cancel()
    }
}
