package com.bamp.ai

import android.app.Application
import com.google.firebase.FirebaseApp

class BampApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // Initialize shared Firebase project (bamp-1de96)
        FirebaseApp.initializeApp(this)
    }
}
