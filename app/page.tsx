import { getRespondents } from "@/lib/data";
import { Explorer } from "@/components/Explorer";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const respondents = await getRespondents();

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
          Выберите филиал → структурную единицу → службу, чтобы посмотреть срез,
          или оставьте «Все», чтобы увидеть данные по всей компании
        </p>
      </div>
      <Explorer respondents={respondents} />
    </div>
  );
}
