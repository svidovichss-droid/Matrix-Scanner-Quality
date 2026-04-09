package com.progress.datamatrix.ui.screens

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import com.progress.datamatrix.data.ScanRepository
import com.progress.datamatrix.data.color
import com.progress.datamatrix.data.label
import com.progress.datamatrix.ui.components.GradeRing
import com.progress.datamatrix.ui.components.MetricRow
import com.progress.datamatrix.ui.theme.*
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ResultScreen(scanId: String, repo: ScanRepository, navController: NavController) {
    val scans by repo.scans.collectAsStateWithLifecycle()
    val scan  = scans.find { it.id == scanId } ?: return
    val context = LocalContext.current
    val fmt     = remember { SimpleDateFormat("dd.MM.yyyy HH:mm:ss", Locale.getDefault()) }

    Scaffold(
        containerColor = Background,
        topBar = {
            TopAppBar(
                title = { Text("Результат анализа", color = TextPrimary) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Назад", tint = TextSecondary)
                    }
                },
                actions = {
                    IconButton(onClick = {
                        val text = buildString {
                            appendLine("DataMatrix — Анализ качества печати")
                            appendLine("ГОСТ Р 57302-2016 / ISO/IEC 15415")
                            appendLine()
                            appendLine("Оценка: ${scan.overallGrade.name} — ${scan.overallGrade.label()}")
                            appendLine("Счёт: ${"%.1f".format(scan.overallScore)}/4.0")
                            appendLine()
                            if (!scan.failed) {
                                appendLine("Матрица: ${scan.matrixSize}  Размер: ${scan.size}")
                                appendLine("Модуль:  ${scan.moduleSize} мм")
                                appendLine()
                            }
                            appendLine("Параметры качества:")
                            scan.metrics.forEach { m ->
                                appendLine("  ${m.name}: ${m.grade.name} — ${m.description}")
                            }
                            appendLine()
                            appendLine("А. Свидович / А. Петляков · PROGRESS")
                        }
                        val intent = Intent(Intent.ACTION_SEND).apply {
                            type = "text/plain"
                            putExtra(Intent.EXTRA_TEXT, text)
                        }
                        context.startActivity(Intent.createChooser(intent, "Поделиться результатом"))
                    }) {
                        Icon(Icons.Default.Share, contentDescription = "Поделиться", tint = TextSecondary)
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
                // Grade ring card
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(20.dp))
                        .background(Surface),
                    contentAlignment = Alignment.Center,
                ) {
                    Column(
                        modifier            = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp),
                    ) {
                        GradeRing(grade = scan.overallGrade, score = scan.overallScore, size = 160.dp)

                        if (scan.failed) {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(GradeF.copy(alpha = 0.12f))
                                    .padding(horizontal = 16.dp, vertical = 8.dp),
                            ) {
                                Text(
                                    text  = "DataMatrix не обнаружен в кадре",
                                    style = MaterialTheme.typography.labelLarge,
                                    color = GradeF,
                                )
                            }
                        }

                        Text(
                            text  = fmt.format(Date(scan.timestamp)),
                            style = MaterialTheme.typography.bodySmall,
                            color = TextMuted,
                        )
                    }
                }
            }

            if (!scan.failed) {
                item {
                    // Info card
                    Row(
                        modifier            = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(16.dp))
                            .background(Surface)
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceEvenly,
                    ) {
                        InfoCell(label = "Матрица", value = scan.matrixSize)
                        VerticalDividerThin()
                        InfoCell(label = "Размер", value = scan.size)
                        VerticalDividerThin()
                        InfoCell(label = "Модуль", value = "${scan.moduleSize} мм")
                    }
                }
            }

            item {
                Text(
                    text       = "Параметры качества",
                    style      = MaterialTheme.typography.titleMedium,
                    color      = TextPrimary,
                    fontWeight = FontWeight.Bold,
                )
                Text(
                    text  = "8 параметров согласно ISO/IEC 15415 и ГОСТ Р 57302-2016",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary,
                )
            }

            items(scan.metrics) { metric ->
                MetricRow(metric = metric)
            }

            item { Spacer(Modifier.height(8.dp)) }
        }
    }
}

@Composable
private fun InfoCell(label: String, value: String) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        Text(text = label, style = MaterialTheme.typography.labelSmall, color = TextMuted)
        Text(text = value, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold, color = TextPrimary)
    }
}

@Composable
private fun VerticalDividerThin() {
    Box(modifier = Modifier.width(1.dp).height(36.dp).background(SurfaceBorder))
}
