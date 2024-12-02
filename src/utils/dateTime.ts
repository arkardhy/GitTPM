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