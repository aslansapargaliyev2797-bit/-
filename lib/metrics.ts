import type { Bucket, BooleanRate, Stats } from "./stats-types";

export interface MetricResult {
  value: number | null;
  isPercent: boolean;
  num?: number;
  den?: number;
}

export interface MetricDef {
  id: string;
  label: string;
  group: string;
  isPercent: boolean;
  get: (s: Stats) => MetricResult;
}

function bucketPct(buckets: Bucket[], substrings: string[]): MetricResult {
  const lower = substrings.map((s) => s.toLowerCase());
  const matched = buckets.filter((b) =>
    lower.some((s) => b.label.toLowerCase().includes(s))
  );
  const num = matched.reduce((a, b) => a + b.count, 0);
  const pct = matched.reduce((a, b) => a + b.pct, 0);
  const den = buckets.reduce((a, b) => a + b.count, 0);
  return { value: den > 0 ? pct : null, isPercent: true, num, den };
}

function fromRate(rate: BooleanRate): MetricResult {
  return {
    value: rate.total > 0 ? rate.yesPct : null,
    isPercent: true,
    num: rate.yes,
    den: rate.total,
  };
}

function inverseRate(rate: BooleanRate): MetricResult {
  return {
    value: rate.total > 0 ? (rate.no / rate.total) * 100 : null,
    isPercent: true,
    num: rate.no,
    den: rate.total,
  };
}

function avgMetric(value: number | null): MetricResult {
  return { value, isPercent: false };
}

