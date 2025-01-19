package com.example.islamicapp.adapters

import android.view.LayoutInflater
import android.view.View
import android.widget.ImageButton
import android.widget.ProgressBar
import android.widget.TextView
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.islamicapp.R
import com.example.islamicapp.models.Ayah

class QuranAdapter(
    private val onPlayClick: (Ayah) -> Unit,
    private val onBookmarkClick: (Ayah) -> Unit
) : ListAdapter<Ayah, QuranAdapter.QuranViewHolder>(AyahDiffCallback()) {

    private var currentlyPlayingPosition: Int = -1

    class QuranViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val ayahText: TextView = view.findViewById(R.id.ayahText)
        val ayahTranslation: TextView = view.findViewById(R.id.ayahTranslation)
        val ayahNumber: TextView = view.findViewById(R.id.ayahNumber)
        val playButton: ImageButton = view.findViewById(R.id.playButton)
        val bookmarkButton: ImageButton = view.findViewById(R.id.bookmarkButton)
        val audioProgress: ProgressBar = view.findViewById(R.id.audioProgress)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): QuranViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_ayah, parent, false)
        return QuranViewHolder(view)
    }

    override fun onBindViewHolder(holder: QuranViewHolder, position: Int) {
        val ayah = getItem(position)
        
        holder.ayahText.text = ayah.text
        holder.ayahTranslation.visibility = View.GONE  // نخفي الترجمة مؤقتاً
        holder.ayahNumber.text = "﴿${ayah.numberInSurah}﴾"

        // تحديث حالة الإشارة المرجعية
        holder.bookmarkButton.setImageResource(
            if (ayah.isBookmarked) R.drawable.ic_bookmark_filled
            else R.drawable.ic_bookmark_outline
        )

        // تحديث حالة زر التشغيل والتحميل
        if (position == currentlyPlayingPosition) {
            holder.playButton.visibility = View.INVISIBLE
            holder.audioProgress.visibility = View.VISIBLE
        } else {
            holder.playButton.visibility = View.VISIBLE
            holder.audioProgress.visibility = View.INVISIBLE
        }

        // إعداد المستمعين
        holder.playButton.setOnClickListener {
            onPlayClick(ayah)
            updatePlayingPosition(position)
        }

        holder.bookmarkButton.setOnClickListener {
            onBookmarkClick(ayah)
            notifyItemChanged(position)
        }
    }

    fun updatePlayingPosition(position: Int) {
        val oldPosition = currentlyPlayingPosition
        currentlyPlayingPosition = position
        
        if (oldPosition != -1) {
            notifyItemChanged(oldPosition)
        }
        if (position != -1) {
            notifyItemChanged(position)
        }
    }
}

class AyahDiffCallback : DiffUtil.ItemCallback<Ayah>() {
    override fun areItemsTheSame(oldItem: Ayah, newItem: Ayah): Boolean {
        return oldItem.number == newItem.number
    }

    override fun areContentsTheSame(oldItem: Ayah, newItem: Ayah): Boolean {
        return oldItem == newItem
    }
}
