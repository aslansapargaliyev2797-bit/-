export interface Bucket {
  label: string;
  count: number;
  pct: number; // 0..100, relative to the group's total
}

export interface BooleanRate {
  yes: number;
  no: number;
  total: number;
  yesPct: number;
}

export interface Stats {
  count: number;
  lastUpdated: string | null; // ISO date string (Date isn't serializable as-is)

  // 1. Ключевые показатели
  gender: Bucket[];
  avgAge: number | null;
  avgTenure: number | null;
  avgBmi: number | null;
  avgScore: number | null;

  // 2. Распределение по филиалам (only meaningful for the whole-company view)
  filialDistribution: Bucket[];

  // 3. Тип занятости
  workType: Bucket[];

  // 4. Возрастные группы
  ageGroups: Bucket[];

  // 5. Стаж работы
  tenureGroups: Bucket[];

  // 6. Уровень риска ССЗ
  riskLevel: Bucket[];

  // 7. ИМТ
  bmiCategory: Bucket[];

  // 8. Курение
  smoking: Bucket[];

  // 9. Питание
  processedFood: Bucket[];
  addsSalt: BooleanRate;

  // 10. Физическая активность
  sedentary: Bucket[];
  physicalActivity: BooleanRate;

  // 11. Осведомлённость о показателях
  cholesterolAwareness: Bucket[];
  sugarAwareness: Bucket[];
  bpAwareness: Bucket[];

  // 12. Кризы и приём препаратов
  bpCrises: Bucket[];
  bpMeds: Bucket[];

  // 13. Семейный анамнез и диагнозы
  diagnosis: BooleanRate;
  familyHistory: BooleanRate;

  // 14. Симптомы и жалобы
  symptoms: { label: string; rate: BooleanRate }[];

  // 15. Качество сна
  sleepQuality: Bucket[];
  avgSleepQuality: number | null;

  // 16. Основные факторы риска
  riskFactors: Bucket[];
  noRiskFactorsPct: number;
}
