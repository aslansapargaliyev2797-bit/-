/** Pulls the first number out of a free-text cell ("30,4" / "7 лет" / "32"). */
export function parseNumber(raw: string | undefined | null): number | null {
  if (!raw) return null;
  const normalized = raw.replace(",", ".");
  const match = normalized.match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const n = parseFloat(match[0]);
  return Number.isFinite(n) ? n : null;
}
