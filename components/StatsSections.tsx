import type { Stats } from "@/lib/stats-types";
import { Card } from "./Card";
import { StatTile } from "./StatTile";
import { BarList } from "./BarList";
import { StatusDistribution } from "./StatusDistribution";
import { RateMeter } from "./RateMeter";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Almaty",
  });
}

export function StatsSections({
  stats,
  showFilialDistribution = false,
}: {
  stats: Stats;
  showFilialDistribution?: boolean;
}) {
  const highRisk =
    stats.riskLevel.find((b) => b.label === "Высокий риск")?.pct ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Ключевые показатели */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatTile label="Анкет сдано" value={stats.count.toLocaleString("ru-RU")} />
        <StatTile
          label="Последняя анкета"
          value={formatDate(stats.lastUpdated)}
        />
        <StatTile
          label="Средний возраст"
          value={stats.avgAge ? `${stats.avgAge.toFixed(1)} лет` : "—"}
        />
        <StatTile
          label="Средний ИМТ"
          value={stats.avgBmi ? stats.avgBmi.toFixed(1) : "—"}
        />
        <StatTile
          label="Средний риск-балл"
          value={stats.avgScore ? stats.avgScore.toFixed(1) : "—"}
        />
        <StatTile
          label="Высокий риск"
          value={`${highRisk.toFixed(1)}%`}
          tone={highRisk > 15 ? "critical" : highRisk > 8 ? "warning" : "good"}
        />
      </div>

      <Card title="Уровень риска ССЗ (по опроснику)">
        <StatusDistribution data={stats.riskLevel} />
      </Card>

      {showFilialDistribution && (
        <Card title="Распределение по филиалам">
          <BarList data={stats.filialDistribution} valueLabel="count" color="var(--series-1)" />
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Пол">
          <BarList data={stats.gender} color="var(--series-1)" />
        </Card>
        <Card title="Тип занятости">
          <BarList data={stats.workType} color="var(--series-1)" />
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Возрастные группы" subtitle={stats.avgAge ? `Средний возраст: ${stats.avgAge.toFixed(1)} лет` : undefined}>
          <BarList data={stats.ageGroups} color="var(--series-1)" />
        </Card>
        <Card title="Стаж работы" subtitle={stats.avgTenure ? `Средний стаж: ${stats.avgTenure.toFixed(1)} лет` : undefined}>
          <BarList data={stats.tenureGroups} color="var(--series-1)" />
        </Card>
      </div>

      <Card
        title="Индекс массы тела (ИМТ)"
        subtitle={stats.avgBmi ? `Средний ИМТ: ${stats.avgBmi.toFixed(1)}` : undefined}
      >
        <BarList data={stats.bmiCategory} color="var(--series-2)" />
      </Card>

      <Card title="Курение">
        <BarList data={stats.smoking} color="var(--series-8)" />
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Питание: частота фастфуда / переработанных продуктов">
          <BarList data={stats.processedFood} color="var(--series-2)" />
        </Card>
        <Card title="Питание: другое">
          <div className="flex flex-col gap-4">
            <RateMeter label="Досаливает готовую пищу" rate={stats.addsSalt} />
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Сидячий образ жизни">
          <BarList data={stats.sedentary} color="var(--series-3)" />
        </Card>
        <Card title="Регулярная физическая активность">
          <RateMeter label="Есть регулярная активность" rate={stats.physicalActivity} />
        </Card>
      </div>

      <Card title="Осведомлённость о показателях здоровья">
        <div className="grid sm:grid-cols-3 gap-6">
          <div>
            <h4 className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
              Холестерин
            </h4>
            <BarList data={stats.cholesterolAwareness} color="var(--series-4)" />
          </div>
          <div>
            <h4 className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
              Сахар (глюкоза)
            </h4>
            <BarList data={stats.sugarAwareness} color="var(--series-4)" />
          </div>
          <div>
            <h4 className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
              Артериальное давление (самооценка)
            </h4>
            <BarList data={stats.bpAwareness} color="var(--series-4)" />
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Гипертонические кризы">
          <BarList data={stats.bpCrises} color="var(--series-8)" />
        </Card>
        <Card title="Приём препаратов от давления">
          <BarList data={stats.bpMeds} color="var(--series-8)" />
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Семейный анамнез и диагнозы">
          <div className="flex flex-col gap-4">
            <RateMeter label="Диагноз ССЗ подтверждён" rate={stats.diagnosis} />
            <RateMeter
              label="Есть родственники с ССЗ (наследственность)"
              rate={stats.familyHistory}
            />
          </div>
        </Card>
        <Card title="Симптомы и жалобы">
          <div className="flex flex-col gap-4">
            {stats.symptoms.map((s) => (
              <RateMeter key={s.label} label={s.label} rate={s.rate} />
            ))}
          </div>
        </Card>
      </div>

      <Card
        title="Качество сна (шкала 1–5)"
        subtitle={
          stats.avgSleepQuality
            ? `Средняя оценка: ${stats.avgSleepQuality.toFixed(2)}`
            : undefined
        }
      >
        <BarList data={stats.sleepQuality} color="var(--series-3)" />
      </Card>

      <Card
        title="Основные факторы риска"
        subtitle={`Один сотрудник может иметь несколько факторов одновременно · без факторов риска: ${stats.noRiskFactorsPct.toFixed(1)}%`}
      >
        <BarList data={stats.riskFactors} color="var(--series-8)" />
      </Card>
    </div>
  );
}
