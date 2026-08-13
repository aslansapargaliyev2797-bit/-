import { getRespondents } from "@/lib/data";
import { computeStats } from "@/lib/aggregate";
import { groupBy, toSummary, type GroupSummary } from "@/lib/ranking";
import type { Stats } from "@/lib/stats-types";
import { RankingView } from "@/components/RankingView";

export const dynamic = "force-dynamic";

export default async function FilialsPage() {
  const respondents = await getRespondents();

  const groups = groupBy(respondents, (r) => r.filial);
  const rows: GroupSummary[] = groups.map(toSummary);

  const statsByGroup: Record<string, Stats> = {};
  const unitBreakdown: Record<string, GroupSummary[]> = {};
  for (const g of groups) {
    statsByGroup[g.key] = computeStats(g.respondents);
    const units = groupBy(g.respondents, (r) => r.unit ?? "Без структурной единицы");
    unitBreakdown[g.key] = units.map(toSummary);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Филиалы
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          {groups.length} филиалов · {respondents.length.toLocaleString("ru-RU")} анкет
        </p>
      </div>
      <RankingView
        dimensionLabel="Филиал"
        rows={rows}
        statsByGroup={statsByGroup}
        unitBreakdown={unitBreakdown}
      />
    </div>
  );
}
