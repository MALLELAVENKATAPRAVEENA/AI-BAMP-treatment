package com.bamp.ai

import android.app.Application
import com.google.firebase.FirebaseApp
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.FirebaseFirestoreSettings

class BampApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // Initialize shared Firebase project (bamp-1de96)
        FirebaseApp.initializeApp(this)
        try {
            val db = FirebaseFirestore.getInstance()
            val settings = FirebaseFirestoreSettings.Builder()
                .setPersistenceEnabled(true)
                .build()
            db.firestoreSettings = settings
        } catch (_: Exception) {}
    }
}
