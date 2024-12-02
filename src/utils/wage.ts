const HOURLY_RATES = {
  Karyawan: 9000,
  Training: 8000,
  Eksekutif: 10000,
  // Default rate for other positions
  default: 0
} as const;

export function calculateWage(position: string, hours: number): number {
  const rate = HOURLY_RATES[position as keyof typeof HOURLY_RATES] || HOURLY_RATES.default;
  return rate * hours;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}