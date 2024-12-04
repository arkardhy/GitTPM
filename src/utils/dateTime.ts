import { format, parse, formatInTimeZone, zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { getTimezoneOffset } from 'date-fns';

const TIMEZONE = import.meta.env.VITE_TIMEZONE || 'UTC';

export function formatDate(date: string | Date): string {
  const zonedDate = utcToZonedTime(new Date(date), TIMEZONE);
  return formatInTimeZone(zonedDate, TIMEZONE, 'dd/MM/yy');
}

export function formatTime(date: string | Date): string {
  const zonedDate = utcToZonedTime(new Date(date), TIMEZONE);
  return formatInTimeZone(zonedDate, TIMEZONE, 'HH:mm');
}

export function formatDateTime(date: string | Date): string {
  const zonedDate = utcToZonedTime(new Date(date), TIMEZONE);
  return formatInTimeZone(zonedDate, TIMEZONE, 'dd/MM/yy HH:mm');
}

export function formatDateTimeWithSeconds(date: string | Date): string {
  const zonedDate = utcToZonedTime(new Date(date), TIMEZONE);
  return formatInTimeZone(zonedDate, TIMEZONE, 'dd/MM/yy HH:mm:ss');
}

export function formatMonthYear(date: string | Date): string {
  const zonedDate = utcToZonedTime(new Date(date), TIMEZONE);
  return formatInTimeZone(zonedDate, TIMEZONE, 'MM/yy');
}

export function formatDayMonthYear(date: string | Date): string {
  const zonedDate = utcToZonedTime(new Date(date), TIMEZONE);
  return formatInTimeZone(zonedDate, TIMEZONE, 'dd/MM/yyyy');
}

export function formatDateForInput(date: string | Date): string {
  const zonedDate = utcToZonedTime(new Date(date), TIMEZONE);
  return formatInTimeZone(zonedDate, TIMEZONE, 'yyyy-MM-dd');
}

export function formatTimeForInput(date: string | Date): string {
  const zonedDate = utcToZonedTime(new Date(date), TIMEZONE);
  return formatInTimeZone(zonedDate, TIMEZONE, 'HH:mm');
}

export function parseDateTime(date: string, time: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  
  if (
    isNaN(year) || isNaN(month) || isNaN(day) ||
    isNaN(hours) || isNaN(minutes) ||
    month < 1 || month > 12 ||
    day < 1 || day > 31 ||
    hours < 0 || hours > 23 ||
    minutes < 0 || minutes > 59
  ) {
    throw new Error('Invalid date or time format');
  }
  
  const localDate = new Date(year, month - 1, day, hours, minutes);
  return zonedTimeToUtc(localDate, TIMEZONE);
}

export function formatFullDateTime(date: string | Date): string {
  const zonedDate = utcToZonedTime(new Date(date), TIMEZONE);
  return formatInTimeZone(zonedDate, TIMEZONE, 'dd/MM/yyyy HH:mm:ss');
}

export function toUTC(date: Date): Date {
  return zonedTimeToUtc(date, TIMEZONE);
}

export function fromUTC(date: Date): Date {
  return utcToZonedTime(date, TIMEZONE);
}