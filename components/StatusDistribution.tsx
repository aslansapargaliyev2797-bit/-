import type { Bucket } from "@/lib/stats-types";

const STATUS_COLOR: Record<string, string> = {
  "Низкий риск": "var(--status-good)",
  "Умеренный риск": "var(--status-warning)",
  "Высокий риск": "var(--status-critical)",
};

const STATUS_ICON: Record<string, string> = {
  "Низкий риск": "●",
  "Умеренный риск": "▲",
  "Высокий риск": "■",
};

/** Stacked bar + legend for risk-level buckets. Color never carries meaning alone. */
export function StatusDistribution({ data }: { data: Bucket[] }) {
  if (data.length === 0 || data.every((d) => d.count === 0)) {
    return (
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Нет данных
      </p>
    );
  }

  return (
    <div>
      <div
        className="flex h-4 rounded-full overflow-hidden"
        style={{ background: "var(--gridline)" }}
      >
        {data.map((d, i) => (
          <div
            key={d.label}
            style={{
              width: `${Math.max(d.pct, d.count > 0 ? 1 : 0)}%`,
              background: STATUS_COLOR[d.label] ?? "var(--series-1)",
              marginLeft: i > 0 ? 2 : 0,
            }}
            title={`${d.label}: ${d.pct.toFixed(1)}%`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-1.5 text-sm">
            <span
              style={{ color: STATUS_COLOR[d.label] ?? "var(--series-1)" }}
              aria-hidden
            >
              {STATUS_ICON[d.label] ?? "●"}
            </span>
            <span style={{ color: "var(--text-secondary)" }}>{d.label}</span>
            <span
              className="font-medium tabular-nums"
              style={{ color: "var(--text-primary)" }}
            >
              {d.pct.toFixed(1)}% · {d.count.toLocaleString("ru-RU")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
