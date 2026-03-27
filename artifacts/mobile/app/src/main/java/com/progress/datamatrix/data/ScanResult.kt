package com.progress.datamatrix.data

import androidx.compose.ui.graphics.Color
import com.progress.datamatrix.ui.theme.*

enum class QualityGrade { A, B, C, D, F }

fun QualityGrade.color(): Color = when (this) {
    QualityGrade.A -> GradeA
    QualityGrade.B -> GradeB
    QualityGrade.C -> GradeC
    QualityGrade.D -> GradeD
    QualityGrade.F -> GradeF
}

fun QualityGrade.label(): String = when (this) {
    QualityGrade.A -> "Отлично"
    QualityGrade.B -> "Хорошо"
    QualityGrade.C -> "Удовлетворительно"
    QualityGrade.D -> "Плохо"
    QualityGrade.F -> "Неприемлемо"
}

data class QualityMetric(
    val name:        String,
    val nameRu:      String,
    val value:       Float,
    val grade:       QualityGrade,
    val description: String,
)

data class ScanResult(
    val id:           String,
    val timestamp:    Long,
    val overallGrade: QualityGrade,
    val overallScore: Float,
    val matrixSize:   String,
    val size:         String,
    val moduleSize:   Float,
    val metrics:      List<QualityMetric>,
    val failed:       Boolean = false,
)
