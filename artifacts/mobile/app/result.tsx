import React, { useEffect } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useScanHistory } from "@/context/ScanHistoryContext";
import { Colors } from "@/constants/colors";
import { formatTimestamp, gradeColor, gradeLabel } from "@/utils/qualityAnalysis";
import { GradeRing } from "@/components/GradeRing";
import { MetricRow } from "@/components/MetricRow";

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { history, deleteScan } = useScanHistory();

  const scan = history.find((s) => s.id === id);

  useEffect(() => {
    if (scan) {
      if (scan.overallGrade === "A" || scan.overallGrade === "B") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (scan.overallGrade === "D" || scan.overallGrade === "F") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    }
  }, [scan]);

  if (!scan) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.notFound}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.notFoundText}>Результат не найден</Text>
        </View>
      </View>
    );
  }

  const color = gradeColor(scan.overallGrade);

  function handleDelete() {
    Alert.alert(
      "Удалить результат",
      "Вы уверены, что хотите удалить этот результат сканирования?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: () => {
            deleteScan(scan.id);
            router.back();
          },
        },
      ]
    );
  }

  function handleShare() {
    const text =
      `DataMatrix — Анализ качества печати\n` +
      `ГОСТ Р 57302-2016\n\n` +
      `Итоговая оценка: ${scan.overallGrade} (${gradeLabel(scan.overallGrade)})\n` +
      `Счёт: ${scan.overallScore.toFixed(1)}/4.0\n\n` +
      `Матрица: ${scan.matrixSize} · Размер: ${scan.size}\n` +
      `Размер модуля: ${scan.moduleSize} мм\n\n` +
      `Показатели качества:\n` +
      scan.metrics.map((m) => `• ${m.name}: ${m.grade} — ${m.description}`).join("\n") +
      `\n\nАвтор: Александр Свидович`;

    Share.share({ message: text });
  }

  return (
    <View style={[styles.container]}>
      <LinearGradient
        colors={[`${color}22`, Colors.background]}
        style={[styles.headerGradient, { height: topPad + 260 }]}
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
          <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Результат анализа</Text>
          <View style={styles.topActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
              <Feather name="share" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleDelete}>
              <Feather name="trash-2" size={18} color={Colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.resultHeader}>
          <GradeRing grade={scan.overallGrade} score={scan.overallScore} size={180} />

          <View style={styles.gostBadge}>
            <MaterialCommunityIcons name="certificate" size={14} color={Colors.accent} />
            <Text style={styles.gostText}>ГОСТ Р 57302-2016</Text>
          </View>

          <Text style={styles.timestamp}>{formatTimestamp(scan.timestamp)}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Матрица</Text>
              <Text style={styles.infoValue}>{scan.matrixSize}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Размер</Text>
              <Text style={styles.infoValue}>{scan.size}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Модуль</Text>
              <Text style={styles.infoValue}>{scan.moduleSize} мм</Text>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Данные:</Text>
            <Text style={styles.dataValue} numberOfLines={2} selectable>
              {scan.data}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Параметры качества</Text>
        <Text style={styles.sectionSub}>
          8 параметров согласно ISO/IEC 15415 и ГОСТ Р 57302-2016
        </Text>

        <View style={styles.metricsContainer}>
          {scan.metrics.map((metric, idx) => (
            <MetricRow key={idx} metric={metric} />
          ))}
        </View>

        <View style={styles.summaryCard}>
          <LinearGradient
            colors={[`${color}15`, `${color}05`]}
            style={StyleSheet.absoluteFill}
            borderRadius={16}
          />
          <View style={styles.summaryRow}>
            <MaterialCommunityIcons name="information-outline" size={18} color={color} />
            <Text style={[styles.summaryTitle, { color }]}>Вывод</Text>
          </View>
          <Text style={styles.summaryText}>
            {scan.overallGrade === "A"
              ? "Качество печати отличное. Символ полностью соответствует требованиям ГОСТ Р 57302-2016. Готово к применению."
              : scan.overallGrade === "B"
              ? "Качество печати хорошее. Символ соответствует стандарту с незначительными отклонениями. Пригоден к использованию."
              : scan.overallGrade === "C"
              ? "Качество печати удовлетворительное. Символ находится на границе допустимых значений. Рекомендуется проверка оборудования."
              : scan.overallGrade === "D"
              ? "Качество печати плохое. Обнаружены существенные дефекты. Необходима регулировка параметров печати."
              : "Качество печати неприемлемо. Символ не соответствует ГОСТ Р 57302-2016. Производство необходимо остановить для диагностики."}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.scanAgainBtn}
          onPress={() => router.push("/scanner")}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDim]}
            style={styles.scanAgainGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <MaterialCommunityIcons name="barcode-scan" size={20} color={Colors.background} />
            <Text style={styles.scanAgainText}>Сканировать ещё</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  scroll: {
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  backBtn: {
    padding: 20,
  },
  topTitle: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontFamily: "Inter_600SemiBold",
  },
  topActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  resultHeader: {
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  gostBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.accentGlow,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: `${Colors.accent}33`,
  },
  gostText: {
    fontSize: 11,
    color: Colors.accent,
    fontFamily: "Inter_500Medium",
  },
  timestamp: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
  },
  infoCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontFamily: "Inter_600SemiBold",
  },
  infoDivider: {
    height: 1,
    backgroundColor: Colors.surfaceBorder,
    marginBottom: 12,
  },
  dataRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  dataLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: "Inter_500Medium",
    marginTop: 1,
  },
  dataValue: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 17,
    color: Colors.textPrimary,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    marginBottom: 16,
  },
  metricsContainer: {
    marginBottom: 16,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 20,
    overflow: "hidden",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  summaryText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  scanAgainBtn: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 8,
  },
  scanAgainGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  scanAgainText: {
    fontSize: 16,
    color: Colors.background,
    fontFamily: "Inter_600SemiBold",
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFoundText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
  },
});
