import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { QualityMetric } from "@/context/ScanHistoryContext";
import { gradeColor } from "@/utils/qualityAnalysis";
import { Colors } from "@/constants/colors";

interface MetricRowProps {
  metric: QualityMetric;
}

export function MetricRow({ metric }: MetricRowProps) {
  const color = gradeColor(metric.grade);
  const barWidth = `${(metric.value / 4) * 100}%` as `${number}%`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.nameGroup}>
          <Text style={styles.name}>{metric.name}</Text>
          <Text style={styles.nameRu}>{metric.nameRu}</Text>
        </View>
        <View style={[styles.gradeBadge, { backgroundColor: `${color}22`, borderColor: `${color}55` }]}>
          <Text style={[styles.gradeText, { color, fontFamily: "Inter_700Bold" }]}>{metric.grade}</Text>
        </View>
      </View>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: barWidth, backgroundColor: color }]} />
      </View>
      <Text style={styles.description}>{metric.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  nameGroup: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontFamily: "Inter_600SemiBold",
  },
  nameRu: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  gradeBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  gradeText: {
    fontSize: 14,
  },
  barBg: {
    height: 4,
    backgroundColor: Colors.surfaceBorder,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 8,
  },
  barFill: {
    height: "100%",
    borderRadius: 2,
  },
  description: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    lineHeight: 15,
  },
});
