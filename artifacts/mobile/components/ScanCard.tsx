import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScanResult } from "@/context/ScanHistoryContext";
import { formatTimestamp, gradeColor, gradeLabel } from "@/utils/qualityAnalysis";
import { Colors } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";

interface ScanCardProps {
  scan: ScanResult;
  onPress: () => void;
}

export function ScanCard({ scan, onPress }: ScanCardProps) {
  const color = gradeColor(scan.overallGrade);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.gradeBand, { backgroundColor: color }]} />
      <View style={styles.content}>
        <View style={styles.row}>
          <View>
            <Text style={[styles.grade, { color, fontFamily: "Inter_700Bold" }]}>
              {scan.overallGrade}
            </Text>
            <Text style={[styles.gradeLabel, { color }]}>{gradeLabel(scan.overallGrade)}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.timestamp}>{formatTimestamp(scan.timestamp)}</Text>
            <Text style={styles.matrixSize}>{scan.matrixSize} · {scan.size}</Text>
            <Text style={styles.data} numberOfLines={1}>{scan.data}</Text>
          </View>
          <Feather name="chevron-right" size={18} color={Colors.textMuted} />
        </View>
        <View style={styles.scoreRow}>
          {scan.metrics.slice(0, 4).map((m) => (
            <View key={m.key} style={styles.miniMetric}>
              <View
                style={[
                  styles.miniDot,
                  { backgroundColor: gradeColor(m.grade) },
                ]}
              />
              <Text style={styles.miniLabel}>{m.name.split(" ")[0]}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    overflow: "hidden",
  },
  gradeBand: {
    width: 5,
  },
  content: {
    flex: 1,
    padding: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  grade: {
    fontSize: 30,
    lineHeight: 32,
  },
  gradeLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
  info: {
    flex: 1,
  },
  timestamp: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
  },
  matrixSize: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
  },
  data: {
    fontSize: 10,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  scoreRow: {
    flexDirection: "row",
    gap: 8,
  },
  miniMetric: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  miniDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  miniLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
  },
});
