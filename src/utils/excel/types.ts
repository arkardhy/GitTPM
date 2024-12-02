export interface ExcelOptions {
  filename: string;
  sheetName?: string;
  dateFormat?: string;
  timeFormat?: string;
}

export interface ExcelFormatter<T> {
  format: (data: T) => Record<string, string | number | boolean | null>;
}

export type ExcelValue = string | number | boolean | null | undefined;

export interface WageExportData {
  employee: {
    id: string;
    name: string;
    position: string;
  };
  monthlyHours: number;
  wageBreakdown: {
    baseWage: number;
    performanceBonus: number;
    fixedBonus: number;
    totalWage: number;
  };
  isFixedSalary: boolean;
  isWithdrawn: boolean;
}