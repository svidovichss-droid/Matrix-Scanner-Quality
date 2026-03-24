import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { QualityGrade } from "@/context/ScanHistoryContext";
import { gradeColor, gradeLabel } from "@/utils/qualityAnalysis";
import { Colors } from "@/constants/colors";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface GradeRingProps {
  grade: QualityGrade;
  score: number;
  size?: number;
}

export function GradeRing({ grade, score, size = 160 }: GradeRingProps) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0);
  const fillAmount = score / 4;

  useEffect(() => {
    progress.value = withDelay(
      300,
      withTiming(fillAmount, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [fillAmount, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const color = gradeColor(grade);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.surfaceBorder}
          strokeWidth={8}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={8}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </Svg>
      <View style={styles.inner}>
        <Text style={[styles.grade, { color, fontFamily: "Inter_700Bold" }]}>{grade}</Text>
        <Text style={[styles.label, { color }]}>{gradeLabel(grade)}</Text>
        <Text style={[styles.score, { fontFamily: "Inter_400Regular" }]}>
          {score.toFixed(1)}/4.0
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  svg: {
    position: "absolute",
  },
  inner: {
    alignItems: "center",
    justifyContent: "center",
  },
  grade: {
    fontSize: 48,
    lineHeight: 52,
  },
  label: {
    fontSize: 11,
    marginTop: 2,
    textAlign: "center",
  },
  score: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
