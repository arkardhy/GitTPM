import { format, parse } from 'date-fns';

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

export function parseDateTime(date: string, time: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  
  const result = new Date(year, month - 1, day, hours, minutes);
  if (isNaN(result.getTime())) {
    throw new Error('Invalid date or time format');
  }
  
  return result;
}

export function formatFullDateTime(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yyyy HH:mm:ss');
}