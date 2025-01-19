package com.example.islamicapp.models

data class Ayah(
    val number: Int,
    val text: String,
    val numberInSurah: Int,
    val audioUrl: String,
    var isBookmarked: Boolean = false
)
