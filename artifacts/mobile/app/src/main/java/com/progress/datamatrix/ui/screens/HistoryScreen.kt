package com.progress.datamatrix.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.DeleteSweep
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
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
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HistoryScreen(repo: ScanRepository, navController: NavController) {
    val scans   by repo.scans.collectAsStateWithLifecycle()
    val coroutine = rememberCoroutineScope()
    var query   by remember { mutableStateOf("") }
    var filter  by remember { mutableStateOf<QualityGrade?>(null) }
    var showClearDialog by remember { mutableStateOf(false) }

    val filtered = remember(scans, query, filter) {
        scans.filter { scan ->
            val matchGrade = filter == null || scan.overallGrade == filter
            val matchQuery = query.isBlank() ||
                    scan.overallGrade.name.contains(query, true) ||
                    scan.matrixSize.contains(query, true)
            matchGrade && matchQuery
        }
    }

    if (showClearDialog) {
        AlertDialog(
            onDismissRequest = { showClearDialog = false },
            title   = { Text("Очистить историю?") },
            text    = { Text("Все результаты сканирований будут удалены безвозвратно.") },
            confirmButton = {
                TextButton(onClick = {
                    coroutine.launch { repo.clearAll() }
                    showClearDialog = false
                }) { Text("Очистить", color = GradeF) }
            },
            dismissButton = {
                TextButton(onClick = { showClearDialog = false }) { Text("Отмена") }
            },
            containerColor = SurfaceHigh,
        )
    }

    Scaffold(
        containerColor = Background,
        topBar = {
            TopAppBar(
                title = { Text("История", color = TextPrimary) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Назад", tint = TextSecondary)
                    }
                },
                actions = {
                    if (scans.isNotEmpty()) {
                        IconButton(onClick = { showClearDialog = true }) {
                            Icon(Icons.Default.DeleteSweep, contentDescription = "Очистить", tint = GradeF.copy(alpha = 0.8f))
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Background),
            )
        },
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
        ) {
            // Search field
            OutlinedTextField(
                value         = query,
                onValueChange = { query = it },
                modifier      = Modifier.fillMaxWidth(),
                placeholder   = { Text("Поиск…", color = TextMuted) },
                leadingIcon   = { Icon(Icons.Default.Search, contentDescription = null, tint = TextMuted) },
                singleLine    = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor   = Primary,
                    unfocusedBorderColor = SurfaceBorder,
                    focusedTextColor     = TextPrimary,
                    unfocusedTextColor   = TextPrimary,
                    cursorColor          = Primary,
                ),
                shape = RoundedCornerShape(12.dp),
            )

            Spacer(Modifier.height(12.dp))

            // Grade filter chips
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChipItem(label = "Все", selected = filter == null, onClick = { filter = null })
                QualityGrade.entries.forEach { g ->
                    FilterChipItem(
                        label    = g.name,
                        selected = filter == g,
                        color    = g.color(),
                        onClick  = { filter = if (filter == g) null else g },
                    )
                }
            }

            Spacer(Modifier.height(12.dp))

            if (filtered.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("Нет записей", color = TextMuted, style = MaterialTheme.typography.bodyLarge)
                }
            } else {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    items(filtered, key = { it.id }) { scan ->
                        HistoryItem(
                            scan    = scan,
                            onClick = { navController.navigate(Screen.Result.go(scan.id)) },
                            onDelete = { coroutine.launch { repo.deleteScan(scan.id) } },
                        )
                    }
                    item { Spacer(Modifier.height(8.dp)) }
                }
            }
        }
    }
}

@Composable
private fun FilterChipItem(
    label:   String,
    selected: Boolean,
    color:   androidx.compose.ui.graphics.Color = Primary,
    onClick: () -> Unit,
) {
    FilterChip(
        selected = selected,
        onClick  = onClick,
        label    = { Text(label, fontSize = 12.sp) },
        colors   = FilterChipDefaults.filterChipColors(
            selectedContainerColor = color.copy(alpha = 0.2f),
            selectedLabelColor     = color,
        ),
        border = FilterChipDefaults.filterChipBorder(
            enabled          = true,
            selected         = selected,
            selectedBorderColor = color,
            borderColor      = SurfaceBorder,
        ),
    )
}

@Composable
private fun HistoryItem(scan: ScanResult, onClick: () -> Unit, onDelete: () -> Unit) {
    val gradeColor = scan.overallGrade.color()
    val fmt        = remember { SimpleDateFormat("dd.MM.yyyy HH:mm", Locale.getDefault()) }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(Surface)
            .clickable(onClick = onClick)
            .padding(14.dp),
        verticalAlignment   = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        // Grade badge
        Box(
            modifier = Modifier
                .size(48.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(gradeColor.copy(alpha = 0.15f)),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text       = scan.overallGrade.name,
                fontSize   = 20.sp,
                fontWeight = FontWeight.Bold,
                color      = gradeColor,
            )
        }

        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Text(
                text  = fmt.format(Date(scan.timestamp)),
                style = MaterialTheme.typography.bodyMedium,
                color = TextPrimary,
                fontWeight = FontWeight.Medium,
            )
            if (!scan.failed) {
                Text(
                    text  = "Матрица ${scan.matrixSize} · ${"%.1f".format(scan.overallScore)}/4.0",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary,
                )
            } else {
                Text(
                    text  = "DataMatrix не обнаружен",
                    style = MaterialTheme.typography.bodySmall,
                    color = GradeF.copy(alpha = 0.8f),
                )
            }
        }

        IconButton(onClick = onDelete, modifier = Modifier.size(32.dp)) {
            Icon(Icons.Default.DeleteSweep, contentDescription = "Удалить", tint = TextMuted, modifier = Modifier.size(18.dp))
        }
    }
}
