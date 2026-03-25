import React from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

interface InfoSectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  accentColor?: string;
}

function InfoSection({ icon, title, children, accentColor = Colors.primary }: InfoSectionProps) {
  return (
    <View style={[styles.section, { borderLeftColor: accentColor }]}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: `${accentColor}22` }]}>
          {icon}
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoRowDot} />
      <Text style={styles.infoRowLabel}>{label}</Text>
      <Text style={styles.infoRowValue}>{value}</Text>
    </View>
  );
}

function BodyText({ children }: { children: string }) {
  return <Text style={styles.bodyText}>{children}</Text>;
}

function BulletItem({ children }: { children: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bullet} />
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

function MetricItem({ code, name, desc }: { code: string; name: string; desc: string }) {
  return (
    <View style={styles.metricItem}>
      <View style={styles.metricCode}>
        <Text style={styles.metricCodeText}>{code}</Text>
      </View>
      <View style={styles.metricInfo}>
        <Text style={styles.metricName}>{name}</Text>
        <Text style={styles.metricDesc}>{desc}</Text>
      </View>
    </View>
  );
}

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container]}>
      <LinearGradient
        colors={[`${Colors.primary}18`, Colors.background]}
        style={[styles.headerGradient, { height: topPad + 140 }]}
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
          <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>О приложении</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.heroCard}>
          <MaterialCommunityIcons name="barcode-scan" size={40} color={Colors.primary} />
          <Text style={styles.heroTitle}>DataMatrix Scanner</Text>
          <Text style={styles.heroSub}>Анализатор качества печати</Text>
          <View style={styles.heroDivider} />
          <Text style={styles.heroAuthor}>А. Свидович · PROGRESS</Text>
          <Text style={styles.heroVersion}>Версия 1.0 · 2024</Text>
        </View>

        {/* WHAT THE APP DOES */}
        <InfoSection
          icon={<MaterialCommunityIcons name="information-outline" size={18} color={Colors.primary} />}
          title="Что делает приложение"
          accentColor={Colors.primary}
        >
          <BodyText>
            Приложение предназначено для оценки качества печати двумерных штрихкодов формата DataMatrix непосредственно на производстве или в логистических цепочках.
          </BodyText>
          <BodyText>
            Камера устройства захватывает изображение символа, система автоматически обнаруживает область DataMatrix, вычисляет комплекс метрологических показателей и формирует итоговую оценку качества по шкале A–F.
          </BodyText>
          <BulletItem>Автоматический захват области DataMatrix без ручного кадрирования</BulletItem>
          <BulletItem>Мгновенный анализ 8 параметров качества согласно стандарту</BulletItem>
          <BulletItem>Итоговая оценка по международной шкале (4.0 — отлично, 0 — неприемлемо)</BulletItem>
          <BulletItem>Хранение истории сканирований с фильтрацией и поиском</BulletItem>
          <BulletItem>Экспорт результатов и диагностических данных</BulletItem>
        </InfoSection>

        {/* STANDARD */}
        <InfoSection
          icon={<MaterialCommunityIcons name="certificate-outline" size={18} color={Colors.accent} />}
          title="Применяемый стандарт"
          accentColor={Colors.accent}
        >
          <BodyText>
            Анализ проводится в соответствии с ГОСТ Р 57302-2016, который является национальным стандартом Российской Федерации, гармонизированным с международным стандартом ISO/IEC 15415.
          </BodyText>
          <View style={styles.standardCards}>
            <View style={styles.standardCard}>
              <MaterialCommunityIcons name="flag" size={16} color={Colors.accent} />
              <Text style={styles.standardCardTitle}>ГОСТ Р 57302-2016</Text>
              <Text style={styles.standardCardDesc}>Национальный стандарт РФ. Штриховое кодирование. Спецификация тестирования качества печати для двумерных символик.</Text>
            </View>
            <View style={styles.standardCard}>
              <MaterialCommunityIcons name="earth" size={16} color={Colors.primary} />
              <Text style={styles.standardCardTitle}>ISO/IEC 15415</Text>
              <Text style={styles.standardCardDesc}>Международный стандарт. Barcode print quality test specification — Two-dimensional symbols.</Text>
            </View>
          </View>
          <InfoRow label="Тип символики" value="DataMatrix (ISO/IEC 16022)" />
          <InfoRow label="Метод" value="Сканирование отражённым светом" />
          <InfoRow label="Шкала оценки" value="0.0 – 4.0 (A / B / C / D / F)" />
        </InfoSection>

        {/* METHODS */}
        <InfoSection
          icon={<MaterialCommunityIcons name="cog-outline" size={18} color={Colors.warning} />}
          title="Методы анализа"
          accentColor={Colors.warning}
        >
          <BodyText>
            Алгоритм анализа реализует полный комплекс измерений, предусмотренных стандартом, для двумерных символик ECC 200.
          </BodyText>
          <BulletItem>
            Обнаружение символа — поиск паттерна нахождения (finder pattern) и тихой зоны (quiet zone) DataMatrix
          </BulletItem>
          <BulletItem>
            Геометрическая коррекция — компенсация перспективных искажений и наклона при съёмке под углом
          </BulletItem>
          <BulletItem>
            Отражательная фотометрия — измерение яркости светлых (Rmax) и тёмных (Rmin) модулей через гистограмму распределения
          </BulletItem>
          <BulletItem>
            Анализ модуляции — оценка равномерности перехода между светлыми и тёмными элементами
          </BulletItem>
          <BulletItem>
            Оценка коррекции ошибок — декодирование символа и расчёт израсходованного ресурса Reed-Solomon
          </BulletItem>
          <BulletItem>
            Осевая неравномерность — измерение отклонений шага модульной сетки по осям X и Y
          </BulletItem>
          <BulletItem>
            Анализ повреждений стационарного шаблона — контроль целостности L-образной рамки и чередующегося паттерна
          </BulletItem>
        </InfoSection>

        {/* METRICS */}
        <InfoSection
          icon={<MaterialCommunityIcons name="chart-bar" size={18} color={Colors.primary} />}
          title="Отображаемые параметры"
          accentColor={Colors.primary}
        >
          <BodyText>
            Для каждого отсканированного символа отображаются 8 метрологических параметров с индивидуальной оценкой и итоговый показатель качества. Итоговая оценка определяется по наихудшему параметру (правило «слабого звена»).
          </BodyText>

          <MetricItem
            code="Decode"
            name="Декодируемость"
            desc="Успешность декодирования символа. Оценка A — декодируется без ошибок, F — недекодируем."
          />
          <MetricItem
            code="SC"
            name="Символьный контраст"
            desc="Разница между максимальным (Rmax) и минимальным (Rmin) отражением. SC = Rmax − Rmin. Норма: ≥ 70%."
          />
          <MetricItem
            code="MOD"
            name="Модуляция"
            desc="Равномерность яркости внутри каждого модуля. Оценивает стабильность тёмных и светлых областей."
          />
          <MetricItem
            code="MRD"
            name="Мин. разница отражений"
            desc="Минимальный порог различения тёмного и светлого модуля. Влияет на надёжность распознавания."
          />
          <MetricItem
            code="AN"
            name="Осевая неравномерность"
            desc="Отклонение шага модульной сетки по осям X и Y от номинала. AN ≤ 6% — оценка A."
          />
          <MetricItem
            code="UEC"
            name="Неиспользованная коррекция ошибок"
            desc="Остаток ресурса Reed-Solomon после декодирования. Показывает запас прочности символа."
          />
          <MetricItem
            code="GN"
            name="Неравномерность сетки"
            desc="Геометрические искажения модульной сетки относительно идеальной. GN ≤ 8% — оценка A."
          />
          <MetricItem
            code="FPD"
            name="Повреждение стационарного шаблона"
            desc="Целостность L-образной рамки (finder pattern) и чередующегося паттерна DataMatrix."
          />
        </InfoSection>

        {/* GRADE SCALE */}
        <InfoSection
          icon={<MaterialCommunityIcons name="star-outline" size={18} color={Colors.accent} />}
          title="Шкала оценок"
          accentColor={Colors.accent}
        >
          <BodyText>
            Каждый параметр и итоговый символ получают оценку по 5-ступенчатой шкале ГОСТ Р 57302-2016:
          </BodyText>
          {[
            { grade: "A", score: "3.5–4.0", label: "Отлично", desc: "Полное соответствие стандарту. К использованию." },
            { grade: "B", score: "2.5–3.4", label: "Хорошо", desc: "Незначительные отклонения. Пригоден к использованию." },
            { grade: "C", score: "1.5–2.4", label: "Удовл.", desc: "На границе нормы. Рекомендуется проверка оборудования." },
            { grade: "D", score: "0.5–1.4", label: "Плохо", desc: "Существенные дефекты. Требуется регулировка." },
            { grade: "F", score: "0–0.4", label: "Неприемл.", desc: "Не соответствует стандарту. Производство остановить." },
          ].map((item) => (
            <View key={item.grade} style={styles.gradeRow}>
              <View style={[styles.gradeBadge, { backgroundColor: gradeColor(item.grade) + "22", borderColor: gradeColor(item.grade) + "55" }]}>
                <Text style={[styles.gradeLetter, { color: gradeColor(item.grade), fontFamily: "Inter_700Bold" }]}>{item.grade}</Text>
              </View>
              <View style={styles.gradeInfo}>
                <View style={styles.gradeTopRow}>
                  <Text style={styles.gradeLabel}>{item.label}</Text>
                  <Text style={styles.gradeScore}>{item.score}</Text>
                </View>
                <Text style={styles.gradeDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </InfoSection>

        {/* AUTHOR */}
        <View style={styles.authorCard}>
          <LinearGradient
            colors={[`${Colors.primary}15`, `${Colors.primary}05`]}
            style={StyleSheet.absoluteFill}
            borderRadius={16}
          />
          <MaterialCommunityIcons name="account-circle-outline" size={36} color={Colors.primary} />
          <Text style={styles.authorName}>А. Свидович</Text>
          <Text style={styles.authorOrg}>PROGRESS</Text>
          <View style={styles.authorDivider} />
          <Text style={styles.authorNote}>
            Приложение разработано специально для PROGRESS.{"\n"}
            Все права защищены © 2024.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function gradeColor(grade: string): string {
  switch (grade) {
    case "A": return "#00FF94";
    case "B": return "#7AFF00";
    case "C": return "#FFB800";
    case "D": return "#FF7700";
    case "F": return "#FF4757";
    default: return "#FFFFFF";
  }
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
  topTitle: {
    fontSize: 17,
    color: Colors.textPrimary,
    fontFamily: "Inter_600SemiBold",
  },
  heroCard: {
    alignItems: "center",
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 20,
    gap: 4,
  },
  heroTitle: {
    fontSize: 22,
    color: Colors.textPrimary,
    fontFamily: "Inter_700Bold",
    marginTop: 8,
  },
  heroSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
  },
  heroDivider: {
    width: 40,
    height: 1,
    backgroundColor: Colors.surfaceBorder,
    marginVertical: 10,
  },
  heroAuthor: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: "Inter_600SemiBold",
  },
  heroVersion: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
  },
  section: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderLeftWidth: 4,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  sectionBody: {
    gap: 8,
  },
  bodyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingLeft: 2,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 7,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  standardCards: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 8,
  },
  standardCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 6,
  },
  standardCardTitle: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontFamily: "Inter_600SemiBold",
  },
  standardCardDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    lineHeight: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  infoRowDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textMuted,
  },
  infoRowLabel: {
    flex: 1,
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
  },
  infoRowValue: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  metricCode: {
    backgroundColor: Colors.primaryGlow,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: `${Colors.primary}33`,
    minWidth: 42,
    alignItems: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  metricCodeText: {
    fontSize: 10,
    color: Colors.primary,
    fontFamily: "Inter_700Bold",
  },
  metricInfo: {
    flex: 1,
  },
  metricName: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  metricDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    lineHeight: 16,
  },
  gradeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  gradeBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  gradeLetter: {
    fontSize: 18,
  },
  gradeInfo: {
    flex: 1,
  },
  gradeTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  gradeLabel: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontFamily: "Inter_600SemiBold",
  },
  gradeScore: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
  },
  gradeDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    lineHeight: 16,
  },
  authorCard: {
    alignItems: "center",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    overflow: "hidden",
    gap: 4,
    marginBottom: 8,
  },
  authorName: {
    fontSize: 17,
    color: Colors.textPrimary,
    fontFamily: "Inter_700Bold",
    marginTop: 8,
  },
  authorOrg: {
    fontSize: 13,
    color: Colors.primary,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
  },
  authorDivider: {
    width: 40,
    height: 1,
    backgroundColor: Colors.surfaceBorder,
    marginVertical: 10,
  },
  authorNote: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 18,
  },
});
