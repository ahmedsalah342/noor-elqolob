package com.example.islamicapp.models

// النموذج الجديد للاستجابة من API
data class QuranResponse(
    val verses: List<Ayah>? = null,
    val translations: List<Translation>? = null,
    val audio_files: List<AudioFile>? = null,
    val pagination: Pagination? = null,
    // للتوافق مع البيانات القديمة
    val code: Int = 0,
    val status: String = "",
    val data: SurahData? = null
)

data class Pagination(
    val current_page: Int,
    val next_page: Int?,
    val per_page: Int,
    val total_pages: Int,
    val total_records: Int
)

// النموذج الجديد للآية
data class Ayah(
    val id: Int,
    val verse_key: String,
    val verse_number: Int,
    val text_uthmani: String,
    var translation: String = "",
    var audioUrl: String = "",
    var isBookmarked: Boolean = false
)

data class Translation(
    val resource_id: Int,
    val text: String,
    val verse_key: String,
    val verse_number: Int
)

data class AudioFile(
    val verse_key: String,
    val url: String,
    val segments: List<List<Int>>? = null,
    val verse_number: Int
)

// نماذج للتوافق مع البيانات القديمة
data class SurahData(
    val number: Int,
    val name: String,
    val englishName: String,
    val englishNameTranslation: String,
    val numberOfAyahs: Int,
    val ayahs: List<OldAyah>
)

data class OldAyah(
    val number: Int,
    val text: String,
    val numberInSurah: Int,
    val juz: Int
)

// نماذج للبيانات المحلية
data class LocalQuranResponse(
    val code: Int,
    val status: String,
    val data: LocalSurahData
)

data class LocalSurahData(
    val number: Int,
    val name: String,
    val englishName: String,
    val englishNameTranslation: String,
    val numberOfAyahs: Int,
    val ayahs: List<LocalAyah>
)

data class LocalAyah(
    val number: Int,
    val text: String,
    val numberInSurah: Int,
    val juz: Int
)
