# DataMatrix Scanner

**Нативное Android-приложение для анализа качества печати DataMatrix-кодов**  
Соответствие стандартам ГОСТ Р 57302-2016 / ISO/IEC 15415

---

## О приложении

DataMatrix Scanner — профессиональный инструмент для оценки качества печати двумерных штрихкодов формата DataMatrix непосредственно на производстве или в логистических цепочках.

Камера устройства захватывает изображение символа, система автоматически обнаруживает область DataMatrix через ML Kit, вычисляет комплекс метрологических показателей и формирует итоговую оценку качества по шкале A–F согласно международному стандарту ISO/IEC 15415 и ГОСТ Р 57302-2016.

---

## Технический стек

| Компонент | Технология |
|---|---|
| Язык | **Kotlin** |
| UI Framework | Jetpack Compose (Material 3) |
| Навигация | Navigation Compose |
| Камера | CameraX (camera-camera2 + camera-lifecycle) |
| Сканирование | ML Kit Barcode Scanning (DataMatrix, QR) |
| Хранение данных | SharedPreferences + Gson |
| Разрешения | Accompanist Permissions |
| Анимации | Compose Animations + AnimatedContent |
| Сборка | Gradle (Kotlin DSL) |
| Min SDK | 26 (Android 8.0) |
| Target SDK | 35 (Android 15) |

---

## Возможности

- **ML Kit автозахват** — ML Kit обнаруживает DataMatrix в реальном времени, автоматически запускает обратный отсчёт 3–2–1 и делает захват
- **Фонарик** — управление вспышкой прямо из экрана сканирования
- **8 параметров качества** — полный набор метрик согласно стандарту
- **Шкала A–F** — международная четырёхбалльная система оценки
- **Провал при отсутствии кода** — если DataMatrix не найден, фиксируется результат F по всем параметрам
- **История сканирований** — хранение, поиск и фильтрация по оценке
- **Удаление записей** — по одной или полная очистка истории
- **Экспорт / поделиться** — протокол измерения отправляется через системный Intent
- **Офлайн** — полная работоспособность без интернета

---

## Экраны

| Экран | Описание |
|---|---|
| **Главный** | Счётчики, последние сканирования, кнопка запуска, кнопки Info и History |
| **Сканер** | CameraX preview, рамка визира, автозахват по ML Kit, ручной захват |
| **Результат** | Анимированное кольцо оценки, инфокарта с размерами, 8 MetricRow |
| **История** | Поиск + Filter chips по оценке, swipe-удаление, полная очистка |
| **О приложении** | Документация: стандарты, методы, параметры, шкала, авторство |

---

## Параметры качества (8 метрик)

| Метрика | Полное название | Описание |
|---|---|---|
| **Decode** | Decode | Декодируемость — надёжность декодирования символа |
| **SC** | Symbol Contrast | Символьный контраст между тёмными и светлыми модулями |
| **MOD** | Modulation | Модуляция — равномерность отражательной способности модулей |
| **MRD** | Min Reflectance Difference | Минимальная разница отражений |
| **AN** | Axial Non-uniformity | Осевая неравномерность шага модулей |
| **UEC** | Unused Error Correction | Неиспользованный запас коррекции ошибок Reed-Solomon |
| **GN** | Grid Non-uniformity | Неравномерность позиционирования центров модулей |
| **FPD** | Fixed Pattern Damage | Повреждение L-образного стационарного шаблона |

---

## Шкала оценок

| Оценка | Баллы | Значение |
|---|---|---|
| **A** | 3.5 – 4.0 | Отлично — соответствует всем требованиям стандарта |
| **B** | 2.5 – 3.4 | Хорошо — незначительные отклонения, код читается надёжно |
| **C** | 1.5 – 2.4 | Удовлетворительно — требует контроля |
| **D** | 0.5 – 1.4 | Плохо — серьёзные нарушения, считывание нестабильно |
| **F** | 0 – 0.4 | Неприемлемо — не соответствует стандарту |

Итоговая оценка = **минимум** среди всех 8 параметров.

---

## Применяемые стандарты

- **ГОСТ Р 57302-2016** — Автоматическая идентификация. Кодирование штриховое. Спецификация символики DataMatrix
- **ISO/IEC 15415:2011** — Bar code print quality test specification: Two-dimensional symbols

---

## Сборка и установка

### Требования

- Android Studio Ladybug (2024.2) или новее
- JDK 17+
- Android SDK 35
- Устройство или эмулятор с API 26+

### Открыть в Android Studio

```bash
git clone <repo>
cd artifacts/mobile
# Открыть папку artifacts/mobile как проект в Android Studio
```

### Сборка из командной строки

```bash
cd artifacts/mobile
./gradlew assembleDebug
# APK: app/build/outputs/apk/debug/app-debug.apk
```

### Release-сборка

```bash
./gradlew assembleRelease
```

---

## Структура проекта

```
artifacts/mobile/
├── app/
│   ├── build.gradle.kts
│   └── src/main/
│       ├── AndroidManifest.xml
│       └── java/com/progress/datamatrix/
│           ├── MainActivity.kt
│           ├── navigation/
│           │   └── NavGraph.kt
│           ├── data/
│           │   ├── ScanResult.kt        ← модели данных + QualityGrade enum
│           │   └── ScanRepository.kt   ← SharedPreferences + Gson + StateFlow
│           ├── analysis/
│           │   └── QualityAnalysis.kt  ← движок анализа 8 метрик
│           └── ui/
│               ├── theme/
│               │   ├── Color.kt        ← тёмная палитра navy/cyan
│               │   ├── Theme.kt        ← MaterialTheme dark scheme
│               │   └── Type.kt         ← типографика
│               ├── components/
│               │   ├── GradeRing.kt    ← анимированное кольцо оценки
│               │   └── MetricRow.kt    ← строка параметра с progress bar
│               └── screens/
│                   ├── HomeScreen.kt
│                   ├── ScannerScreen.kt
│                   ├── ResultScreen.kt
│                   ├── HistoryScreen.kt
│                   └── AboutScreen.kt
├── build.gradle.kts
├── settings.gradle.kts
├── gradle.properties
└── gradle/
    ├── libs.versions.toml
    └── wrapper/
        └── gradle-wrapper.properties
```

---

## Авторы

**А. Свидович / А. Петляков**  
PROGRESS  
Версия 1.0 · 2026
# Matrix-Scanner-Quality
# Data-Matrix-Scanner
