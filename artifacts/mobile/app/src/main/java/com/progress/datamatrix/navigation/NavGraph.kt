package com.progress.datamatrix.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.progress.datamatrix.data.ScanRepository
import com.progress.datamatrix.ui.screens.*

sealed class Screen(val route: String) {
    object Home    : Screen("home")
    object Scanner : Screen("scanner")
    object Result  : Screen("result/{scanId}") {
        fun go(id: String) = "result/$id"
    }
    object History : Screen("history")
    object About   : Screen("about")
}

@Composable
fun AppNavGraph() {
    val navController = rememberNavController()
    val context       = LocalContext.current
    val repo          = remember { ScanRepository(context) }

    NavHost(navController = navController, startDestination = Screen.Home.route) {

        composable(Screen.Home.route) {
            HomeScreen(repo = repo, navController = navController)
        }

        composable(Screen.Scanner.route) {
            ScannerScreen(repo = repo, navController = navController)
        }

        composable(
            route = Screen.Result.route,
            arguments = listOf(navArgument("scanId") { type = NavType.StringType }),
        ) { back ->
            val id = back.arguments?.getString("scanId") ?: return@composable
            ResultScreen(scanId = id, repo = repo, navController = navController)
        }

        composable(Screen.History.route) {
            HistoryScreen(repo = repo, navController = navController)
        }

        composable(Screen.About.route) {
            AboutScreen(navController = navController)
        }
    }
}
