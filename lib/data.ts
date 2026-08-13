import { cache } from "react";
import Papa from "papaparse";
import { RAW_COLUMNS, type Respondent } from "./types";
import { parseBranch } from "./parseBranch";
import { parseNumber } from "./parseNumber";
import { parseRiskTags } from "./riskTags";

// Public "anyone with the link can view" Google Sheet. Overridable via env so
// the same code works against a different sheet/tab without a code change.
const SHEET_ID =
  process.env.GOOGLE_SHEET_ID ?? "1C_SW2OU0BIVNVpR46L1RmVTBqrsZHRFwHS_wp4IDzwM";
const SHEET_TAB = process.env.GOOGLE_SHEET_TAB ?? "ANSWERS";

// How often the server re-fetches the sheet, in seconds. The site never talks
// to Google from the browser — only this server-side fetch does, so the raw
// CSV (which includes email addresses) never reaches the client.
const REVALIDATE_SECONDS = 300;

function sheetCsvUrl(): string {
  const base = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq`;
  const params = new URLSearchParams({ tqx: "out:csv", sheet: SHEET_TAB });
  return `${base}?${params.toString()}`;
}

function toRespondent(cols: string[]): Respondent | null {
  const row: Record<string, string> = {};
  RAW_COLUMNS.forEach((key, i) => {
    row[key] = (cols[i] ?? "").trim();
  });

  // Skip blank/template rows (no branch recorded means no real submission).
  if (!row.branchRaw) return null;

  const { filial, filialOrder, unit } = parseBranch(row.branchRaw);

  // Sheet timestamps look like "06.08.2026 17:11:15" (DD.MM.YYYY HH:mm:ss).
  let timestamp: string | null = null;
  const tsMatch = row.timestamp.match(
    /(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/
  );
  if (tsMatch) {
    const [, d, m, y, h, min, s] = tsMatch;
    timestamp = new Date(
      Number(y),
      Number(m) - 1,
      Number(d),
      Number(h),
      Number(min),
      Number(s)
    ).toISOString();
  }

  return {
    timestamp,
    filial,
    filialOrder,
    unit,
    department: row.department || "Не указано",
    gender: row.gender,
    age: parseNumber(row.age),
    tenure: parseNumber(row.tenure),
    workType: row.workType,
    height: parseNumber(row.height),
    weight: parseNumber(row.weight),
    smoking: row.smoking,
    processedFood: row.processedFood,
    addsSalt: row.addsSalt,
    sedentaryHours: row.sedentaryHours,
    physicalActivity: row.physicalActivity,
    knowsCholesterol: row.knowsCholesterol,
    knowsSugar: row.knowsSugar,
    familyHistory: row.familyHistory,
    diagnosis: row.diagnosis,
    chestDiscomfort: row.chestDiscomfort,
    palpitations: row.palpitations,
    sleepQuality: parseNumber(row.sleepQuality),
    daytimeSleepiness: row.daytimeSleepiness,
    stressFrequent: row.stressFrequent,
    knowsBP: row.knowsBP,
    bpCrises: row.bpCrises,
    bpMeds: row.bpMeds,
    bmi: parseNumber(row.bmi),
    bmiCategory: row.bmiCategory,
    score: parseNumber(row.score),
    status: row.status || "Не рассчитан",
    riskTags: parseRiskTags(row.risks),
  };
}

/**
 * Fetches and parses the survey sheet. Server-only: never call from a Client
 * Component. Cached per-request via React.cache and revalidated on the
 * interval above via Next's fetch cache.
 */
export const getRespondents = cache(async (): Promise<Respondent[]> => {
  const res = await fetch(sheetCsvUrl(), {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    throw new Error(
      `Не удалось загрузить таблицу (${res.status} ${res.statusText})`
    );
  }
  const csvText = await res.text();

  const parsed = Papa.parse<string[]>(csvText, {
    skipEmptyLines: true,
  });
  if (parsed.errors.length > 0) {
    // Papa tolerates most quirks; only surface hard failures.
    const fatal = parsed.errors.filter((e) => e.type !== "FieldMismatch");
    if (fatal.length > 0) {
      throw new Error(`Ошибка разбора CSV: ${fatal[0].message}`);
    }
  }

  const rows = parsed.data.slice(1); // drop header row
  const respondents: Respondent[] = [];
  for (const cols of rows) {
    const r = toRespondent(cols);
    if (r) respondents.push(r);
  }
  return respondents;
});

