import type { Respondent } from "./types";
import { computeStats } from "./aggregate";
import { METRICS, type MetricResult } from "./metrics";

export interface GroupRow {
  key: string;
  count: number;
  topRiskFactor: string | null;
  metrics: Record<string, MetricResult>;
  respondents: Respondent[];
}

/** Same shape without the raw respondent list — safe/small to send to the client. */
export type GroupSummary = Omit<GroupRow, "respondents">;

export function toSummary(row: GroupRow): GroupSummary {
  const { respondents: _respondents, ...summary } = row;
  return summary;
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
    const stats = computeStats(members);

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

    const metrics: Record<string, MetricResult> = {};
    for (const m of METRICS) {
      metrics[m.id] = m.get(stats);
    }

    rows.push({ key, count, topRiskFactor, metrics, respondents: members });
  }

  return rows;
}