/** Every comparable number the site can compute per group, grouped for the metric picker. */
export const METRICS: MetricDef[] = [
  // Риск
  { id: "highRiskPct", label: "Высокий риск (%)", group: "Риск", isPercent: true, get: (s) => bucketPct(s.riskLevel, ["Высокий риск"]) },
  { id: "moderateRiskPct", label: "Умеренный риск (%)", group: "Риск", isPercent: true, get: (s) => bucketPct(s.riskLevel, ["Умеренный риск"]) },
  { id: "lowRiskPct", label: "Низкий риск (%)", group: "Риск", isPercent: true, get: (s) => bucketPct(s.riskLevel, ["Низкий риск"]) },
  { id: "avgScore", label: "Средний балл риска", group: "Риск", isPercent: false, get: (s) => avgMetric(s.avgScore) },
  { id: "noRiskFactorsPct", label: "Без факторов риска (%)", group: "Риск", isPercent: true, get: (s) => ({ value: s.count > 0 ? s.noRiskFactorsPct : null, isPercent: true }) },

  // ИМТ
  { id: "obesityPct", label: "Ожирение (%)", group: "ИМТ", isPercent: true, get: (s) => bucketPct(s.bmiCategory, ["Ожирение"]) },
  { id: "overweightPct", label: "Избыточный вес (%)", group: "ИМТ", isPercent: true, get: (s) => bucketPct(s.bmiCategory, ["Избыточный вес"]) },
  { id: "avgBmi", label: "Средний ИМТ", group: "ИМТ", isPercent: false, get: (s) => avgMetric(s.avgBmi) },

  // Курение
  { id: "smokingNowPct", label: "Курит сейчас (%)", group: "Курение", isPercent: true, get: (s) => bucketPct(s.smoking, ["Курю в настоящее время"]) },
  { id: "smokingPastPct", label: "Курил(а), бросил(а) (%)", group: "Курение", isPercent: true, get: (s) => bucketPct(s.smoking, ["Курил"]) },

  // Питание
  { id: "dailyFastfoodPct", label: "Ежедневно фастфуд / переработанное (%)", group: "Питание", isPercent: true, get: (s) => bucketPct(s.processedFood, ["Ежедневно"]) },
  { id: "addsSaltPct", label: "Досаливает пищу (%)", group: "Питание", isPercent: true, get: (s) => fromRate(s.addsSalt) },

  // Активность
  { id: "sedentaryOver6Pct", label: "Сидит более 6 ч/день (%)", group: "Активность", isPercent: true, get: (s) => bucketPct(s.sedentary, ["Более 6 часов"]) },
  { id: "noActivityPct", label: "Нет регулярной активности (%)", group: "Активность", isPercent: true, get: (s) => inverseRate(s.physicalActivity) },

  // Осведомлённость
  { id: "unknownCholesterolPct", label: "Не знает холестерин (%)", group: "Осведомлённость", isPercent: true, get: (s) => bucketPct(s.cholesterolAwareness, ["Не знаю"]) },
  { id: "unknownSugarPct", label: "Не знает сахар (%)", group: "Осведомлённость", isPercent: true, get: (s) => bucketPct(s.sugarAwareness, ["Не знаю"]) },
  { id: "highBPPct", label: "Давление часто повышено (%)", group: "Осведомлённость", isPercent: true, get: (s) => bucketPct(s.bpAwareness, ["часто бывает повышенным"]) },

  // Кризы и препараты
  { id: "frequentCrisesPct", label: "Регулярные кризы давления (%)", group: "Кризы и препараты", isPercent: true, get: (s) => bucketPct(s.bpCrises, ["Регулярно"]) },
  { id: "dailyMedsPct", label: "Ежедневный приём препаратов (%)", group: "Кризы и препараты", isPercent: true, get: (s) => bucketPct(s.bpMeds, ["ежедневно"]) },

  // Анамнез
  { id: "diagnosisPct", label: "Есть диагноз ССЗ (%)", group: "Анамнез", isPercent: true, get: (s) => fromRate(s.diagnosis) },
  { id: "familyHistoryPct", label: "Наследственность (%)", group: "Анамнез", isPercent: true, get: (s) => fromRate(s.familyHistory) },

  // Симптомы
  { id: "chestDiscomfortPct", label: "Дискомфорт в груди (%)", group: "Симптомы", isPercent: true, get: (s) => fromRate(s.symptoms[0]?.rate ?? { yes: 0, no: 0, total: 0, yesPct: 0 }) },
  { id: "palpitationsPct", label: "Перебои сердцебиения (%)", group: "Симптомы", isPercent: true, get: (s) => fromRate(s.symptoms[1]?.rate ?? { yes: 0, no: 0, total: 0, yesPct: 0 }) },
  { id: "daytimeSleepinessPct", label: "Дневная сонливость (%)", group: "Симптомы", isPercent: true, get: (s) => fromRate(s.symptoms[2]?.rate ?? { yes: 0, no: 0, total: 0, yesPct: 0 }) },
  { id: "stressFrequentPct", label: "Частые стрессы (%)", group: "Симптомы", isPercent: true, get: (s) => fromRate(s.symptoms[3]?.rate ?? { yes: 0, no: 0, total: 0, yesPct: 0 }) },

  // Прочее
  { id: "avgSleepQuality", label: "Среднее качество сна (1–5)", group: "Прочее", isPercent: false, get: (s) => avgMetric(s.avgSleepQuality) },
  { id: "avgAge", label: "Средний возраст", group: "Прочее", isPercent: false, get: (s) => avgMetric(s.avgAge) },
  { id: "avgTenure", label: "Средний стаж", group: "Прочее", isPercent: false, get: (s) => avgMetric(s.avgTenure) },
];

export const METRIC_GROUPS = Array.from(new Set(METRICS.map((m) => m.group)));

export function getMetric(id: string): MetricDef {
  const m = METRICS.find((x) => x.id === id);
  if (!m) throw new Error(`Unknown metric: ${id}`);
  return m;
}

export function formatMetricResult(m: MetricResult): string {
  if (m.value === null) return "—";
  return m.isPercent ? `${m.value.toFixed(1)}%` : m.value.toFixed(1);
}

export function formatMetricDetailResult(m: MetricResult, count: number): string {
  if (m.isPercent && m.num !== undefined && m.den !== undefined) {
    return `${m.num} из ${m.den} чел.`;
  }
  return `среднее по ${count} чел.`;
}
