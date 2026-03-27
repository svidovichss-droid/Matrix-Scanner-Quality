package com.progress.datamatrix.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColors = darkColorScheme(
    primary          = Primary,
    onPrimary        = Color(0xFF001F2E),
    secondary        = Accent,
    onSecondary      = Color(0xFF00201A),
    background       = Background,
    onBackground     = TextPrimary,
    surface          = Surface,
    onSurface        = TextPrimary,
    surfaceVariant   = SurfaceHigh,
    onSurfaceVariant = TextSecondary,
    outline          = SurfaceBorder,
    error            = GradeF,
)

@Composable
fun DataMatrixTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColors,
        typography  = AppTypography,
        content     = content,
    )
}
