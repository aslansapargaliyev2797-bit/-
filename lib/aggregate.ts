import type { Respondent } from "./types";
import type { Bucket, BooleanRate, Stats } from "./stats-types";

const EMPTY_LABEL = "Не указано";

function bucketBy(
  list: Respondent[],
  keyFn: (r: Respondent) => string
): Bucket[] {
  const counts = new Map<string, number>();
  for (const r of list) {
    const raw = keyFn(r);
    const label = raw && raw.trim() ? raw.trim() : EMPTY_LABEL;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  const total = list.length || 1;
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count, pct: (count / total) * 100 }))
    .sort((a, b) => b.count - a.count);
}

function booleanRate(
  list: Respondent[],
  keyFn: (r: Respondent) => string,
  yesValue = "Да"
): BooleanRate {
  let yes = 0;
  let no = 0;
  for (const r of list) {
    const v = (keyFn(r) ?? "").trim();
    if (v === yesValue) yes++;
    else if (v) no++;
  }
  const total = yes + no;
  return { yes, no, total, yesPct: total > 0 ? (yes / total) * 100 : 0 };
}

function avgOf(
  list: Respondent[],
  keyFn: (r: Respondent) => number | null
): number | null {
  const values = list.map(keyFn).filter((v): v is number => v !== null);
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

interface Range {
  label: string;
  min: number;
  max: number; // inclusive; use Infinity for open-ended
}

function rangeBuckets(
  list: Respondent[],
  keyFn: (r: Respondent) => number | null,
  ranges: Range[]
): Bucket[] {
  const counts = new Map(ranges.map((r) => [r.label, 0]));
  let total = 0;
  for (const r of list) {
    const v = keyFn(r);
    if (v === null) continue;
    total++;
    const bucket = ranges.find((rg) => v >= rg.min && v <= rg.max);
    if (bucket) counts.set(bucket.label, (counts.get(bucket.label) ?? 0) + 1);
  }
  const t = total || 1;
  return ranges.map((r) => ({
    label: r.label,
    count: counts.get(r.label) ?? 0,
    pct: ((counts.get(r.label) ?? 0) / t) * 100,
  }));
}

const AGE_RANGES: Range[] = [
  { label: "До 25 лет", min: 0, max: 24 },
  { label: "25–34", min: 25, max: 34 },
  { label: "35–44", min: 35, max: 44 },
  { label: "45–54", min: 45, max: 54 },
  { label: "55–64", min: 55, max: 64 },
  { label: "65 и старше", min: 65, max: Infinity },
];

const TENURE_RANGES: Range[] = [
  { label: "До 1 года", min: 0, max: 0 },
  { label: "1–5 лет", min: 1, max: 5 },
  { label: "6–10 лет", min: 6, max: 10 },
  { label: "11–20 лет", min: 11, max: 20 },
  { label: "21–30 лет", min: 21, max: 30 },
  { label: "Более 30 лет", min: 31, max: Infinity },
];

const RISK_LEVEL_ORDER = ["Низкий риск", "Умеренный риск", "Высокий риск"];

export function computeStats(list: Respondent[]): Stats {
  const total = list.length || 1;

  const riskLevel = bucketBy(list, (r) => r.status).sort((a, b) => {
    const ai = RISK_LEVEL_ORDER.indexOf(a.label);
    const bi = RISK_LEVEL_ORDER.indexOf(b.label);
    if (ai === -1 && bi === -1) return b.count - a.count;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const riskFactorCounts = new Map<string, number>();
  let noFactors = 0;
  for (const r of list) {
    if (r.riskTags.length === 0) {
      noFactors++;
      continue;
    }
    for (const tag of r.riskTags) {
      riskFactorCounts.set(tag, (riskFactorCounts.get(tag) ?? 0) + 1);
    }
  }
  const riskFactors: Bucket[] = Array.from(riskFactorCounts.entries())
    .map(([label, count]) => ({ label, count, pct: (count / total) * 100 }))
    .sort((a, b) => b.count - a.count);

  const symptomDefs: [string, (r: Respondent) => string][] = [
    ["Дискомфорт / боль в груди", (r) => r.chestDiscomfort],
    ["Сердцебиение / перебои в работе сердца", (r) => r.palpitations],
    ["Дневная сонливость", (r) => r.daytimeSleepiness],
    ["Частые стрессы", (r) => r.stressFrequent],
  ];

  let lastUpdated: string | null = null;
  for (const r of list) {
    if (r.timestamp && (!lastUpdated || r.timestamp > lastUpdated)) {
      lastUpdated = r.timestamp;
    }
  }

  return {
    count: list.length,
    lastUpdated,

    gender: bucketBy(list, (r) => r.gender),
    avgAge: avgOf(list, (r) => r.age),
    avgTenure: avgOf(list, (r) => r.tenure),
    avgBmi: avgOf(list, (r) => r.bmi),
    avgScore: avgOf(list, (r) => r.score),

    filialDistribution: bucketBy(list, (r) => r.filial).sort(
      (a, b) => a.label.localeCompare(b.label, "ru")
    ),

    workType: bucketBy(list, (r) => r.workType),
    ageGroups: rangeBuckets(list, (r) => r.age, AGE_RANGES),
    tenureGroups: rangeBuckets(list, (r) => r.tenure, TENURE_RANGES),
    riskLevel,
    bmiCategory: bucketBy(list, (r) => r.bmiCategory),
    smoking: bucketBy(list, (r) => r.smoking),

    processedFood: bucketBy(list, (r) => r.processedFood),
    addsSalt: booleanRate(list, (r) => r.addsSalt),

    sedentary: bucketBy(list, (r) => r.sedentaryHours),
    physicalActivity: booleanRate(list, (r) => r.physicalActivity),

    cholesterolAwareness: bucketBy(list, (r) => r.knowsCholesterol),
    sugarAwareness: bucketBy(list, (r) => r.knowsSugar),
    bpAwareness: bucketBy(list, (r) => r.knowsBP),

    bpCrises: bucketBy(list, (r) => r.bpCrises),
    bpMeds: bucketBy(list, (r) => r.bpMeds),

    diagnosis: booleanRate(list, (r) => r.diagnosis),
    familyHistory: booleanRate(list, (r) => r.familyHistory),

    symptoms: symptomDefs.map(([label, keyFn]) => ({
      label,
      rate: booleanRate(list, keyFn),
    })),

    sleepQuality: rangeBuckets(list, (r) => r.sleepQuality, [
      { label: "1 — очень плохое", min: 1, max: 1 },
      { label: "2 — плохое", min: 2, max: 2 },
      { label: "3 — удовлетворительное", min: 3, max: 3 },
      { label: "4 — хорошее", min: 4, max: 4 },
      { label: "5 — отличное", min: 5, max: 5 },
    ]),
    avgSleepQuality: avgOf(list, (r) => r.sleepQuality),

    riskFactors,
    noRiskFactorsPct: (noFactors / total) * 100,
  };
}

/** High-risk share, used across ranking views as the default "problem" metric. */
export function highRiskPct(list: Respondent[]): number {
  if (list.length === 0) return 0;
  const highRisk = list.filter((r) => r.status === "Высокий риск").length;
  return (highRisk / list.length) * 100;
}
