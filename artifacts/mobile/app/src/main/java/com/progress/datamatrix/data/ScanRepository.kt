package com.progress.datamatrix.data

import android.content.Context
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext

class ScanRepository(context: Context) {

    private val prefs = context.getSharedPreferences("scan_history", Context.MODE_PRIVATE)
    private val gson: Gson = GsonBuilder().create()
    private val KEY = "scans_json"

    private val _scans = MutableStateFlow<List<ScanResult>>(emptyList())
    val scans: StateFlow<List<ScanResult>> = _scans.asStateFlow()

    init {
        _scans.value = load()
    }

    suspend fun addScan(scan: ScanResult) = withContext(Dispatchers.IO) {
        val updated = listOf(scan) + _scans.value
        _scans.value = updated
        save(updated)
    }

    suspend fun deleteScan(id: String) = withContext(Dispatchers.IO) {
        val updated = _scans.value.filter { it.id != id }
        _scans.value = updated
        save(updated)
    }

    suspend fun clearAll() = withContext(Dispatchers.IO) {
        _scans.value = emptyList()
        prefs.edit().remove(KEY).apply()
    }

    private fun load(): List<ScanResult> = try {
        val json = prefs.getString(KEY, null) ?: return emptyList()
        val type = object : TypeToken<List<ScanResultDto>>() {}.type
        val dtos: List<ScanResultDto> = gson.fromJson(json, type)
        dtos.map { it.toDomain() }
    } catch (_: Exception) { emptyList() }

    private fun save(scans: List<ScanResult>) {
        val dtos = scans.map { ScanResultDto.fromDomain(it) }
        prefs.edit().putString(KEY, gson.toJson(dtos)).apply()
    }
}

/* DTO mirrors ScanResult with primitive-only fields for Gson */
private data class QualityMetricDto(
    val name: String, val nameRu: String,
    val value: Float, val grade: String, val description: String,
) {
    fun toDomain() = QualityMetric(
        name        = name,
        nameRu      = nameRu,
        value       = value,
        grade       = QualityGrade.valueOf(grade),
        description = description,
    )
    companion object {
        fun fromDomain(m: QualityMetric) = QualityMetricDto(
            name        = m.name,
            nameRu      = m.nameRu,
            value       = m.value,
            grade       = m.grade.name,
            description = m.description,
        )
    }
}

private data class ScanResultDto(
    val id: String, val timestamp: Long,
    val overallGrade: String, val overallScore: Float,
    val matrixSize: String, val size: String, val moduleSize: Float,
    val metrics: List<QualityMetricDto>, val failed: Boolean,
) {
    fun toDomain() = ScanResult(
        id           = id,
        timestamp    = timestamp,
        overallGrade = QualityGrade.valueOf(overallGrade),
        overallScore = overallScore,
        matrixSize   = matrixSize,
        size         = size,
        moduleSize   = moduleSize,
        metrics      = metrics.map { it.toDomain() },
        failed       = failed,
    )
    companion object {
        fun fromDomain(s: ScanResult) = ScanResultDto(
            id           = s.id,
            timestamp    = s.timestamp,
            overallGrade = s.overallGrade.name,
            overallScore = s.overallScore,
            matrixSize   = s.matrixSize,
            size         = s.size,
            moduleSize   = s.moduleSize,
            metrics      = s.metrics.map { QualityMetricDto.fromDomain(it) },
            failed       = s.failed,
        )
    }
}
