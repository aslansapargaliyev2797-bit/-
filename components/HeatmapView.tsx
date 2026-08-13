"use client";

import { useMemo, useState } from "react";
import type { MatrixData } from "@/lib/matrix";
import { CELL_SEP } from "@/lib/matrix";
import { Card } from "./Card";
import { StatsSections } from "./StatsSections";

const ALL = "__all__";

const LEGEND_STEPS: [string, string][] = [
  ["var(--seq-100)", "0–3%"],
  ["var(--seq-200)", "3–6%"],
  ["var(--seq-300)", "6–10%"],
  ["var(--seq-400)", "10–15%"],
  ["var(--seq-500)", "15–22%"],
  ["var(--seq-600)", "22–30%"],
  ["var(--seq-700)", "30%+"],
];

function seqColor(pct: number): string {
  if (pct <= 0) return "var(--gridline)";
  if (pct < 3) return "var(--seq-100)";
  if (pct < 6) return "var(--seq-200)";
  if (pct < 10) return "var(--seq-300)";
  if (pct < 15) return "var(--seq-400)";
  if (pct < 22) return "var(--seq-500)";
  if (pct < 30) return "var(--seq-600)";
  return "var(--seq-700)";
}

function textOn(pct: number): string {
  // Dark cell fills need light text for contrast.
  return pct >= 10 ? "#ffffff" : "var(--text-primary)";
}

export function HeatmapView({ data }: { data: MatrixData }) {
  const [filialFilter, setFilialFilter] = useState(ALL);
  const [deptFilter, setDeptFilter] = useState(ALL);
  const [selected, setSelected] = useState<string | null>(null);

  const filials = useMemo(
    () => (filialFilter === ALL ? data.filials : [filialFilter]),
    [data.filials, filialFilter]
  );
  const departments = useMemo(
    () => (deptFilter === ALL ? data.departments : [deptFilter]),
    [data.departments, deptFilter]
  );

  const selectedStats = selected ? data.statsByCell[selected] : null;
  const selectedCell = selected ? data.cells[selected] : null;
  const [selFilial, selDept] = selected ? selected.split(CELL_SEP) : [null, null];

  return (
    <div className="flex flex-col gap-6">
      <Card title="Что это такое">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Каждая ячейка ниже — это одно сочетание <b>«филиал» + «служба»</b>
          (например «03. УМГ Атырау» и «ЭХЗ» вместе). Число и цвет ячейки —
          доля анкет с <b>высоким риском</b> среди сотрудников именно этого
          сочетания; число под процентом — сколько человек в сумме заполнили
          анкету в этом сочетании. Чем темнее и краснее ячейка — тем выше доля
          высокого риска. Нажмите на ячейку, чтобы раскрыть полную статистику
          именно по ней.
        </p>
      </Card>

      <Card title="Фильтры" subtitle="Можно сузить карту до одного филиала и/или одной службы">
        <div className="flex flex-wrap gap-4">
          <label className="flex flex-col gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
            Филиал
            <select
              value={filialFilter}
              onChange={(e) => {
                setFilialFilter(e.target.value);
                setSelected(null);
              }}
              className="rounded-lg border px-3 py-1.5 text-sm"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface-1)",
                color: "var(--text-primary)",
              }}
            >
              <option value={ALL}>Все филиалы</option>
              {data.filials.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
            Служба
            <select
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setSelected(null);
              }}
              className="rounded-lg border px-3 py-1.5 text-sm"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface-1)",
                color: "var(--text-primary)",
              }}
            >
              <option value={ALL}>Все службы</option>
              {data.departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      <Card
        title="Тепловая карта: филиал × служба"
        subtitle="% и число в ячейке — доля и количество анкет с высоким риском. Нажмите на ячейку для подробностей."
      >
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            % анкет с высоким риском:
          </span>
          {LEGEND_STEPS.map(([color, label]) => (
            <span key={label} className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
              <span
                className="inline-block w-3 h-3 rounded-sm"
                style={{ background: color }}
              />
              {label}
            </span>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="border-collapse text-xs min-w-full">
            <thead>
              <tr>
                <th className="sticky left-0 z-10" style={{ background: "var(--surface-1)" }} />
                {departments.map((d) => (
                  <th
                    key={d}
                    className="px-1 pb-2 font-medium text-center align-bottom"
                    style={{ color: "var(--text-muted)", minWidth: 84 }}
                  >
                    <div className="[writing-mode:vertical-rl] rotate-180 h-24 flex items-end justify-center mx-auto">
                      {d}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filials.map((f) => (
                <tr key={f}>
                  <th
                    className="sticky left-0 z-10 pr-3 py-1 text-right font-medium whitespace-nowrap"
                    style={{ background: "var(--surface-1)", color: "var(--text-secondary)" }}
                  >
                    {f}
                  </th>
                  {departments.map((d) => {
                    const key = `${f}${CELL_SEP}${d}`;
                    const cell = data.cells[key];
                    const pct = cell?.highRiskPct ?? 0;
                    return (
                      <td key={d} className="p-0.5">
                        <button
                          disabled={!cell}
                          onClick={() => setSelected(key)}
                          className="w-full h-11 rounded-md flex flex-col items-center justify-center leading-tight transition-transform hover:scale-[1.04] disabled:cursor-default"
                          style={{
                            background: cell ? seqColor(pct) : "var(--page-plane)",
                            color: cell ? textOn(pct) : "var(--text-muted)",
                            outline:
                              selected === key ? "2px solid var(--series-2)" : "none",
                            outlineOffset: -2,
                          }}
                          title={
                            cell
                              ? `${f} × ${d}: ${cell.highRiskCount} из ${cell.count} чел. (${pct.toFixed(1)}%) — высокий риск`
                              : "Нет анкет в этом сочетании"
                          }
                        >
                          {cell ? (
                            <>
                              <span className="font-semibold">{pct.toFixed(0)}%</span>
                              <span style={{ opacity: 0.75 }}>{cell.count} чел.</span>
                            </>
                          ) : (
                            "—"
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedStats && selectedCell && (
        <Card
          title={`${selFilial} × ${selDept}`}
          subtitle={`${selectedCell.count} анкет · ${selectedCell.highRiskPct.toFixed(1)}% высокого риска (${selectedCell.highRiskCount} чел.)`}
        >
          <StatsSections stats={selectedStats} />
        </Card>
      )}
    </div>
  );
}
