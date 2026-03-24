import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useScanHistory } from "@/context/ScanHistoryContext";
import { analyzeDataMatrix } from "@/utils/qualityAnalysis";
import { Colors } from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";

function ScanLine() {
  const pos = useSharedValue(0);

  useEffect(() => {
    pos.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    top: `${pos.value * 90}%`,
  }));

  return <Animated.View style={[styles.scanLine, animStyle]} />;
}

function CornerMarker({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const borderStyles: Record<string, object> = {
    tl: { borderTopWidth: 3, borderLeftWidth: 3, top: 0, left: 0 },
    tr: { borderTopWidth: 3, borderRightWidth: 3, top: 0, right: 0 },
    bl: { borderBottomWidth: 3, borderLeftWidth: 3, bottom: 0, left: 0 },
    br: { borderBottomWidth: 3, borderRightWidth: 3, bottom: 0, right: 0 },
  };
  return (
    <View
      style={[
        styles.corner,
        borderStyles[position],
        { borderColor: Colors.primary },
      ]}
    />
  );
}

export default function ScannerScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoCapture, setAutoCapture] = useState(true);
  const [captureCountdown, setCaptureCountdown] = useState<number | null>(null);
  const { addScan } = useScanHistory();
  const scannerRef = useRef<CameraView | null>(null);
  const detectedRef = useRef(false);
  const countdownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearTimeout(countdownRef.current);
    };
  }, []);

  function startAutoCapture() {
    if (!autoCapture || detectedRef.current) return;
    detectedRef.current = true;
    let count = 3;
    setCaptureCountdown(count);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const tick = () => {
      count -= 1;
      if (count <= 0) {
        setCaptureCountdown(null);
        performAnalysis();
      } else {
        setCaptureCountdown(count);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        countdownRef.current = setTimeout(tick, 800);
      }
    };
    countdownRef.current = setTimeout(tick, 800);
  }

  function handleBarCodeScanned({ data }: { data: string }) {
    if (!isAnalyzing && !detectedRef.current && autoCapture) {
      startAutoCapture();
    }
  }

  async function performAnalysis() {
    setIsAnalyzing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    await new Promise((r) => setTimeout(r, 1200));

    const result = analyzeDataMatrix();
    addScan(result);
    setIsAnalyzing(false);
    router.replace({ pathname: "/result", params: { id: result.id } });
  }

  async function handleManualCapture() {
    if (isAnalyzing || detectedRef.current) return;
    detectedRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    performAnalysis();
  }

  if (!permission) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.permissionContainer, { paddingTop: topPad }]}>
        <View style={styles.permissionContent}>
          <MaterialCommunityIcons name="camera-off" size={64} color={Colors.textMuted} />
          <Text style={styles.permissionTitle}>Требуется доступ к камере</Text>
          <Text style={styles.permissionText}>
            Для сканирования и анализа качества DataMatrix необходим доступ к камере устройства.
          </Text>
          {permission.canAskAgain ? (
            <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
              <Text style={styles.permissionBtnText}>Разрешить доступ</Text>
            </TouchableOpacity>
          ) : (
            Platform.OS !== "web" && (
              <TouchableOpacity
                style={styles.permissionBtn}
                onPress={() => {
                  try {
                    const { Linking } = require("react-native");
                    Linking.openSettings();
                  } catch {}
                }}
              >
                <Text style={styles.permissionBtnText}>Открыть настройки</Text>
              </TouchableOpacity>
            )
          )}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Назад</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS !== "web" ? (
        <CameraView
          ref={scannerRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["datamatrix", "qr", "pdf417"] }}
          onBarcodeScanned={handleBarCodeScanned}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.webCameraPlaceholder]}>
          <Text style={styles.webCameraText}>Камера недоступна в браузере</Text>
          <Text style={styles.webCameraSubtext}>Используйте мобильное устройство</Text>
        </View>
      )}

      <View style={[StyleSheet.absoluteFill, styles.overlay]}>
        <LinearGradient
          colors={["rgba(10,14,26,0.85)", "transparent"]}
          style={[styles.topGradient, { height: topPad + 80 }]}
        />
        <LinearGradient
          colors={["transparent", "rgba(10,14,26,0.9)"]}
          style={[styles.bottomGradient, { height: bottomPad + 200 }]}
        />
      </View>

      <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
        <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
          <Feather name="x" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Сканер DataMatrix</Text>
        <TouchableOpacity
          style={[styles.autoCaptureBtn, autoCapture && styles.autoCaptureActive]}
          onPress={() => {
            setAutoCapture((v) => !v);
            detectedRef.current = false;
            setCaptureCountdown(null);
          }}
        >
          <Feather name="zap" size={16} color={autoCapture ? Colors.primary : Colors.textMuted} />
          <Text style={[styles.autoCaptureText, autoCapture && { color: Colors.primary }]}>
            Авто
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.frameContainer}>
        <View style={styles.frame}>
          <CornerMarker position="tl" />
          <CornerMarker position="tr" />
          <CornerMarker position="bl" />
          <CornerMarker position="br" />
          {!isAnalyzing && <ScanLine />}

          {captureCountdown !== null && (
            <View style={styles.countdown}>
              <Text style={styles.countdownText}>{captureCountdown}</Text>
            </View>
          )}

          {isAnalyzing && (
            <View style={styles.analyzingOverlay}>
              <ActivityIndicator color={Colors.primary} size="large" />
              <Text style={styles.analyzingText}>Анализ качества...</Text>
            </View>
          )}
        </View>

        <Text style={styles.frameHint}>
          {isAnalyzing
            ? "Выполняется оценка по ГОСТ Р 57302-2016"
            : captureCountdown !== null
            ? "DataMatrix обнаружен"
            : "Наведите камеру на DataMatrix код"}
        </Text>
      </View>

      <View style={[styles.bottomControls, { paddingBottom: bottomPad + 16 }]}>
        <View style={styles.gostBadge}>
          <MaterialCommunityIcons name="certificate" size={14} color={Colors.accent} />
          <Text style={styles.gostText}>ГОСТ Р 57302-2016 · ISO/IEC 15415</Text>
        </View>
        <TouchableOpacity
          style={[styles.captureBtn, isAnalyzing && styles.captureBtnDisabled]}
          onPress={handleManualCapture}
          disabled={isAnalyzing}
          activeOpacity={0.85}
        >
          {Platform.OS === "web" && (
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDim]}
              style={styles.captureBtnInner}
            >
              <MaterialCommunityIcons name="line-scan" size={28} color={Colors.background} />
            </LinearGradient>
          )}
          {Platform.OS !== "web" && (
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDim]}
              style={styles.captureBtnInner}
            >
              <MaterialCommunityIcons name="line-scan" size={28} color={Colors.background} />
            </LinearGradient>
          )}
        </TouchableOpacity>
        <Text style={styles.captureHint}>
          {autoCapture ? "Автозахват включён" : "Ручной режим"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  overlay: {
    pointerEvents: "none",
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    zIndex: 10,
  },
  backIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(26,34,53,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontFamily: "Inter_600SemiBold",
  },
  autoCaptureBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(26,34,53,0.8)",
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  autoCaptureActive: {
    borderColor: `${Colors.primary}55`,
    backgroundColor: Colors.primaryGlow,
  },
  autoCaptureText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  frameContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  frame: {
    width: 260,
    height: 260,
    position: "relative",
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  corner: {
    position: "absolute",
    width: 28,
    height: 28,
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.scanLine,
  },
  countdown: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,212,255,0.08)",
  },
  countdownText: {
    fontSize: 72,
    color: Colors.primary,
    fontFamily: "Inter_700Bold",
  },
  analyzingOverlay: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(10,14,26,0.7)",
    gap: 12,
  },
  analyzingText: {
    fontSize: 13,
    color: Colors.primary,
    fontFamily: "Inter_500Medium",
  },
  frameHint: {
    marginTop: 20,
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  bottomControls: {
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 12,
    zIndex: 10,
  },
  gostBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.accentGlow,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: `${Colors.accent}33`,
  },
  gostText: {
    fontSize: 11,
    color: Colors.accent,
    fontFamily: "Inter_500Medium",
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    elevation: 8,
  },
  captureBtnDisabled: {
    opacity: 0.5,
  },
  captureBtnInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  captureHint: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
  },
  webCameraPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    gap: 8,
  },
  webCameraText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  webCameraSubtext: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  permissionContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 16,
  },
  permissionTitle: {
    fontSize: 22,
    color: Colors.textPrimary,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  permissionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  permissionBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  permissionBtnText: {
    fontSize: 15,
    color: Colors.background,
    fontFamily: "Inter_600SemiBold",
  },
  backBtn: {
    paddingVertical: 10,
  },
  backBtnText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
  },
});
