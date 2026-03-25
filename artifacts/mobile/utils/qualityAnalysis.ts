import { QualityGrade, QualityMetric, ScanResult } from "@/context/ScanHistoryContext";

function scoreToGrade(score: number): QualityGrade {
  if (score >= 3.5) return "A";
  if (score >= 2.5) return "B";
  if (score >= 1.5) return "C";
  if (score >= 0.5) return "D";
  return "F";
}

function gradeToScore(grade: QualityGrade): number {
  switch (grade) {
    case "A": return 4;
    case "B": return 3;
    case "C": return 2;
    case "D": return 1;
    case "F": return 0;
  }
}

function randomGaussian(mean: number, std: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function analyzeDataMatrix(imageVariance?: number): ScanResult {
  const quality = imageVariance ?? 0.75 + Math.random() * 0.25;
  
  const baseScore = clamp(randomGaussian(quality * 4, 0.4), 0, 4);

  const metricDefs = [
    {
      key: "decode",
      name: "Decode (Decode)",
      nameRu: "Декодируемость",
      descriptionFn: (g: QualityGrade) => {
        if (g === "A") return "Символ надёжно декодируется";
        if (g === "B") return "Декодирование успешно с незначительными ошибками";
        if (g === "C") return "Декодирование возможно при повторных попытках";
        return "Декодирование затруднено — критические ошибки";
      },
    },
    {
      key: "symbolContrast",
      name: "SC (Symbol Contrast)",
      nameRu: "Символьный контраст",
      descriptionFn: (g: QualityGrade) => {
        if (g === "A") return "Высокий контраст ≥ 70%";
        if (g === "B") return "Контраст 55–70%";
        if (g === "C") return "Контраст 40–55%, на границе нормы";
        return "Контраст < 40% — ниже допустимого";
      },
    },
    {
      key: "modulation",
      name: "MOD (Modulation)",
      nameRu: "Модуляция",
      descriptionFn: (g: QualityGrade) => {
        if (g === "A") return "Равномерная модуляция модулей ≥ 0.8";
        if (g === "B") return "Модуляция 0.6–0.8, допустимо";
        if (g === "C") return "Модуляция 0.4–0.6, неравномерность";
        return "Модуляция < 0.4 — критический дефект";
      },
    },
    {
      key: "reflectance",
      name: "MRD (Min Reflectance Diff)",
      nameRu: "Минимальная разница отражений",
      descriptionFn: (g: QualityGrade) => {
        if (g === "A") return "Разница отражений в норме, ≥ 15%";
        if (g === "B") return "Разница отражений 10–15%";
        if (g === "C") return "Разница отражений 5–10%, требует контроля";
        return "Разница отражений < 5% — недопустимо";
      },
    },
    {
      key: "axialNonuniformity",
      name: "AN (Axial Non-uniformity)",
      nameRu: "Осевая неравномерность",
      descriptionFn: (g: QualityGrade) => {
        if (g === "A") return "Осевая неравномерность ≤ 6%";
        if (g === "B") return "Осевая неравномерность 6–10%";
        if (g === "C") return "Осевая неравномерность 10–20%";
        return "Осевая неравномерность > 20%";
      },
    },
    {
      key: "unusedErrorCorrection",
      name: "UEC (Unused Error Correction)",
      nameRu: "Неиспользованная коррекция ошибок",
      descriptionFn: (g: QualityGrade) => {
        if (g === "A") return "Коррекция ошибок > 62%";
        if (g === "B") return "Коррекция ошибок 50–62%";
        if (g === "C") return "Коррекция ошибок 37–50%";
        return "Коррекция ошибок < 37% — критично";
      },
    },
    {
      key: "gridNonuniformity",
      name: "GN (Grid Non-uniformity)",
      nameRu: "Неравномерность сетки",
      descriptionFn: (g: QualityGrade) => {
        if (g === "A") return "Искажение сетки ≤ 8%";
        if (g === "B") return "Искажение сетки 8–12%";
        if (g === "C") return "Искажение сетки 12–20%";
        return "Искажение сетки > 20%";
      },
    },
    {
      key: "fixedPatternDamage",
      name: "FPD (Fixed Pattern Damage)",
      nameRu: "Повреждение стационарного шаблона",
      descriptionFn: (g: QualityGrade) => {
        if (g === "A") return "Стационарный шаблон не повреждён";
        if (g === "B") return "Незначительные повреждения шаблона";
        if (g === "C") return "Умеренные повреждения шаблона";
        return "Критические повреждения шаблона";
      },
    },
  ];

  const metrics: QualityMetric[] = metricDefs.map((def) => {
    const raw = clamp(randomGaussian(baseScore, 0.5), 0, 4);
    const rounded = Math.round(raw * 2) / 2;
    const grade = scoreToGrade(rounded);
    return {
      name: def.name,
      nameRu: def.nameRu,
      value: rounded,
      grade,
      description: def.descriptionFn(grade),
    };
  });

  const minScore = Math.min(...metrics.map((m) => m.value));
  const overallGrade = scoreToGrade(minScore);

  const matrixSizes = ["10×10", "12×12", "14×14", "16×16", "18×18", "20×20", "22×22", "24×24", "26×26", "32×32"];
  const moduleSize = Math.round((2 + Math.random() * 4) * 10) / 10;

  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
    overallGrade,
    overallScore: minScore,
    data: generateSampleData(),
    size: `${Math.round(10 + Math.random() * 20)}×${Math.round(10 + Math.random() * 20)} мм`,
    moduleSize,
    matrixSize: matrixSizes[Math.floor(Math.random() * matrixSizes.length)],
    metrics,
  };
}

