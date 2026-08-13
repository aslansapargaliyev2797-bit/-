import { getRespondents } from "@/lib/data";
import { buildMatrix } from "@/lib/matrix";
import { HeatmapView } from "@/components/HeatmapView";

export const dynamic = "force-dynamic";

export default async function CombinedPage() {
  const respondents = await getRespondents();
  const matrix = buildMatrix(respondents);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Комбинированно
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Филиал × подразделение вместе, с фильтрами
        </p>
      </div>
      <HeatmapView data={matrix} />
    </div>
  );
}
