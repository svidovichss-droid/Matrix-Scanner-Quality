package com.progress.datamatrix.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.progress.datamatrix.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AboutScreen(navController: NavController) {
    Scaffold(
        containerColor = Background,
        topBar = {
            TopAppBar(
                title = { Text("О приложении", color = TextPrimary) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Назад", tint = TextSecondary)
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
                // Hero card
                Column(
                    modifier            = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(20.dp))
                        .background(Surface)
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    Icon(Icons.Default.QrCodeScanner, contentDescription = null, tint = Primary, modifier = Modifier.size(48.dp))
                    Text("DataMatrix Scanner", style = MaterialTheme.typography.titleLarge, color = TextPrimary)
                    Text("Анализатор качества печати", style = MaterialTheme.typography.bodyMedium, color = TextSecondary)
                    Divider(modifier = Modifier.width(60.dp).padding(vertical = 4.dp), color = SurfaceBorder, thickness = 1.dp)
                    Text("А. Свидович / А. Петляков · PROGRESS", fontSize = 14.sp, color = Primary, fontWeight = FontWeight.SemiBold)
                    Text("Версия 1.0 · 2026", style = MaterialTheme.typography.bodySmall, color = TextMuted)
                }
            }

            item {
                InfoSection(icon = Icons.Default.Info, title = "Что делает приложение") {
                    BodyText("Приложение предназначено для оценки качества печати двумерных штрихкодов формата DataMatrix непосредственно на производстве или в логистических цепочках.")
                    Spacer(Modifier.height(8.dp))
                    BodyText("Камера устройства захватывает изображение символа, система автоматически обнаруживает область DataMatrix, вычисляет комплекс метрологических показателей и формирует итоговую оценку качества по шкале A–F.")
                    Spacer(Modifier.height(8.dp))
                    BulletList(
                        listOf(
                            "Автоматический захват области DataMatrix без ручного кадрирования",
                            "Мгновенный анализ 8 параметров качества согласно стандарту",
                            "Итоговая оценка по международной шкале (4.0 — отлично, 0 — неприемлемо)",
                            "Хранение истории сканирований с фильтрацией и поиском",
                            "Экспорт результатов и диагностических данных",
                        )
                    )
                }
            }

            item {
                InfoSection(icon = Icons.Default.MenuBook, title = "Применяемый стандарт", accentColor = Accent) {
                    StandardCard(
                        title    = "ГОСТ Р 57302-2016",
                        subtitle = "Национальный стандарт Российской Федерации",
                        body     = "Автоматическая идентификация. Кодирование штриховое. Спецификация символики DataMatrix.",
                    )
                    Spacer(Modifier.height(8.dp))
                    StandardCard(
                        title    = "ISO/IEC 15415:2011",
                        subtitle = "Международный стандарт",
                        body     = "Information technology — Automatic identification and data capture techniques — Bar code print quality test specification: Two-dimensional symbols.",
                    )
                }
            }

            item {
                InfoSection(icon = Icons.Default.Science, title = "Методы анализа") {
                    BulletList(
                        listOf(
                            "Фотометрический анализ отражательной способности модулей",
                            "Геометрическая коррекция перспективных искажений",
                            "Коррекция ошибок Рида–Соломона (Reed-Solomon)",
                            "Статистический анализ модульной сетки",
                            "Оценка повреждений стационарного шаблона (L-рамка)",
                            "Контрастометрия тёмных и светлых элементов",
                        )
                    )
                }
            }

            item {
                InfoSection(icon = Icons.Default.Analytics, title = "Отображаемые параметры", accentColor = GradeB) {
                    val metrics = listOf(
                        "Decode" to "Декодируемость символа",
                        "SC" to "Символьный контраст",
                        "MOD" to "Модуляция модулей",
                        "MRD" to "Минимальная разница отражений",
                        "AN" to "Осевая неравномерность",
                        "UEC" to "Неиспользованная коррекция ошибок",
                        "GN" to "Неравномерность сетки",
                        "FPD" to "Повреждение стационарного шаблона",
                    )
                    metrics.forEach { (abbr, full) ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment     = Alignment.CenterVertically,
                        ) {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(Primary.copy(alpha = 0.15f))
                                    .padding(horizontal = 8.dp, vertical = 2.dp),
                            ) {
                                Text(abbr, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Primary)
                            }
                            Text(full, style = MaterialTheme.typography.bodySmall, color = TextSecondary)
                        }
                    }
                }
            }

            item {
                InfoSection(icon = Icons.Default.Grade, title = "Шкала оценок", accentColor = GradeC) {
                    val grades = listOf(
                        Triple("A", "3.5–4.0", "Отлично — соответствует всем требованиям"),
                        Triple("B", "2.5–3.4", "Хорошо — незначительные отклонения"),
                        Triple("C", "1.5–2.4", "Удовлетворительно — требует контроля"),
                        Triple("D", "0.5–1.4", "Плохо — серьёзные нарушения"),
                        Triple("F", "0–0.4",   "Неприемлемо — не соответствует стандарту"),
                    )
                    val colors = listOf(GradeA, GradeB, GradeC, GradeD, GradeF)
                    grades.forEachIndexed { i, (g, range, desc) ->
                        val c = colors[i]
                        Row(
                            modifier  = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 5.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(32.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(c.copy(alpha = 0.15f)),
                                contentAlignment = Alignment.Center,
                            ) {
                                Text(g, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = c)
                            }
                            Column {
                                Text(range, style = MaterialTheme.typography.labelSmall, color = c)
                                Text(desc,  style = MaterialTheme.typography.bodySmall,  color = TextSecondary)
                            }
                        }
                    }
                }
            }

            item {
                // Author card
                Column(
                    modifier            = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(20.dp))
                        .background(Primary.copy(alpha = 0.08f))
                        .padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    Icon(Icons.Default.Person, contentDescription = null, tint = Primary, modifier = Modifier.size(32.dp))
                    Text("А. Свидович / А. Петляков", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                    Text("PROGRESS", fontSize = 14.sp, color = Primary, fontWeight = FontWeight.SemiBold)
                    Divider(modifier = Modifier.width(40.dp).padding(vertical = 6.dp), color = SurfaceBorder)
                    Text(
                        text  = "Приложение разработано специально для PROGRESS.\nВсе права защищены © 2026.",
                        style = MaterialTheme.typography.bodySmall,
                        color = TextSecondary,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                    )
                }
            }

            item { Spacer(Modifier.height(8.dp)) }
        }
    }
}

