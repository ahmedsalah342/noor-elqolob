package com.example.islamicapp.api

import com.example.islamicapp.models.QuranResponse
import retrofit2.Response
import retrofit2.http.GET

interface QuranApiService {
    companion object {
        const val BASE_URL = "https://api.quran.com/api/v4/"
    }

    @GET("verses/by_chapter/18?language=ar&words=false&page=1&per_page=110")
    suspend fun getSurahKahf(): Response<QuranResponse>
    
    @GET("verses/by_chapter/18?language=ar&translations=131&page=1&per_page=110")
    suspend fun getSurahKahfTranslation(): Response<QuranResponse>
    
    @GET("recitations/7/by_chapter/18?page=1&per_page=110")
    suspend fun getSurahAudio(): Response<QuranResponse>
}
