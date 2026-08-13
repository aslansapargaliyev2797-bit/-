export function StatTile({
  label,
  value,
  caption,
  tone = "default",
}: {
  label: string;
  value: string;
  caption?: string;
  tone?: "default" | "good" | "warning" | "critical";
}) {
  const toneColor =
    tone === "good"
      ? "var(--status-good)"
      : tone === "warning"
        ? "var(--status-warning)"
        : tone === "critical"
          ? "var(--status-critical)"
          : "var(--text-primary)";

  return (
    <div
      className="rounded-xl border p-4 flex flex-col gap-1 min-w-0"
      style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}
    >
      <span
        className="text-xs"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </span>
      <span
        className="text-2xl font-semibold truncate"
        style={{ color: toneColor }}
      >
        {value}
      </span>
      {caption && (
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {caption}
        </span>
      )}
    </div>
  );
}
