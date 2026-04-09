package com.progress.datamatrix.ui.screens

import android.content.Context
import android.os.VibrationEffect
import android.os.Vibrator
import android.util.Log
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.FlashOff
import androidx.compose.material.icons.filled.FlashOn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.navigation.NavController
import com.google.accompanist.permissions.*
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import com.progress.datamatrix.analysis.analyzeDataMatrix
import com.progress.datamatrix.analysis.createFailedScan
import com.progress.datamatrix.data.ScanRepository
import com.progress.datamatrix.navigation.Screen
import com.progress.datamatrix.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.util.concurrent.Executors

@OptIn(ExperimentalPermissionsApi::class)
@Composable
fun ScannerScreen(repo: ScanRepository, navController: NavController) {
    val cameraPermission = rememberPermissionState(android.Manifest.permission.CAMERA)
    LaunchedEffect(Unit) { cameraPermission.launchPermissionRequest() }

    when {
        cameraPermission.status.isGranted -> ScannerContent(repo = repo, navController = navController)
        cameraPermission.status.shouldShowRationale -> PermissionRationale(
            onRequest = { cameraPermission.launchPermissionRequest() },
            onBack    = { navController.popBackStack() },
        )
        else -> PermissionDenied(onBack = { navController.popBackStack() })
    }
}

