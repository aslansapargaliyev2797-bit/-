"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import {
  PROBLEM_METRICS,
  formatMetricValue,
  formatMetricDetail,
  type GroupSummary,
  type ProblemMetricId,
} from "@/lib/ranking";
import { Card } from "./Card";
import { BarList } from "./BarList";

function metricValue(row: GroupSummary, metric: ProblemMetricId): number {
  const v = row[metric];
  return v ?? -Infinity;
}

function riskColor(pct: number): string {
  if (pct >= 15) return "var(--status-critical)";
  if (pct >= 8) return "var(--status-warning)";
  return "var(--status-good)";
}

export function RankingView({
  dimensionLabel,
  rows,
  exploreParam,
  unitBreakdown,
}: {
  dimensionLabel: string;
  rows: GroupSummary[];
  /** Which query param selects this dimension on the "Общее" explorer page. */
  exploreParam: "filial" | "dept";
  unitBreakdown?: Record<string, GroupSummary[]>;
}) {
  const [metric, setMetric] = useState<ProblemMetricId>("highRiskPct");
  const [expanded, setExpanded] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...rows].sort((a, b) => metricValue(b, metric) - metricValue(a, metric)),
    [rows, metric]
  );

  const top = sorted.slice(0, 5);
  const barData = sorted.map((r) => ({
    label: r.key,
    count: r.count,
    pct:
      metric === "avgScore" || metric === "avgBmi"
        ? metricValue(r, metric)
        : metricValue(r, metric),
  }));
  const maxForColor = metric === "highRiskPct" || metric === "moderateRiskPct";

  return (
    <div className="flex flex-col gap-6">
      <Card
        title={`Топ проблемных: ${dimensionLabel.toLowerCase()}`}
        subtitle="Метрика определяет ранжирование"
      >
        <div className="flex flex-wrap gap-2 mb-4">
          {PROBLEM_METRICS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMetric(m.id)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={{
                background: metric === m.id ? "var(--series-1)" : "var(--gridline)",
                color: metric === m.id ? "#fff" : "var(--text-secondary)",
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        <ol className="flex flex-col gap-2">
          {top.map((row, i) => (
            <li
              key={row.key}
              className="flex items-center gap-3 py-2 border-b last:border-b-0"
              style={{ borderColor: "var(--border)" }}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                style={{
                  background: i === 0 ? "var(--status-critical)" : "var(--gridline)",
                  color: i === 0 ? "#fff" : "var(--text-secondary)",
                }}
              >
                {i + 1}
              </span>
              <span
                className="flex-1 text-sm truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {row.key}
              </span>
              <span className="text-right shrink-0">
                <span
                  className="block text-sm font-semibold tabular-nums"
                  style={{
                    color: maxForColor ? riskColor(metricValue(row, metric)) : "var(--text-primary)",
                  }}
                >
                  {formatMetricValue(row, metric)}
                </span>
                <span className="block text-xs" style={{ color: "var(--text-muted)" }}>
                  {formatMetricDetail(row, metric)}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </Card>

      <Card
        title={`Все: ${dimensionLabel.toLowerCase()}`}
        subtitle={PROBLEM_METRICS.find((m) => m.id === metric)?.label}
      >
        <BarList
          data={barData}
          valueText={(label) => {
            const row = sorted.find((r) => r.key === label);
            return row ? formatMetricValue(row, metric) : "";
          }}
          detailFor={(label) => {
            const row = sorted.find((r) => r.key === label);
            return row ? formatMetricDetail(row, metric) : undefined;
          }}
          colorFor={maxForColor ? (label) => {
            const row = sorted.find((r) => r.key === label);
            return row ? riskColor(metricValue(row, metric)) : "var(--series-1)";
          } : undefined}
          color="var(--series-1)"
        />
      </Card>

      <Card title="Таблица" subtitle="Нажмите на строку, чтобы раскрыть подробную статистику">
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm border-collapse min-w-[640px]">
            <thead>
              <tr style={{ color: "var(--text-muted)" }} className="text-left">
                <th className="py-2 pr-3 font-medium">{dimensionLabel}</th>
                <th className="py-2 px-3 font-medium text-right">Анкет</th>
                <th className="py-2 px-3 font-medium text-right">Ср. балл</th>
                <th className="py-2 px-3 font-medium text-right">% высокий риск</th>
                <th className="py-2 px-3 font-medium text-right">% умеренный риск</th>
                <th className="py-2 px-3 font-medium text-right">% курящих</th>
                <th className="py-2 pl-3 font-medium">Топ-фактор риска</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <Fragment key={row.key}>
                  <tr
                    onClick={() =>
                      setExpanded(expanded === row.key ? null : row.key)
                    }
                    className="cursor-pointer border-t"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <td
                      className="py-2.5 pr-3 font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {expanded === row.key ? "▾" : "▸"} {row.key}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums" style={{ color: "var(--text-secondary)" }}>
                      {row.count}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums" style={{ color: "var(--text-secondary)" }}>
                      {row.avgScore !== null ? row.avgScore.toFixed(1) : "—"}
                    </td>
                    <td
                      className="py-2.5 px-3 text-right tabular-nums font-medium"
                      style={{ color: riskColor(row.highRiskPct) }}
                      title={`${row.highRiskCount} из ${row.count} чел.`}
                    >
                      {row.highRiskPct.toFixed(1)}%
                    </td>
                    <td
                      className="py-2.5 px-3 text-right tabular-nums"
                      style={{ color: "var(--text-secondary)" }}
                      title={`${row.moderateRiskCount} из ${row.count} чел.`}
                    >
                      {row.moderateRiskPct.toFixed(1)}%
                    </td>
                    <td
                      className="py-2.5 px-3 text-right tabular-nums"
                      style={{ color: "var(--text-secondary)" }}
                      title={`${row.smokingCount} из ${row.count} чел.`}
                    >
                      {row.smokingPct.toFixed(1)}%
                    </td>
                    <td className="py-2.5 pl-3" style={{ color: "var(--text-secondary)" }}>
                      {row.topRiskFactor ?? "—"}
                    </td>
                  </tr>
                  {expanded === row.key && (
                    <tr>
                      <td colSpan={7} className="py-4">
                        <div
                          className="rounded-xl border p-4"
                          style={{ borderColor: "var(--border)", background: "var(--page-plane)" }}
                        >
                          {unitBreakdown?.[row.key] && unitBreakdown[row.key].length > 1 && (
                            <div className="mb-6 pb-6 border-b" style={{ borderColor: "var(--border)" }}>
                              <h4
                                className="text-sm font-semibold mb-1"
                                style={{ color: "var(--text-primary)" }}
                              >
                                Структурные единицы (ЛПУ / АУП) внутри «{row.key}»
                              </h4>
                              <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                                % высокого риска среди сотрудников каждой единицы (число под процентом — сколько человек это составляет)
                              </p>
                              <BarList
                                data={unitBreakdown[row.key].map((u) => ({
                                  label: u.key,
                                  count: u.count,
                                  pct: u.highRiskPct,
                                }))}
                                valueText={(label) => {
                                  const u = unitBreakdown[row.key].find((x) => x.key === label);
                                  return u ? `${u.highRiskPct.toFixed(1)}%` : "";
                                }}
                                detailFor={(label) => {
                                  const u = unitBreakdown[row.key].find((x) => x.key === label);
                                  return u ? `${u.highRiskCount} из ${u.count} чел.` : undefined;
                                }}
                                colorFor={(label) => {
                                  const u = unitBreakdown[row.key].find((x) => x.key === label);
                                  return u ? riskColor(u.highRiskPct) : "var(--series-1)";
                                }}
                              />
                            </div>
                          )}
                          <Link
                            href={`/?${exploreParam}=${encodeURIComponent(row.key)}`}
                            className="inline-flex items-center gap-1.5 text-sm font-medium"
                            style={{ color: "var(--series-1)" }}
                          >
                            Полная статистика по «{row.key}» на странице «Общее» →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
