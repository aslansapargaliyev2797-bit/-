import type { Bucket } from "@/lib/stats-types";

export function BarList({
  data,
  valueLabel = "pct",
  color = "var(--series-1)",
  colorFor,
  maxItems,
}: {
  data: Bucket[];
  valueLabel?: "pct" | "count";
  color?: string;
  colorFor?: (label: string) => string;
  maxItems?: number;
}) {
  const items = maxItems ? data.slice(0, maxItems) : data;
  const max = Math.max(...items.map((d) => d.pct), 1);

  if (items.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Нет данных
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((d) => {
        const widthPct = Math.max((d.pct / max) * 100, 2);
        const barColor = colorFor ? colorFor(d.label) : color;
        return (
          <div key={d.label} className="min-w-0">
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <span
                className="text-sm truncate"
                style={{ color: "var(--text-secondary)" }}
                title={d.label}
              >
                {d.label}
              </span>
              <span
                className="text-sm font-medium tabular-nums shrink-0"
                style={{ color: "var(--text-primary)" }}
              >
                {valueLabel === "pct"
                  ? `${d.pct.toFixed(1)}%`
                  : d.count.toLocaleString("ru-RU")}
              </span>
            </div>
            <div
              className="h-[10px] rounded-full overflow-hidden"
              style={{ background: "var(--gridline)" }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${widthPct}%`, background: barColor }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
