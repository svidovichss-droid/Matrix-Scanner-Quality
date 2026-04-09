package com.progress.datamatrix.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.progress.datamatrix.data.QualityGrade
import com.progress.datamatrix.data.color
import com.progress.datamatrix.data.label
import com.progress.datamatrix.ui.theme.SurfaceBorder
import com.progress.datamatrix.ui.theme.TextSecondary

@Composable
fun GradeRing(
    grade:     QualityGrade,
    score:     Float,
    size:      Dp = 160.dp,
    strokeWidth: Dp = 12.dp,
) {
    val gradeColor = grade.color()
    val sweep by animateFloatAsState(
        targetValue = (score / 4f) * 360f,
        animationSpec = tween(durationMillis = 1000, easing = FastOutSlowInEasing),
        label = "sweep",
    )

    Box(contentAlignment = Alignment.Center) {
        Canvas(modifier = Modifier.size(size)) {
            val stroke = Stroke(width = strokeWidth.toPx(), cap = StrokeCap.Round)
            val inset  = strokeWidth.toPx() / 2f
            val arcSize = Size(this.size.width - inset * 2, this.size.height - inset * 2)
            val topLeft = Offset(inset, inset)

            drawArc(
                color       = SurfaceBorder,
                startAngle  = -90f,
                sweepAngle  = 360f,
                useCenter   = false,
                topLeft     = topLeft,
                size        = arcSize,
                style       = stroke,
            )
            drawArc(
                color       = gradeColor,
                startAngle  = -90f,
                sweepAngle  = sweep,
                useCenter   = false,
                topLeft     = topLeft,
                size        = arcSize,
                style       = stroke,
            )
        }

        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text       = grade.name,
                fontSize   = 52.sp,
                fontWeight = FontWeight.Bold,
                color      = gradeColor,
            )
            Text(
                text  = "%.1f / 4.0".format(score),
                style = MaterialTheme.typography.bodySmall,
                color = TextSecondary,
            )
            Text(
                text  = grade.label(),
                style = MaterialTheme.typography.labelSmall,
                color = gradeColor.copy(alpha = 0.8f),
            )
        }
    }
}
