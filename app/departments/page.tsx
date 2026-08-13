import { getRespondents } from "@/lib/data";
import { groupBy, toSummary, type GroupSummary } from "@/lib/ranking";
import { RankingView } from "@/components/RankingView";

export const dynamic = "force-dynamic";

export default async function DepartmentsPage() {
  const respondents = await getRespondents();

  const groups = groupBy(respondents, (r) => r.department);
  const rows: GroupSummary[] = groups.map(toSummary);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Службы
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          {groups.length} служб · {respondents.length.toLocaleString("ru-RU")} анкет
        </p>
      </div>
      <RankingView dimensionLabel="Служба" rows={rows} exploreParam="dept" />
    </div>
  );
}
