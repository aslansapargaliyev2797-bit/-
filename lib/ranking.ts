import type { Respondent } from "./types";

export interface GroupRow {
  key: string;
  count: number;
  avgScore: number | null;
  avgBmi: number | null;
  highRiskPct: number;
  highRiskCount: number;
  moderateRiskPct: number;
  moderateRiskCount: number;
  smokingPct: number;
  smokingCount: number;
  topRiskFactor: string | null;
  respondents: Respondent[];
}

/** Same shape without the raw respondent list — safe/small to send to the client. */
export type GroupSummary = Omit<GroupRow, "respondents">;

export function toSummary(row: GroupRow): GroupSummary {
  const { respondents: _respondents, ...summary } = row;
  return summary;
}

export const PROBLEM_METRICS = [
  { id: "highRiskPct", label: "% высокого риска" },
  { id: "avgScore", label: "Средний балл риска" },
  { id: "smokingPct", label: "% курящих" },
  { id: "avgBmi", label: "Средний ИМТ" },
  { id: "moderateRiskPct", label: "% умеренного риска" },
] as const;

export type ProblemMetricId = (typeof PROBLEM_METRICS)[number]["id"];

const PCT_METRIC_COUNT: Partial<Record<ProblemMetricId, keyof GroupSummary>> = {
  highRiskPct: "highRiskCount",
  moderateRiskPct: "moderateRiskCount",
  smokingPct: "smokingCount",
};

/** The headline number for a metric — "22.9%" or "6.8". */
export function formatMetricValue(
  row: GroupSummary,
  metric: ProblemMetricId
): string {
  switch (metric) {
    case "highRiskPct":
      return `${row.highRiskPct.toFixed(1)}%`;
    case "moderateRiskPct":
      return `${row.moderateRiskPct.toFixed(1)}%`;
    case "smokingPct":
      return `${row.smokingPct.toFixed(1)}%`;
    case "avgScore":
      return row.avgScore !== null ? row.avgScore.toFixed(1) : "—";
    case "avgBmi":
      return row.avgBmi !== null ? row.avgBmi.toFixed(1) : "—";
  }
}

/** The context that makes the headline number readable — "8 из 35 чел." or "среднее по 35 чел.". */
export function formatMetricDetail(
  row: GroupSummary,
  metric: ProblemMetricId
): string {
  const countKey = PCT_METRIC_COUNT[metric];
  if (countKey) {
    return `${row[countKey]} из ${row.count} чел.`;
  }
  return `среднее по ${row.count} чел.`;
}

function avg(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function groupBy(
  list: Respondent[],
  keyFn: (r: Respondent) => string
): GroupRow[] {
  const groups = new Map<string, Respondent[]>();
  for (const r of list) {
    const key = keyFn(r) || "Не указано";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  const rows: GroupRow[] = [];
  for (const [key, members] of groups) {
    const count = members.length;
    const highRisk = members.filter((r) => r.status === "Высокий риск").length;
    const moderateRisk = members.filter(
      (r) => r.status === "Умеренный риск"
    ).length;
    const smokers = members.filter(
      (r) => r.smoking === "Курю в настоящее время"
    ).length;

    const factorCounts = new Map<string, number>();
    for (const m of members) {
      for (const tag of m.riskTags) {
        factorCounts.set(tag, (factorCounts.get(tag) ?? 0) + 1);
      }
    }
    let topRiskFactor: string | null = null;
    let topCount = 0;
    for (const [tag, c] of factorCounts) {
      if (c > topCount) {
        topCount = c;
        topRiskFactor = tag;
      }
    }

    rows.push({
      key,
      count,
      avgScore: avg(members.map((r) => r.score).filter((v): v is number => v !== null)),
      avgBmi: avg(members.map((r) => r.bmi).filter((v): v is number => v !== null)),
      highRiskPct: count > 0 ? (highRisk / count) * 100 : 0,
      highRiskCount: highRisk,
      moderateRiskPct: count > 0 ? (moderateRisk / count) * 100 : 0,
      moderateRiskCount: moderateRisk,
      smokingPct: count > 0 ? (smokers / count) * 100 : 0,
      smokingCount: smokers,
      topRiskFactor,
      respondents: members,
    });
  }

  return rows;
}

export function sortByMetric(
  rows: GroupRow[],
  metric: ProblemMetricId,
  direction: "desc" | "asc" = "desc"
): GroupRow[] {
  const sorted = [...rows].sort((a, b) => {
    const av = a[metric] ?? -Infinity;
    const bv = b[metric] ?? -Infinity;
    return direction === "desc" ? bv - av : av - bv;
  });
  return sorted;
}