@Composable
private fun InfoSection(
    icon:        ImageVector,
    title:       String,
    accentColor: androidx.compose.ui.graphics.Color = Primary,
    content:     @Composable ColumnScope.() -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(Surface)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Row(
            verticalAlignment     = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(accentColor.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(icon, contentDescription = null, tint = accentColor, modifier = Modifier.size(20.dp))
            }
            Text(title, style = MaterialTheme.typography.titleMedium, color = TextPrimary, fontWeight = FontWeight.Bold)
        }
        Column(content = content)
    }
}

@Composable
private fun StandardCard(title: String, subtitle: String, body: String) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(SurfaceHigh)
            .padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        Text(title,    style = MaterialTheme.typography.labelLarge, color = Primary, fontWeight = FontWeight.Bold)
        Text(subtitle, style = MaterialTheme.typography.labelSmall, color = TextMuted)
        Spacer(Modifier.height(2.dp))
        Text(body,     style = MaterialTheme.typography.bodySmall,  color = TextSecondary)
    }
}

@Composable
private fun BodyText(text: String) {
    Text(text, style = MaterialTheme.typography.bodyMedium, color = TextSecondary)
}

@Composable
private fun BulletList(items: List<String>) {
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        items.forEach { item ->
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("•", color = Primary, fontWeight = FontWeight.Bold)
                Text(item, style = MaterialTheme.typography.bodySmall, color = TextSecondary)
            }
        }
    }
}
