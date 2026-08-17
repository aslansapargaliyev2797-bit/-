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

// The form's "Отметка времени" is Google Forms' own timestamp, always in the
// form owner's timezone — Asia/Almaty, UTC+5 year-round (no DST). The server
// this code runs on isn't necessarily in that timezone (Vercel runs UTC), so
// the offset has to be applied explicitly rather than relying on `new Date(...)`
// to interpret the parsed components as "local".
const SHEET_TZ_OFFSET_HOURS = 5;

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
      Date.UTC(
        Number(y),
        Number(m) - 1,
        Number(d),
        Number(h) - SHEET_TZ_OFFSET_HOURS,
        Number(min),
        Number(s)
      )
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
    headers: {
      // Google's gviz export can respond differently (a consent/HTML page
      // instead of CSV) to requests that look automated — a plain
      // datacenter fetch with no UA/Accept headers is exactly that.
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "text/csv,*/*",
    },
  });
  if (!res.ok) {
    throw new Error(
      `Не удалось загрузить таблицу (${res.status} ${res.statusText})`
    );
  }
  const csvText = await res.text();

  // Google returns 200 with an HTML page instead of CSV for some blocked/
  // rate-limited requests — parsing that as CSV silently "succeeds" with
  // near-nothing usable, instead of failing loudly. Catch that here.
  const head = csvText.trimStart().slice(0, 100).toLowerCase();
  if (head.startsWith("<!doctype") || head.startsWith("<html")) {
    throw new Error(
      "Google вернул HTML вместо CSV (похоже, запрос заблокирован или ограничен) — попробуйте обновить страницу через минуту"
    );
  }

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

  // Visible in Vercel's function logs — the fastest way to tell "we got a
  // truncated response from Google" apart from "we parsed everything but
  // dropped rows ourselves" if the count ever looks wrong again.
  console.log(
    `[data] fetched ${csvText.length} bytes, ${parsed.data.length} CSV rows, ${respondents.length} valid respondents` +
      (parsed.errors.length > 0 ? `, ${parsed.errors.length} parse warnings` : "")
  );

  if (respondents.length === 0) {
    throw new Error(
      "Таблица прочитана, но не найдено ни одной анкеты — вероятно, проблема с форматом ответа"
    );
  }

  return respondents;
});