@Composable
private fun ScannerContent(repo: ScanRepository, navController: NavController) {
    val context       = LocalContext.current
    val lifecycle     = LocalLifecycleOwner.current
    val coroutine     = rememberCoroutineScope()

    var barcodeFound   by remember { mutableStateOf(false) }
    var countdown      by remember { mutableIntStateOf(-1) }
    var isAnalyzing    by remember { mutableStateOf(false) }
    var torchEnabled   by remember { mutableStateOf(false) }
    var cameraControl  by remember { mutableStateOf<CameraControl?>(null) }

    val executor = remember { Executors.newSingleThreadExecutor() }
    val options  = remember {
        BarcodeScannerOptions.Builder()
            .setBarcodeFormats(Barcode.FORMAT_DATA_MATRIX, Barcode.FORMAT_QR_CODE)
            .build()
    }
    val scanner = remember { BarcodeScanning.getClient(options) }

    fun vibrate(pattern: LongArray) {
        @Suppress("DEPRECATION")
        val v = context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        v.vibrate(VibrationEffect.createWaveform(pattern, -1))
    }

    fun navigateResult(scanId: String) {
        navController.navigate(Screen.Result.go(scanId)) {
            popUpTo(Screen.Scanner.route) { inclusive = true }
        }
    }

    fun performAnalysis(found: Boolean) {
        if (isAnalyzing) return
        isAnalyzing = true
        coroutine.launch {
            val result = if (found) analyzeDataMatrix() else createFailedScan()
            repo.addScan(result)
            navigateResult(result.id)
        }
    }

    fun startCountdown() {
        if (barcodeFound || isAnalyzing) return
        barcodeFound = true
        vibrate(longArrayOf(0, 50))
        coroutine.launch {
            countdown = 3
            repeat(3) { i ->
                delay(800)
                countdown = 2 - i
                if (countdown <= 0) {
                    countdown = -1
                    performAnalysis(true)
                } else {
                    vibrate(longArrayOf(0, 30))
                }
            }
        }
    }

    Box(modifier = Modifier.fillMaxSize().background(Color.Black)) {

        // Camera preview
        AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory  = { ctx ->
                val previewView = PreviewView(ctx)
                val future = ProcessCameraProvider.getInstance(ctx)
                future.addListener({
                    val provider = future.get()
                    val preview  = Preview.Builder().build().also {
                        it.surfaceProvider = previewView.surfaceProvider
                    }
                    val analysis = ImageAnalysis.Builder()
                        .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                        .build()
                        .also { ia ->
                            ia.setAnalyzer(executor) { proxy ->
                                val mediaImage = proxy.image
                                if (mediaImage != null && !barcodeFound && !isAnalyzing) {
                                    val image = InputImage.fromMediaImage(
                                        mediaImage, proxy.imageInfo.rotationDegrees
                                    )
                                    scanner.process(image)
                                        .addOnSuccessListener { codes ->
                                            if (codes.any { it.format == Barcode.FORMAT_DATA_MATRIX }) {
                                                startCountdown()
                                            }
                                        }
                                        .addOnCompleteListener { proxy.close() }
                                } else {
                                    proxy.close()
                                }
                            }
                        }
                    try {
                        provider.unbindAll()
                        val cam = provider.bindToLifecycle(
                            lifecycle,
                            CameraSelector.DEFAULT_BACK_CAMERA,
                            preview,
                            analysis,
                        )
                        cameraControl = cam.cameraControl
                    } catch (e: Exception) {
                        Log.e("Scanner", "Camera bind failed", e)
                    }
                }, ContextCompat.getMainExecutor(ctx))
                previewView
            },
        )

        // Scan frame overlay
        Box(
            modifier        = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center,
        ) {
            val frameSize = 260.dp
            val cornerLen = 36.dp
            val thickness = 3.dp
            val frameColor = if (barcodeFound) Primary else Color.White.copy(alpha = 0.6f)

            Box(modifier = Modifier.size(frameSize)) {
                // Corners
                listOf(
                    Alignment.TopStart, Alignment.TopEnd,
                    Alignment.BottomStart, Alignment.BottomEnd,
                ).forEach { align ->
                    Box(modifier = Modifier.align(align).size(cornerLen)) {
                        val isRight  = align == Alignment.TopEnd || align == Alignment.BottomEnd
                        val isBottom = align == Alignment.BottomStart || align == Alignment.BottomEnd
                        // Horizontal bar
                        Box(
                            modifier = Modifier
                                .width(cornerLen).height(thickness)
                                .align(if (isBottom) Alignment.BottomStart else Alignment.TopStart)
                                .background(frameColor, RoundedCornerShape(2.dp)),
                        )
                        // Vertical bar
                        Box(
                            modifier = Modifier
                                .width(thickness).height(cornerLen)
                                .align(if (isRight) Alignment.TopEnd else Alignment.TopStart)
                                .background(frameColor, RoundedCornerShape(2.dp)),
                        )
                    }
                }

                // Scan line animation
                if (!barcodeFound && !isAnalyzing) {
                    val position by rememberInfiniteTransition(label = "scan")
                        .animateFloat(
                            initialValue   = 0f,
                            targetValue    = 1f,
                            animationSpec  = infiniteRepeatable(
                                tween(1600, easing = LinearEasing),
                                RepeatMode.Reverse,
                            ),
                            label = "line",
                        )
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(2.dp)
                            .offset(y = (frameSize * position) - (frameSize / 2))
                            .background(Primary.copy(alpha = 0.7f)),
                    )
                }
            }
        }

        // Top bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment     = Alignment.CenterVertically,
        ) {
            IconButton(onClick = { navController.popBackStack() }) {
                Icon(
                    Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Назад",
                    tint   = Color.White,
                    modifier = Modifier.size(24.dp),
                )
            }
            Text("Сканирование", color = Color.White, fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
            IconButton(onClick = {
                torchEnabled = !torchEnabled
                cameraControl?.enableTorch(torchEnabled)
            }) {
                Icon(
                    imageVector = if (torchEnabled) Icons.Default.FlashOn else Icons.Default.FlashOff,
                    contentDescription = "Фонарик",
                    tint = if (torchEnabled) Primary else Color.White,
                )
            }
        }

        // Bottom panel
        Column(
            modifier            = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .navigationBarsPadding()
                .padding(bottom = 40.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            // Status hint
            AnimatedContent(
                targetState = when {
                    isAnalyzing  -> "Анализ…"
                    countdown > 0 -> "Захват через $countdown…"
                    barcodeFound -> "DataMatrix обнаружен"
                    else         -> "Наведите камеру на DataMatrix"
                },
                transitionSpec = { fadeIn() togetherWith fadeOut() },
                label = "hint",
            ) { text ->
                Text(
                    text  = text,
                    color = if (barcodeFound) Primary else Color.White.copy(0.85f),
                    style = MaterialTheme.typography.bodyMedium,
                )
            }

            // Manual capture button
            Box(
                modifier = Modifier
                    .size(72.dp)
                    .clip(CircleShape)
                    .border(3.dp, if (isAnalyzing) Color.Gray else Color.White, CircleShape)
                    .background(Color.Transparent),
                contentAlignment = Alignment.Center,
            ) {
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .clip(CircleShape)
                        .background(if (isAnalyzing) Color.Gray else Color.White)
                        .then(
                            if (!isAnalyzing) Modifier.clickableNoRipple {
                                vibrate(longArrayOf(0, 80))
                                performAnalysis(barcodeFound)
                            } else Modifier
                        ),
                )
            }

            Text(
                text  = "Нажмите для захвата вручную",
                style = MaterialTheme.typography.labelSmall,
                color = Color.White.copy(0.6f),
            )
        }

        // Analyzing overlay
        if (isAnalyzing) {
            Box(
                modifier         = Modifier.fillMaxSize().background(Color.Black.copy(alpha = 0.6f)),
                contentAlignment = Alignment.Center,
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    CircularProgressIndicator(color = Primary, strokeWidth = 3.dp)
                    Text("Анализ качества…", color = Color.White, fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}

private fun Modifier.clickableNoRipple(onClick: () -> Unit) =
    this.then(
        Modifier.clickable(
            interactionSource = null,
            indication        = null,
            onClick           = onClick,
        )
    )

@Composable
private fun PermissionRationale(onRequest: () -> Unit, onBack: () -> Unit) {
    Column(
        modifier            = Modifier.fillMaxSize().background(Background).padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text("Требуется доступ к камере", style = MaterialTheme.typography.titleLarge, color = TextPrimary)
        Spacer(Modifier.height(12.dp))
        Text("Для сканирования DataMatrix необходим доступ к камере устройства.", color = TextSecondary, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
        Spacer(Modifier.height(24.dp))
        Button(onClick = onRequest) { Text("Разрешить") }
        TextButton(onClick = onBack)  { Text("Назад") }
    }
}

@Composable
private fun PermissionDenied(onBack: () -> Unit) {
    Column(
        modifier            = Modifier.fillMaxSize().background(Background).padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text("Доступ к камере запрещён", style = MaterialTheme.typography.titleLarge, color = GradeF)
        Spacer(Modifier.height(12.dp))
        Text("Разрешите доступ к камере в настройках приложения.", color = TextSecondary, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
        Spacer(Modifier.height(24.dp))
        TextButton(onClick = onBack) { Text("Назад") }
    }
}
