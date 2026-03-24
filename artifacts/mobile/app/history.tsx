import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useScanHistory } from "@/context/ScanHistoryContext";
import { Colors } from "@/constants/colors";
import { ScanCard } from "@/components/ScanCard";
import { QualityGrade } from "@/context/ScanHistoryContext";

const GRADE_FILTERS: (QualityGrade | "all")[] = ["all", "A", "B", "C", "D", "F"];

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { history, clearHistory } = useScanHistory();
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState<QualityGrade | "all">("all");

  const filtered = history.filter((s) => {
    const matchGrade = gradeFilter === "all" || s.overallGrade === gradeFilter;
    const matchSearch =
      search === "" ||
      s.data.toLowerCase().includes(search.toLowerCase()) ||
      s.matrixSize.includes(search) ||
      s.overallGrade.toLowerCase() === search.toLowerCase();
    return matchGrade && matchSearch;
  });

  function handleClear() {
    Alert.alert(
      "Очистить историю",
      "Все результаты сканирования будут удалены. Это действие нельзя отменить.",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Очистить",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            clearHistory();
          },
        },
      ]
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>История сканирований</Text>
        {history.length > 0 ? (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
            <Feather name="trash-2" size={18} color={Colors.error} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск по данным, оценке..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {GRADE_FILTERS.map((g) => (
          <TouchableOpacity
            key={g}
            style={[
              styles.filterChip,
              gradeFilter === g && styles.filterChipActive,
            ]}
            onPress={() => setGradeFilter(g)}
          >
            <Text
              style={[
                styles.filterChipText,
                gradeFilter === g && styles.filterChipTextActive,
              ]}
            >
              {g === "all" ? "Все" : `Оценка ${g}`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.count}>
        {filtered.length} {filtered.length === 1 ? "запись" : filtered.length < 5 ? "записи" : "записей"}
      </Text>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 && (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="barcode-off" size={52} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>
              {history.length === 0 ? "Нет сканирований" : "Ничего не найдено"}
            </Text>
            <Text style={styles.emptyText}>
              {history.length === 0
                ? "Используйте сканер для анализа\nкачества DataMatrix кодов"
                : "Попробуйте изменить фильтры\nили поисковый запрос"}
            </Text>
            {history.length === 0 && (
              <TouchableOpacity
                style={styles.emptyScanBtn}
                onPress={() => router.push("/scanner")}
              >
                <MaterialCommunityIcons name="barcode-scan" size={18} color={Colors.background} />
                <Text style={styles.emptyScanBtnText}>Сканировать</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {filtered.map((scan) => (
          <ScanCard
            key={scan.id}
            scan={scan}
            onPress={() => router.push({ pathname: "/result", params: { id: scan.id } })}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
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
  title: {
    fontSize: 17,
    color: Colors.textPrimary,
    fontFamily: "Inter_600SemiBold",
  },
  clearBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.errorGlow,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: `${Colors.error}33`,
  },
  searchRow: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  filterRow: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryGlow,
    borderColor: `${Colors.primary}55`,
  },
  filterChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  filterChipTextActive: {
    color: Colors.primary,
  },
  count: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 60,
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
  emptyScanBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyScanBtnText: {
    fontSize: 15,
    color: Colors.background,
    fontFamily: "Inter_600SemiBold",
  },
});
