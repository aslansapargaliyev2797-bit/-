"use client";

import { useMemo, useState } from "react";
import type { Respondent } from "@/lib/types";
import { computeStats } from "@/lib/aggregate";
import { Card } from "./Card";
import { StatsSections } from "./StatsSections";

const ALL = "__all__";
const NO_UNIT = "Без структурной единицы";

function sortRu(a: string, b: string) {
  return a.localeCompare(b, "ru");
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-1 text-xs flex-1 min-w-[200px]" style={{ color: "var(--text-muted)" }}>
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border px-3 py-2 text-sm"
        style={{
          borderColor: "var(--border)",
          background: "var(--surface-1)",
          color: "var(--text-primary)",
        }}
      >
        <option value={ALL}>Все</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Explorer({ respondents }: { respondents: Respondent[] }) {
  const [selFilial, setSelFilial] = useState(ALL);
  const [selUnit, setSelUnit] = useState(ALL);
  const [selDept, setSelDept] = useState(ALL);

  const filialOptions = useMemo(() => {
    const order = new Map<string, number>();
    for (const r of respondents) {
      if (!order.has(r.filial)) order.set(r.filial, r.filialOrder);
    }
    return Array.from(order.keys()).sort(
      (a, b) => (order.get(a)! - order.get(b)!) || sortRu(a, b)
    );
  }, [respondents]);

  const afterFilial = useMemo(
    () =>
      selFilial === ALL
        ? respondents
        : respondents.filter((r) => r.filial === selFilial),
    [respondents, selFilial]
  );

  const unitOptions = useMemo(
    () =>
      Array.from(new Set(afterFilial.map((r) => r.unit ?? NO_UNIT))).sort(sortRu),
    [afterFilial]
  );

  const afterUnit = useMemo(
    () =>
      selUnit === ALL
        ? afterFilial
        : afterFilial.filter((r) => (r.unit ?? NO_UNIT) === selUnit),
    [afterFilial, selUnit]
  );

  const deptOptions = useMemo(
    () => Array.from(new Set(afterUnit.map((r) => r.department))).sort(sortRu),
    [afterUnit]
  );

  const filtered = useMemo(
    () =>
      selDept === ALL
        ? afterUnit
        : afterUnit.filter((r) => r.department === selDept),
    [afterUnit, selDept]
  );

  const stats = useMemo(() => computeStats(filtered), [filtered]);

  const crumbs = ["Общее"];
  if (selFilial !== ALL) crumbs.push(selFilial);
  if (selUnit !== ALL) crumbs.push(selUnit);
  if (selDept !== ALL) crumbs.push(selDept);

  return (
    <div className="flex flex-col gap-6">
      <Card title="Выбор среза" subtitle="Сначала филиал, затем структурная единица (ЛПУ/АУП) внутри него, затем служба">
        <div className="flex flex-wrap gap-3">
          <Select
            label="Филиал"
            value={selFilial}
            onChange={(v) => {
              setSelFilial(v);
              setSelUnit(ALL);
              setSelDept(ALL);
            }}
            options={filialOptions}
          />
          <Select
            label="Структурная единица (ЛПУ / АУП)"
            value={selUnit}
            onChange={(v) => {
              setSelUnit(v);
              setSelDept(ALL);
            }}
            options={unitOptions}
          />
          <Select
            label="Служба"
            value={selDept}
            onChange={setSelDept}
            options={deptOptions}
          />
        </div>
        <p className="text-sm mt-4" style={{ color: "var(--text-secondary)" }}>
          {crumbs.join(" → ")} · {filtered.length.toLocaleString("ru-RU")} анкет
        </p>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Нет анкет для этого сочетания фильтров.
          </p>
        </Card>
      ) : (
        <StatsSections stats={stats} showFilialDistribution={selFilial === ALL} />
      )}
    </div>
  );
}
