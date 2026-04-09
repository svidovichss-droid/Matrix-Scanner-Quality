package com.progress.datamatrix.analysis

import com.progress.datamatrix.data.QualityGrade
import com.progress.datamatrix.data.QualityMetric
import com.progress.datamatrix.data.ScanResult
import java.util.UUID
import kotlin.math.*
import kotlin.random.Random

private fun scoreToGrade(score: Float): QualityGrade = when {
    score >= 3.5f -> QualityGrade.A
    score >= 2.5f -> QualityGrade.B
    score >= 1.5f -> QualityGrade.C
    score >= 0.5f -> QualityGrade.D
    else          -> QualityGrade.F
}

private fun randomGaussian(mean: Float, std: Float): Float {
    var u = 0.0; var v = 0.0
    while (u == 0.0) u = Random.nextDouble()
    while (v == 0.0) v = Random.nextDouble()
    val normal = sqrt(-2.0 * ln(u)) * cos(2.0 * PI * v)
    return (mean + std * normal).toFloat()
}

private fun clamp(v: Float, lo: Float, hi: Float) = v.coerceIn(lo, hi)

private data class MetricDef(
    val name:   String,
    val nameRu: String,
    val descFn: (QualityGrade) -> String,
)

private val METRIC_DEFS = listOf(
    MetricDef("Decode (Decode)", "Декодируемость") { g ->
        when (g) {
            QualityGrade.A -> "Символ надёжно декодируется"
            QualityGrade.B -> "Декодирование успешно с незначительными ошибками"
            QualityGrade.C -> "Декодирование возможно при повторных попытках"
            else           -> "Декодирование затруднено — критические ошибки"
        }
    },
    MetricDef("SC (Symbol Contrast)", "Символьный контраст") { g ->
        when (g) {
            QualityGrade.A -> "Высокий контраст ≥ 70%"
            QualityGrade.B -> "Контраст 55–70%"
            QualityGrade.C -> "Контраст 40–55%, на границе нормы"
            else           -> "Контраст < 40% — ниже допустимого"
        }
    },
    MetricDef("MOD (Modulation)", "Модуляция") { g ->
        when (g) {
            QualityGrade.A -> "Равномерная модуляция модулей ≥ 0.8"
            QualityGrade.B -> "Модуляция 0.6–0.8, допустимо"
            QualityGrade.C -> "Модуляция 0.4–0.6, неравномерность"
            else           -> "Модуляция < 0.4 — критический дефект"
        }
    },
    MetricDef("MRD (Min Reflectance Diff)", "Минимальная разница отражений") { g ->
        when (g) {
            QualityGrade.A -> "Разница отражений в норме, ≥ 15%"
            QualityGrade.B -> "Разница отражений 10–15%"
            QualityGrade.C -> "Разница отражений 5–10%, требует контроля"
            else           -> "Разница отражений < 5% — недопустимо"
        }
    },
    MetricDef("AN (Axial Non-uniformity)", "Осевая неравномерность") { g ->
        when (g) {
            QualityGrade.A -> "Осевая неравномерность ≤ 6%"
            QualityGrade.B -> "Осевая неравномерность 6–10%"
            QualityGrade.C -> "Осевая неравномерность 10–20%"
            else           -> "Осевая неравномерность > 20%"
        }
    },
    MetricDef("UEC (Unused Error Correction)", "Неиспользованная коррекция ошибок") { g ->
        when (g) {
            QualityGrade.A -> "Коррекция ошибок > 62%"
            QualityGrade.B -> "Коррекция ошибок 50–62%"
            QualityGrade.C -> "Коррекция ошибок 37–50%"
            else           -> "Коррекция ошибок < 37% — критично"
        }
    },
    MetricDef("GN (Grid Non-uniformity)", "Неравномерность сетки") { g ->
        when (g) {
            QualityGrade.A -> "Искажение сетки ≤ 8%"
            QualityGrade.B -> "Искажение сетки 8–12%"
            QualityGrade.C -> "Искажение сетки 12–20%"
            else           -> "Искажение сетки > 20%"
        }
    },
    MetricDef("FPD (Fixed Pattern Damage)", "Повреждение стационарного шаблона") { g ->
        when (g) {
            QualityGrade.A -> "Стационарный шаблон не повреждён"
            QualityGrade.B -> "Незначительные повреждения шаблона"
            QualityGrade.C -> "Умеренные повреждения шаблона"
            else           -> "Критические повреждения шаблона"
        }
    },
)

private val MATRIX_SIZES = listOf(
    "10×10","12×12","14×14","16×16","18×18",
    "20×20","22×22","24×24","26×26","32×32",
)

fun analyzeDataMatrix(imageVariance: Float? = null): ScanResult {
    val quality = imageVariance ?: (0.75f + Random.nextFloat() * 0.25f)
    val baseScore = clamp(randomGaussian(quality * 4f, 0.4f), 0f, 4f)

    val metrics = METRIC_DEFS.map { def ->
        val raw    = clamp(randomGaussian(baseScore, 0.5f), 0f, 4f)
        val rounded = Math.round(raw * 2) / 2f
        val grade  = scoreToGrade(rounded)
        QualityMetric(
            name        = def.name,
            nameRu      = def.nameRu,
            value       = rounded,
            grade       = grade,
            description = def.descFn(grade),
        )
    }

    val minScore = metrics.minOf { it.value }
    return ScanResult(
        id           = UUID.randomUUID().toString(),
        timestamp    = System.currentTimeMillis(),
        overallGrade = scoreToGrade(minScore),
        overallScore = minScore,
        matrixSize   = MATRIX_SIZES.random(),
        size         = "${(10..30).random()}×${(10..30).random()} мм",
        moduleSize   = ((20..60).random() / 10f),
        metrics      = metrics,
        failed       = false,
    )
}

fun createFailedScan(): ScanResult {
    val failMetric = { name: String, nameRu: String ->
        QualityMetric(
            name        = name,
            nameRu      = nameRu,
            value       = 0f,
            grade       = QualityGrade.F,
            description = "DataMatrix не обнаружен в кадре",
        )
    }
    return ScanResult(
        id           = UUID.randomUUID().toString(),
        timestamp    = System.currentTimeMillis(),
        overallGrade = QualityGrade.F,
        overallScore = 0f,
        matrixSize   = "—",
        size         = "—",
        moduleSize   = 0f,
        metrics      = METRIC_DEFS.map { failMetric(it.name, it.nameRu) },
        failed       = true,
    )
}

