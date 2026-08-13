"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import {
  METRICS,
  METRIC_GROUPS,
  getMetric,
  formatMetricResult,
  formatMetricDetailResult,
} from "@/lib/metrics";
import type { GroupSummary } from "@/lib/ranking";
import { Card } from "./Card";
import { BarList } from "./BarList";

function metricValue(row: GroupSummary, metricId: string): number {
  const v = row.metrics[metricId]?.value;
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
  const [metricId, setMetricId] = useState("highRiskPct");
  const [expanded, setExpanded] = useState<string | null>(null);
  const metric = getMetric(metricId);

  const sorted = useMemo(
    () => [...rows].sort((a, b) => metricValue(b, metricId) - metricValue(a, metricId)),
    [rows, metricId]
  );

  const top = sorted.slice(0, 5);
  const barData = sorted.map((r) => ({
    label: r.key,
    count: r.count,
    pct: metricValue(r, metricId),
  }));
  const colorable = metric.isPercent;

  return (
    <div className="flex flex-col gap-6">
      <Card title={`Рейтинг: ${dimensionLabel.toLowerCase()}`} subtitle="Метрика для сравнения и сортировки">
        <label className="flex flex-col gap-1 text-xs mb-4 max-w-sm" style={{ color: "var(--text-muted)" }}>
          Метрика
          <select
            value={metricId}
            onChange={(e) => setMetricId(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface-1)",
              color: "var(--text-primary)",
            }}
          >
            {METRIC_GROUPS.map((group) => (
              <optgroup key={group} label={group}>
                {METRICS.filter((m) => m.group === group).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

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
                    color: colorable ? riskColor(metricValue(row, metricId)) : "var(--text-primary)",
                  }}
                >
                  {formatMetricResult(row.metrics[metricId])}
                </span>
                <span className="block text-xs" style={{ color: "var(--text-muted)" }}>
                  {formatMetricDetailResult(row.metrics[metricId], row.count)}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </Card>

      <Card
        title={`Все: ${dimensionLabel.toLowerCase()}`}
        subtitle={metric.label}
      >
        <BarList
          data={barData}
          valueText={(label) => {
            const row = sorted.find((r) => r.key === label);
            return row ? formatMetricResult(row.metrics[metricId]) : "";
          }}
          detailFor={(label) => {
            const row = sorted.find((r) => r.key === label);
            return row ? formatMetricDetailResult(row.metrics[metricId], row.count) : undefined;
          }}
          colorFor={colorable ? (label) => {
            const row = sorted.find((r) => r.key === label);
            return row ? riskColor(metricValue(row, metricId)) : "var(--series-1)";
          } : undefined}
          color="var(--series-1)"
        />
      </Card>

      <Card title="Таблица" subtitle="Нажмите на строку, чтобы раскрыть подробную статистику">
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm border-collapse min-w-[720px]">
            <thead>
              <tr style={{ color: "var(--text-muted)" }} className="text-left">
                <th className="py-2 pr-3 font-medium">{dimensionLabel}</th>
                <th className="py-2 px-3 font-medium text-right">Анкет</th>
                <th className="py-2 px-3 font-medium text-right">{metric.label}</th>
                <th className="py-2 px-3 font-medium text-right">% высокого риска</th>
                <th className="py-2 px-3 font-medium text-right">% умеренного риска</th>
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
                    <td
                      className="py-2.5 px-3 text-right tabular-nums font-medium"
                      style={{ color: colorable ? riskColor(metricValue(row, metricId)) : "var(--text-primary)" }}
                      title={formatMetricDetailResult(row.metrics[metricId], row.count)}
                    >
                      {formatMetricResult(row.metrics[metricId])}
                    </td>
                    <td
                      className="py-2.5 px-3 text-right tabular-nums"
                      style={{ color: riskColor(row.metrics.highRiskPct.value ?? 0) }}
                      title={formatMetricDetailResult(row.metrics.highRiskPct, row.count)}
                    >
                      {formatMetricResult(row.metrics.highRiskPct)}
                    </td>
                    <td
                      className="py-2.5 px-3 text-right tabular-nums"
                      style={{ color: "var(--text-secondary)" }}
                      title={formatMetricDetailResult(row.metrics.moderateRiskPct, row.count)}
                    >
                      {formatMetricResult(row.metrics.moderateRiskPct)}
                    </td>
                    <td
                      className="py-2.5 px-3 text-right tabular-nums"
                      style={{ color: "var(--text-secondary)" }}
                      title={formatMetricDetailResult(row.metrics.smokingNowPct, row.count)}
                    >
                      {formatMetricResult(row.metrics.smokingNowPct)}
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
                                  pct: u.metrics.highRiskPct.value ?? 0,
                                }))}
                                valueText={(label) => {
                                  const u = unitBreakdown[row.key].find((x) => x.key === label);
                                  return u ? formatMetricResult(u.metrics.highRiskPct) : "";
                                }}
                                detailFor={(label) => {
                                  const u = unitBreakdown[row.key].find((x) => x.key === label);
                                  return u ? formatMetricDetailResult(u.metrics.highRiskPct, u.count) : undefined;
                                }}
                                colorFor={(label) => {
                                  const u = unitBreakdown[row.key].find((x) => x.key === label);
                                  return u ? riskColor(u.metrics.highRiskPct.value ?? 0) : "var(--series-1)";
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
