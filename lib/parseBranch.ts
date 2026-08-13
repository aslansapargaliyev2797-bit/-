/**
 * The sheet encodes branch + sub-unit in one free-text field, always with the
 * same fixed prefix: "<NN>. УМГ <Город>", optionally followed by a structural
 * unit whose own naming is inconsistent — the form's dropdown includes many
 * shapes, not just "ЛПУ <Name>" or "АУП":
 *
 *   "03. УМГ Атырау ЛПУ Индер"        -> филиал "03. УМГ Атырау", единица "ЛПУ Индер"
 *   "03. УМГ Атырау ДКС Кашаган"      -> филиал "03. УМГ Атырау", единица "ДКС Кашаган"
 *   "03. УМГ Атырау УГЭР"             -> филиал "03. УМГ Атырау", единица "УГЭР"
 *   "03. УМГ Атырау АРУ"              -> филиал "03. УМГ Атырау", единица "АРУ"
 *   "02. УМГ Алматы Алматинское ЛПУ"  -> филиал "02. УМГ Алматы", единица "Алматинское ЛПУ"
 *   "04. УМГ Уральск РЭП Караоба"     -> филиал "04. УМГ Уральск", единица "РЭП Караоба"
 *   "09. УМГ Костанай АУП"            -> филиал "09. УМГ Костанай", единица "АУП"
 *   "01. Центральный аппарат"         -> филиал "01. Центральный аппарат", единица null
 *   "12. ИТЦ"                         -> филиал "12. ИТЦ", единица null
 *
 * So instead of matching known unit-name patterns (which the form keeps adding
 * to), we match the one thing that's always fixed — "NN. УМГ <Город>", one
 * word for the city — and treat whatever text follows it, of any shape, as the
 * unit. This mirrors how the sheet's own "Статистика" tab aggregates филиалы
 * (section 2 there lists only the "NN. УМГ Город" prefix).
 */
export interface ParsedBranch {
  filial: string;
  filialOrder: number;
  unit: string | null;
}

const UMG_PREFIX = /^(\d+\.\s*УМГ\s+\S+)/u;
const LEADING_NUMBER = /^(\d+)\./;

export function parseBranch(raw: string): ParsedBranch {
  const s = (raw ?? "").trim();

  const prefixMatch = s.match(UMG_PREFIX);
  const filial = prefixMatch ? prefixMatch[1].trim() : s;
  const rest = prefixMatch ? s.slice(prefixMatch[0].length).trim() : "";
  const unit = rest.length > 0 ? rest : null;

  const numMatch = filial.match(LEADING_NUMBER);
  const filialOrder = numMatch ? parseInt(numMatch[1], 10) : 999;

  return { filial, filialOrder, unit };
}
