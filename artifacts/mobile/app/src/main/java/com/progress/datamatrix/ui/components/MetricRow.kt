package com.progress.datamatrix.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.progress.datamatrix.data.QualityMetric
import com.progress.datamatrix.data.color
import com.progress.datamatrix.ui.theme.SurfaceBorder
import com.progress.datamatrix.ui.theme.SurfaceHigh
import com.progress.datamatrix.ui.theme.TextMuted
import com.progress.datamatrix.ui.theme.TextSecondary

@Composable
fun MetricRow(metric: QualityMetric) {
    val gradeColor = metric.grade.color()
    val progress by animateFloatAsState(
        targetValue   = metric.value / 4f,
        animationSpec = tween(800, easing = FastOutSlowInEasing),
        label         = "progress_${metric.name}",
    )

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(SurfaceHigh)
            .padding(14.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        Row(
            modifier            = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment   = Alignment.CenterVertically,
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text       = metric.nameRu,
                    style      = MaterialTheme.typography.labelLarge,
                    fontWeight = FontWeight.SemiBold,
                    color      = MaterialTheme.colorScheme.onSurface,
                )
                Text(
                    text  = metric.name,
                    style = MaterialTheme.typography.labelSmall,
                    color = TextMuted,
                )
            }
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(gradeColor.copy(alpha = 0.15f))
                    .padding(horizontal = 10.dp, vertical = 4.dp),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text       = metric.grade.name,
                    fontSize   = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color      = gradeColor,
                )
            }
        }

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(4.dp)
                .clip(RoundedCornerShape(2.dp))
                .background(SurfaceBorder),
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(progress)
                    .fillMaxHeight()
                    .clip(RoundedCornerShape(2.dp))
                    .background(gradeColor),
            )
        }

        Text(
            text  = metric.description,
            style = MaterialTheme.typography.bodySmall,
            color = TextSecondary,
        )
    }
}
