package com.progress.datamatrix

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.progress.datamatrix.navigation.AppNavGraph
import com.progress.datamatrix.ui.theme.DataMatrixTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            DataMatrixTheme {
                AppNavGraph()
            }
        }
    }
}
