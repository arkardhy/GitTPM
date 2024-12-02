const HOURLY_RATES = {
  Karyawan: 9000,
  Training: 8000,
  Eksekutif: 10000,
  // Default rate for other positions
  default: 0
} as const;

const FIXED_SALARIES = {
  'Komisaris Utama': 2500000,
  'Sumber Daya Manusia': 2000000,
  'Bendahara': 2000000,
  'Pemasaran': 2000000,
  'Sekretaris': 2000000,
} as const;

const BONUS_THRESHOLD = 60; // hours
const BONUS_AMOUNT = 350000; // IDR

export function calculateWage(position: string, additionalPositions: string[] = [], hours: number): { base: number; bonus: number; total: number } {
  // Check if position has a fixed salary
  if (position in FIXED_SALARIES) {
    const base = FIXED_SALARIES[position as keyof typeof FIXED_SALARIES];
    return {
      base,
      bonus: 0, // Fixed salary positions don't get bonus
      total: base
    };
  }

  // For Staff Ahli with additional positions
  if (position === 'Staff Ahli' && additionalPositions.length > 0) {
    let totalBase = 0;
    let totalBonus = 0;

    // Calculate wage for each additional position
    additionalPositions.forEach(pos => {
      const rate = HOURLY_RATES[pos as keyof typeof HOURLY_RATES] || HOURLY_RATES.default;
      const positionBase = rate * hours;
      
      // Apply bonus if eligible
      const positionBonus = (pos === 'Training' || pos === 'Karyawan') && hours >= BONUS_THRESHOLD
        ? BONUS_AMOUNT
        : 0;

      totalBase += positionBase;
      totalBonus += positionBonus;
    });

    return {
      base: totalBase,
      bonus: totalBonus,
      total: totalBase + totalBonus
    };
  }

  // For regular hourly-based positions
  const rate = HOURLY_RATES[position as keyof typeof HOURLY_RATES] || HOURLY_RATES.default;
  const base = rate * hours;
  
  // Only Training and Karyawan positions are eligible for bonus
  const bonus = (position === 'Training' || position === 'Karyawan') && hours >= BONUS_THRESHOLD
    ? BONUS_AMOUNT
    : 0;

  return {
    base,
    bonus,
    total: base + bonus
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}