// Column layout of the "ANSWERS" sheet (35 columns). Kept as a single source of
// truth so the CSV parser and the aggregation layer agree on field names.

export interface RawAnswerRow {
  id: string;
  timestamp: string;
  email: string;
  branchRaw: string; // e.g. "03. УМГ Атырау ЛПУ Индер" — branch + optional sub-unit
  department: string; // e.g. "ЛЭС", "ГРС", "ЭХЗ", "АУП/офисные службы"
  gender: string;
  age: string;
  tenure: string;
  workType: string;
  height: string;
  weight: string;
  smoking: string;
  processedFood: string;
  addsSalt: string;
  sedentaryHours: string;
  physicalActivity: string;
  knowsCholesterol: string;
  knowsSugar: string;
  familyHistory: string;
  diagnosis: string;
  chestDiscomfort: string;
  palpitations: string;
  sleepQuality: string;
  daytimeSleepiness: string;
  stressFrequent: string;
  knowsBP: string;
  bpCrises: string;
  bpMeds: string;
  bmi: string;
  bmiCategory: string;
  score: string;
  status: string;
  risks: string;
  recs: string;
  screening: string;
}

// The 35 columns in the exact order they appear in the sheet.
export const RAW_COLUMNS: (keyof RawAnswerRow)[] = [
  "id",
  "timestamp",
  "email",
  "branchRaw",
  "department",
  "gender",
  "age",
  "tenure",
  "workType",
  "height",
  "weight",
  "smoking",
  "processedFood",
  "addsSalt",
  "sedentaryHours",
  "physicalActivity",
  "knowsCholesterol",
  "knowsSugar",
  "familyHistory",
  "diagnosis",
  "chestDiscomfort",
  "palpitations",
  "sleepQuality",
  "daytimeSleepiness",
  "stressFrequent",
  "knowsBP",
  "bpCrises",
  "bpMeds",
  "bmi",
  "bmiCategory",
  "score",
  "status",
  "risks",
  "recs",
  "screening",
];

/** A parsed, analysis-ready respondent record. No PII (no id/email/recs text). */
export interface Respondent {
  timestamp: Date | null;
  filial: string; // "03. УМГ Атырау"
  filialOrder: number; // leading number, for stable sort ("01." -> 1)
  unit: string | null; // "ЛПУ Индер" | "АУП" | null
  department: string; // служба: ЛЭС / ГРС / ЭХЗ / АУП/офисные службы / ...
  gender: string;
  age: number | null;
  tenure: number | null;
  workType: string;
  height: number | null;
  weight: number | null;
  smoking: string;
  processedFood: string;
  addsSalt: string;
  sedentaryHours: string;
  physicalActivity: string;
  knowsCholesterol: string;
  knowsSugar: string;
  familyHistory: string;
  diagnosis: string;
  chestDiscomfort: string;
  palpitations: string;
  sleepQuality: number | null;
  daytimeSleepiness: string;
  stressFrequent: string;
  knowsBP: string;
  bpCrises: string;
  bpMeds: string;
  bmi: number | null;
  bmiCategory: string;
  score: number | null;
  status: string; // "Низкий риск" | "Умеренный риск" | "Высокий риск" | ...
  riskTags: string[]; // parsed from the "risks" bullet list
}
