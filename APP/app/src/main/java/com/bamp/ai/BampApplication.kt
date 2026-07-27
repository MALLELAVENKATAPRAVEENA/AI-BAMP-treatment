package com.bamp.ai

import android.app.Application
import com.google.firebase.FirebaseApp
import com.google.firebase.firestore.FirebaseFirestore

class BampApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // Initialize shared Firebase project (bamp-1de96)
        FirebaseApp.initializeApp(this)
        try {
            // Touch instance to ensure offline cache & real-time synchronization is active
            FirebaseFirestore.getInstance()
        } catch (_: Exception) {}
    }
}
