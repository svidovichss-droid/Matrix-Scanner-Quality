import React, { useEffect, useRef } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useScanHistory } from "@/context/ScanHistoryContext";
import { Colors } from "@/constants/colors";
import { formatTimestamp, gradeColor } from "@/utils/qualityAnalysis";
import * as Haptics from "expo-haptics";

function PulsingDot() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900 }),
        withTiming(0.4, { duration: 900 })
      ),
      -1,
      false
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.pulseRing, animStyle]} />
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { history } = useScanHistory();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const lastScans = history.slice(0, 3);

  function handleScan() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/scanner");
  }

  function handleHistory() {
    router.push("/history");
  }

  function handleAbout() {
    router.push("/about");
  }

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>DataMatrix</Text>
            <Text style={styles.appSub}>Анализатор качества печати</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.histBtn} onPress={handleAbout}>
              <Feather name="info" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.histBtn} onPress={handleHistory}>
              <Feather name="clock" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.authorBadge}>
          <MaterialCommunityIcons name="barcode-scan" size={14} color={Colors.primary} />
          <Text style={styles.authorText}>ГОСТ Р 57302-2016 · А. Свидович · PROGRESS</Text>
        </View>

        <View style={styles.scanButtonContainer}>
          <View style={styles.outerRing}>
            <PulsingDot />
            <TouchableOpacity style={styles.scanButton} onPress={handleScan} activeOpacity={0.85}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDim]}
                style={styles.scanButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons name="barcode-scan" size={48} color={Colors.background} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <Text style={styles.scanHint}>Нажмите для сканирования</Text>
          <Text style={styles.scanHintSub}>DataMatrix · ISO/IEC 16022</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>{history.length}</Text>
            <Text style={styles.statLabel}>Сканирований</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.accent }]}>
              {history.filter((s) => s.overallGrade === "A" || s.overallGrade === "B").length}
            </Text>
            <Text style={styles.statLabel}>Успешных</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.error }]}>
              {history.filter((s) => s.overallGrade === "D" || s.overallGrade === "F").length}
            </Text>
            <Text style={styles.statLabel}>Дефектных</Text>
          </View>
        </View>

        {lastScans.length > 0 && (
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Последние сканирования</Text>
              <TouchableOpacity onPress={handleHistory}>
                <Text style={styles.seeAll}>Все</Text>
              </TouchableOpacity>
            </View>
            {lastScans.map((scan) => (
              <TouchableOpacity
                key={scan.id}
                style={styles.recentItem}
                onPress={() => router.push({ pathname: "/result", params: { id: scan.id } })}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.recentGrade,
                    { backgroundColor: `${gradeColor(scan.overallGrade)}22` },
                  ]}
                >
                  <Text
                    style={[
                      styles.recentGradeText,
                      { color: gradeColor(scan.overallGrade), fontFamily: "Inter_700Bold" },
                    ]}
                  >
                    {scan.overallGrade}
                  </Text>
                </View>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentTime}>{formatTimestamp(scan.timestamp)}</Text>
                </View>
                <Feather name="chevron-right" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {lastScans.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="barcode" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Нет данных</Text>
            <Text style={styles.emptyText}>
              Отсканируйте первый DataMatrix{"\n"}для анализа качества печати
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 8,
  },
  appName: {
    fontSize: 28,
    color: Colors.textPrimary,
    fontFamily: "Inter_700Bold",
  },
  appSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  histBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  authorBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primaryGlow,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 32,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: `${Colors.primary}33`,
  },
  authorText: {
    fontSize: 11,
    color: Colors.primary,
    fontFamily: "Inter_500Medium",
  },
  scanButtonContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  outerRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  pulseRing: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.primaryGlow,
    borderWidth: 2,
    borderColor: `${Colors.primary}44`,
  },
  scanButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    elevation: 8,
  },
  scanButtonGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  scanHint: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontFamily: "Inter_600SemiBold",
  },
  scanHintSub: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.surfaceBorder,
    marginVertical: 4,
  },
  recentSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontFamily: "Inter_600SemiBold",
  },
  seeAll: {
    fontSize: 13,
    color: Colors.primary,
    fontFamily: "Inter_500Medium",
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  recentGrade: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  recentGradeText: {
    fontSize: 18,
  },
  recentInfo: {
    flex: 1,
  },
  recentMatrix: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontFamily: "Inter_500Medium",
  },
  recentTime: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontFamily: "Inter_600SemiBold",
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
});