function generateSampleData(): string {
  const samples = [
    "010460043993001021FvRKM\u001d9310AD11\u001d3103000500",
    "010460043993001021AbCdEf\u001d9312PQ22\u001d3103000250",
    "01046004399300102109876543\u001d9311XY33\u001d3103001000",
    "4606203445506",
    "MDM-2024-BATCH-001-UNIT-0042",
    "SN:RU2024110142857",
  ];
  return samples[Math.floor(Math.random() * samples.length)];
}

export function createFailedScan(): ScanResult {
  const failMetric = (name: string, nameRu: string): QualityMetric => ({
    name,
    nameRu,
    value: 0,
    grade: "F",
    description: "DataMatrix не обнаружен в кадре",
  });

  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
    overallGrade: "F",
    overallScore: 0,
    data: "",
    size: "—",
    moduleSize: 0,
    matrixSize: "—",
    metrics: [
      failMetric("Decode (Decode)", "Декодируемость"),
      failMetric("SC (Symbol Contrast)", "Символьный контраст"),
      failMetric("MOD (Modulation)", "Модуляция"),
      failMetric("MRD (Min Reflectance Diff)", "Минимальная разница отражений"),
      failMetric("AN (Axial Non-uniformity)", "Осевая неравномерность"),
      failMetric("UEC (Unused Error Correction)", "Неиспользованная коррекция ошибок"),
      failMetric("GN (Grid Non-uniformity)", "Неравномерность сетки"),
      failMetric("FPD (Fixed Pattern Damage)", "Повреждение стационарного шаблона"),
    ],
  };
}

export function gradeColor(grade: QualityGrade): string {
  switch (grade) {
    case "A": return "#00FF94";
    case "B": return "#7AFF00";
    case "C": return "#FFB800";
    case "D": return "#FF7700";
    case "F": return "#FF4757";
  }
}

export function gradeLabel(grade: QualityGrade): string {
  switch (grade) {
    case "A": return "Отлично";
    case "B": return "Хорошо";
    case "C": return "Удовлетворительно";
    case "D": return "Плохо";
    case "F": return "Неприемлемо";
  }
}

export function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
