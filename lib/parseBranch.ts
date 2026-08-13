/**
 * The sheet encodes branch + sub-unit in one free-text field, always in the same
 * order: "<NN>. <Филиал> [ЛПУ <Name> | АУП]". Examples seen in the data:
 *
 *   "03. УМГ Атырау ЛПУ Индер"   -> филиал "03. УМГ Атырау",      единица "ЛПУ Индер"
 *   "09. УМГ Костанай АУП"       -> филиал "09. УМГ Костанай",    единица "АУП"
 *   "01. Центральный аппарат"    -> филиал "01. Центральный аппарат", единица null
 *   "12. ИТЦ"                    -> филиал "12. ИТЦ",             единица null
 *
 * This mirrors how the sheet's own "Статистика" tab aggregates филиалы (section 2
 * there lists the "NN. Name" prefix only, ЛПУ/АУП stripped).
 */
export interface ParsedBranch {
  filial: string;
  filialOrder: number;
  unit: string | null;
}

const LPU_MARKER = /\s+ЛПУ\s+/u;
const AUP_SUFFIX = /\s+АУП$/u;
const LEADING_NUMBER = /^(\d+)\./;

export function parseBranch(raw: string): ParsedBranch {
  const s = (raw ?? "").trim();
  let filial = s;
  let unit: string | null = null;

  const lpuMatch = s.match(LPU_MARKER);
  if (lpuMatch && lpuMatch.index !== undefined) {
    filial = s.slice(0, lpuMatch.index).trim();
    unit = s.slice(lpuMatch.index).trim(); // "ЛПУ <Name>"
  } else if (AUP_SUFFIX.test(s)) {
    filial = s.replace(AUP_SUFFIX, "").trim();
    unit = "АУП";
  }

  const numMatch = filial.match(LEADING_NUMBER);
  const filialOrder = numMatch ? parseInt(numMatch[1], 10) : 999;

  return { filial, filialOrder, unit };
}
