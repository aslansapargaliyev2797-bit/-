import { getRespondents } from "@/lib/data";
import { computeStats } from "@/lib/aggregate";
import { StatsSections } from "@/components/StatsSections";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const respondents = await getRespondents();
  const stats = computeStats(respondents);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1
          className="text-xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Общая статистика
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          По всем филиалам и подразделениям вместе
        </p>
      </div>
      <StatsSections stats={stats} showFilialDistribution />
    </div>
  );
}
