import { format } from 'date-fns';

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yy');
}

export function formatTime(date: string | Date): string {
  return format(new Date(date), 'HH:mm');
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yy HH:mm');
}

export function formatDateTimeWithSeconds(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yy HH:mm:ss');
}

export function formatMonthYear(date: string | Date): string {
  return format(new Date(date), 'MM/yy');
}

export function formatDayMonthYear(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yyyy');
}

export function formatDateForInput(date: string | Date): string {
  return format(new Date(date), 'yyyy-MM-dd');
}

export function formatTimeForInput(date: string | Date): string {
  return format(new Date(date), 'HH:mm');
}

export function parseDate(dateStr: string): string {
  // Input date is in yyyy-MM-dd format from the date input
  return dateStr;
}

export function parseTime(date: string, timeStr: string): Date {
  // Combine date and time strings
  const dateTime = new Date(`${date}T${timeStr}`);
  return dateTime;
}

export function formatDuration(hours: number): string {
  const totalMinutes = Math.floor(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
}