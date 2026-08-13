import type { Respondent } from "./types";
import { computeStats } from "./aggregate";
import type { Stats } from "./stats-types";
import { groupBy, toSummary, type GroupSummary } from "./ranking";

export const CELL_SEP = "|||";

export interface MatrixData {
  filials: string[];
  departments: string[];
  cells: Record<string, GroupSummary>;
  statsByCell: Record<string, Stats>;
}

export function buildMatrix(respondents: Respondent[]): MatrixData {
  const filialOrder = new Map<string, number>();
  for (const r of respondents) {
    if (!filialOrder.has(r.filial)) filialOrder.set(r.filial, r.filialOrder);
  }
  const filials = Array.from(filialOrder.keys()).sort(
    (a, b) => (filialOrder.get(a)! - filialOrder.get(b)!) || a.localeCompare(b, "ru")
  );

  const departments = Array.from(new Set(respondents.map((r) => r.department))).sort(
    (a, b) => a.localeCompare(b, "ru")
  );

  const cells: Record<string, GroupSummary> = {};
  const statsByCell: Record<string, Stats> = {};

  for (const filial of filials) {
    const inFilial = respondents.filter((r) => r.filial === filial);
    const byDept = groupBy(inFilial, (r) => r.department);
    for (const g of byDept) {
      const key = `${filial}${CELL_SEP}${g.key}`;
      cells[key] = toSummary(g);
      statsByCell[key] = computeStats(g.respondents);
    }
  }

  return { filials, departments, cells, statsByCell };
}
