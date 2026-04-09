package com.progress.datamatrix.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.outlined.QrCodeScanner
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import com.progress.datamatrix.data.QualityGrade
import com.progress.datamatrix.data.ScanRepository
import com.progress.datamatrix.data.ScanResult
import com.progress.datamatrix.data.color
import com.progress.datamatrix.navigation.Screen
import com.progress.datamatrix.ui.theme.*
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(repo: ScanRepository, navController: NavController) {
    val scans by repo.scans.collectAsStateWithLifecycle()
    val lastScans = scans.take(5)

    val total     = scans.size
    val successful = scans.count { it.overallGrade <= QualityGrade.C && !it.failed }
    val defective  = scans.count { it.overallGrade >= QualityGrade.D || it.failed }

    Scaffold(
        containerColor = Background,
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text       = "DataMatrix",
                            style      = MaterialTheme.typography.titleLarge,
                            color      = TextPrimary,
                        )
                        Text(
                            text  = "Анализатор качества печати",
                            style = MaterialTheme.typography.bodySmall,
                            color = TextSecondary,
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { navController.navigate(Screen.About.route) }) {
                        Icon(Icons.Default.Info, contentDescription = "О приложении", tint = TextSecondary)
                    }
                    IconButton(onClick = { navController.navigate(Screen.History.route) }) {
                        Icon(Icons.Default.History, contentDescription = "История", tint = TextSecondary)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Background),
            )
        },
    ) { padding ->
        LazyColumn(
            modifier            = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            item {
                // Author badge
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(SurfaceHigh)
                        .padding(horizontal = 12.dp, vertical = 6.dp),
                ) {
                    Text(
                        text  = "ГОСТ Р 57302-2016 · А. Свидович / А. Петляков · PROGRESS",
                        style = MaterialTheme.typography.labelSmall,
                        color = Primary,
                    )
                }
            }

            item {
                // Scan button
                Box(
                    modifier        = Modifier.fillMaxWidth(),
                    contentAlignment = Alignment.Center,
                ) {
                    Box(
                        modifier = Modifier
                            .size(200.dp)
                            .clip(CircleShape)
                            .background(
                                Brush.radialGradient(
                                    colors = listOf(Primary.copy(0.15f), Primary.copy(0.02f))
                                )
                            ),
                        contentAlignment = Alignment.Center,
                    ) {
                        Box(
                            modifier = Modifier
                                .size(140.dp)
                                .clip(CircleShape)
                                .background(Primary)
                                .clickable { navController.navigate(Screen.Scanner.route) },
                            contentAlignment = Alignment.Center,
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.QrCodeScanner,
                                contentDescription = "Сканировать",
                                tint   = Background,
                                modifier = Modifier.size(56.dp),
                            )
                        }
                    }
                }
                Spacer(Modifier.height(4.dp))
                Text(
                    text     = "Нажмите для сканирования",
                    modifier = Modifier.fillMaxWidth(),
                    style    = MaterialTheme.typography.titleMedium,
                    color    = TextPrimary,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                )
                Text(
                    text      = "DataMatrix · ISO/IEC 16022",
                    modifier  = Modifier.fillMaxWidth(),
                    style     = MaterialTheme.typography.bodySmall,
                    color     = TextSecondary,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                )
            }

            item {
                // Stats row
                Row(
                    modifier            = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .background(Surface),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                ) {
                    StatCell(label = "Сканирований", value = total.toString(), color = TextPrimary)
                    VerticalDivider()
                    StatCell(label = "Успешных",     value = successful.toString(), color = GradeA)
                    VerticalDivider()
                    StatCell(label = "Дефектных",    value = defective.toString(), color = GradeF)
                }
            }

            if (lastScans.isNotEmpty()) {
                item {
                    Row(
                        modifier            = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment   = Alignment.CenterVertically,
                    ) {
                        Text(
                            text  = "Последние сканирования",
                            style = MaterialTheme.typography.titleMedium,
                            color = TextPrimary,
                        )
                        TextButton(onClick = { navController.navigate(Screen.History.route) }) {
                            Text("Все", color = Primary)
                        }
                    }
                }

                items(lastScans) { scan ->
                    RecentItem(
                        scan     = scan,
                        onClick  = {
                            navController.navigate(Screen.Result.go(scan.id))
                        },
                    )
                }
            } else {
                item {
                    Column(
                        modifier            = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.QrCodeScanner,
                            contentDescription = null,
                            tint     = TextMuted,
                            modifier = Modifier.size(48.dp),
                        )
                        Text("Нет данных", style = MaterialTheme.typography.titleMedium, color = TextMuted)
                        Text("Отсканируйте первый DataMatrix", style = MaterialTheme.typography.bodySmall, color = TextMuted)
                    }
                }
            }

            item { Spacer(Modifier.height(8.dp)) }
        }
    }
}

@Composable
private fun StatCell(label: String, value: String, color: androidx.compose.ui.graphics.Color) {
    Column(
        modifier            = Modifier.padding(vertical = 16.dp, horizontal = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        Text(text = value, fontSize = 24.sp, fontWeight = FontWeight.Bold, color = color)
        Text(text = label, style = MaterialTheme.typography.labelSmall, color = TextSecondary)
    }
}

@Composable
private fun VerticalDivider() {
    Box(
        modifier = Modifier
            .width(1.dp)
            .height(48.dp)
            .background(SurfaceBorder),
    )
}

@Composable
private fun RecentItem(scan: ScanResult, onClick: () -> Unit) {
    val gradeColor = scan.overallGrade.color()
    val fmt        = remember { SimpleDateFormat("dd.MM.yyyy HH:mm", Locale.getDefault()) }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(Surface)
            .clickable(onClick = onClick)
            .padding(12.dp),
        verticalAlignment   = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Box(
            modifier = Modifier
                .size(44.dp)
                .clip(RoundedCornerShape(10.dp))
                .background(gradeColor.copy(alpha = 0.15f)),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text       = scan.overallGrade.name,
                fontSize   = 18.sp,
                fontWeight = FontWeight.Bold,
                color      = gradeColor,
            )
        }

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text  = fmt.format(Date(scan.timestamp)),
                style = MaterialTheme.typography.bodyMedium,
                color = TextPrimary,
            )
            if (scan.failed) {
                Text(
                    text  = "DataMatrix не обнаружен",
                    style = MaterialTheme.typography.bodySmall,
                    color = GradeF.copy(alpha = 0.8f),
                )
            }
        }

        Icon(
            imageVector = Icons.Default.History,
            contentDescription = null,
            tint     = TextMuted,
            modifier = Modifier.size(16.dp),
        )
    }
}
