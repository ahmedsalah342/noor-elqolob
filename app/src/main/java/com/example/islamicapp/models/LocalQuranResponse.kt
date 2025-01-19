package com.example.islamicapp.models

data class LocalQuranResponse(
    val code: Int,
    val status: String,
    val data: SurahData
)

data class SurahData(
    val number: Int,
    val name: String,
    val englishName: String,
    val englishNameTranslation: String,
    val numberOfAyahs: Int,
    val ayahs: List<AyahData>
)

data class AyahData(
    val number: Int,
    val text: String,
    val numberInSurah: Int,
    val juz: Int,
    val manzil: Int,
    val page: Int,
    val ruku: Int,
    val hizbQuarter: Int
)
