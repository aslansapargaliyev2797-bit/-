import type { BooleanRate } from "@/lib/stats-types";

export function RateMeter({
  label,
  rate,
}: {
  label: string;
  rate: BooleanRate;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {label}
        </span>
        <span
          className="text-sm font-medium tabular-nums"
          style={{ color: "var(--text-primary)" }}
        >
          {rate.yesPct.toFixed(1)}%{" "}
          <span style={{ color: "var(--text-muted)" }}>
            ({rate.yes.toLocaleString("ru-RU")} из{" "}
            {rate.total.toLocaleString("ru-RU")})
          </span>
        </span>
      </div>
      <div
        className="h-[10px] rounded-full overflow-hidden"
        style={{ background: "var(--gridline)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(rate.yesPct, rate.yes > 0 ? 2 : 0)}%`,
            background: "var(--series-1)",
          }}
        />
      </div>
    </div>
  );
}
