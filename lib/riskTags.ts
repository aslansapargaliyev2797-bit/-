/**
 * The "risks" cell holds a bullet list, one risk factor per line, each line
 * starting with "•" (e.g. "• Курение\n• Избыточный вес / ожирение"). We only
 * need the short tag, not the "recs" narrative — that column is not parsed.
 */
export function parseRiskTags(raw: string | undefined | null): string[] {
  if (!raw) return [];
  return raw
    .split("•")
    .map((s) => s.trim())
    .filter(Boolean);
}
