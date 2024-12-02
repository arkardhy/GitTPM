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

function calculateHourlyWage(position: string, hours: number): number {
  const rate = HOURLY_RATES[position as keyof typeof HOURLY_RATES] || HOURLY_RATES.default;
  const baseWage = rate * hours;
  
  // Calculate overtime bonus for eligible positions
  let bonus = 0;
  if (hours > BONUS_CONFIG.OVERTIME_THRESHOLD) {
    if (['Karyawan', 'Training', 'Staff Ahli'].includes(position)) {
      bonus += BONUS_CONFIG.OVERTIME_BONUS;
    }
  }

  // Add fixed bonus for Staff Ahli
  if (position === 'Staff Ahli') {
    bonus += BONUS_CONFIG.STAFF_AHLI_FIXED_BONUS;
  }

  return baseWage + bonus;
}

export function calculateWage(position: string, hours: number): number {
  // Check if position has a fixed salary
  if (position in FIXED_SALARIES) {
    return FIXED_SALARIES[position as keyof typeof FIXED_SALARIES];
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