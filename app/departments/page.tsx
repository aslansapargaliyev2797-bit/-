import { getRespondents } from "@/lib/data";
import { computeStats } from "@/lib/aggregate";
import { groupBy, toSummary, type GroupSummary } from "@/lib/ranking";
import type { Stats } from "@/lib/stats-types";
import { RankingView } from "@/components/RankingView";

export const dynamic = "force-dynamic";

export default async function DepartmentsPage() {
  const respondents = await getRespondents();

  const groups = groupBy(respondents, (r) => r.department);
  const rows: GroupSummary[] = groups.map(toSummary);

  const statsByGroup: Record<string, Stats> = {};
  for (const g of groups) {
    statsByGroup[g.key] = computeStats(g.respondents);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Подразделения (службы)
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          {groups.length} служб · {respondents.length.toLocaleString("ru-RU")} анкет
        </p>
      </div>
      <RankingView
        dimensionLabel="Подразделение"
        rows={rows}
        statsByGroup={statsByGroup}
      />
    </div>
  );
}
