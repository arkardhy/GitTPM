const FIXED_SALARIES = {
  'Komisaris Utama': 2500000,
  'Sekretaris': 2000000,
  'Sumber Daya Manusia': 2000000,
  'Pemasaran': 2000000,
  'Bendahara': 2000000,
  'Eksekutif': 1500000,
} as const;

const HOURLY_RATES = {
  'Karyawan': 9000,
  'Training': 8000,
  'Staff Ahli': 10000,
  // Default rate for other positions
  default: 0
} as const;

const BONUS_CONFIG = {
  OVERTIME_THRESHOLD: 60, // hours
  OVERTIME_BONUS: 350000,
  STAFF_AHLI_FIXED_BONUS: 500000,
} as const;

export interface WageBreakdown {
  baseWage: number;
  performanceBonus: number;
  fixedBonus: number;
  totalWage: number;
}

function calculateHourlyWage(position: string, hours: number): WageBreakdown {
  const rate = HOURLY_RATES[position as keyof typeof HOURLY_RATES] || HOURLY_RATES.default;
  const baseWage = rate * hours;
  
  // Calculate overtime bonus for eligible positions
  let performanceBonus = 0;
  if (hours > BONUS_CONFIG.OVERTIME_THRESHOLD) {
    if (['Karyawan', 'Training', 'Staff Ahli'].includes(position)) {
      performanceBonus = BONUS_CONFIG.OVERTIME_BONUS;
    }
  }

  // Add fixed bonus for Staff Ahli
  const fixedBonus = position === 'Staff Ahli' ? BONUS_CONFIG.STAFF_AHLI_FIXED_BONUS : 0;

  return {
    baseWage,
    performanceBonus,
    fixedBonus,
    totalWage: baseWage + performanceBonus + fixedBonus
  };
}

export function calculateWage(position: string, hours: number): WageBreakdown {
  // Check if position has a fixed salary
  if (position in FIXED_SALARIES) {
    const fixedSalary = FIXED_SALARIES[position as keyof typeof FIXED_SALARIES];
    return {
      baseWage: fixedSalary,
      performanceBonus: 0,
      fixedBonus: 0,
      totalWage: fixedSalary
    };
  }
  
  // Calculate wage with bonuses for hourly positions
  return calculateHourlyWage(position, hours);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}