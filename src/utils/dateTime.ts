import { format, parse, formatInTimeZone, zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { getTimezoneOffset } from 'date-fns';

const TIMEZONE = import.meta.env.VITE_TIMEZONE || 'Asia/Jakarta';

export function formatDate(date: string | Date): string {
  if (!date) return '';
  try {
    const zonedDate = utcToZonedTime(new Date(date), TIMEZONE);
    return formatInTimeZone(zonedDate, TIMEZONE, 'dd/MM/yy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

export function formatTime(date: string | Date): string {
  if (!date) return '';
  try {
    const zonedDate = utcToZonedTime(new Date(date), TIMEZONE);
    return formatInTimeZone(zonedDate, TIMEZONE, 'HH:mm');
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid time';
  }
}

export function formatDateTime(date: string | Date): string {
  if (!date) return '';
  try {
    const zonedDate = utcToZonedTime(new Date(date), TIMEZONE);
    return formatInTimeZone(zonedDate, TIMEZONE, 'dd/MM/yy HH:mm');
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return 'Invalid date/time';
  }
}

export function formatDateTimeWithSeconds(date: string | Date): string {
  if (!date) return '';
  try {
    const zonedDate = utcToZonedTime(new Date(date), TIMEZONE);
    return formatInTimeZone(zonedDate, TIMEZONE, 'dd/MM/yy HH:mm:ss');
  } catch (error) {
    console.error('Error formatting datetime with seconds:', error);
    return 'Invalid date/time';
  }
}

export function formatMonthYear(date: string | Date): string {
  if (!date) return '';
  try {
    const zonedDate = utcToZonedTime(new Date(date), TIMEZONE);
    return formatInTimeZone(zonedDate, TIMEZONE, 'MM/yy');
  } catch (error) {
    console.error('Error formatting month/year:', error);
    return 'Invalid date';
  }
}

export function formatDayMonthYear(date: string | Date): string {
  if (!date) return '';
  try {
    const zonedDate = utcToZonedTime(new Date(date), TIMEZONE);
    return formatInTimeZone(zonedDate, TIMEZONE, 'dd/MM/yyyy');
  } catch (error) {
    console.error('Error formatting day/month/year:', error);
    return 'Invalid date';
  }
}

export function formatDateForInput(date: string | Date): string {
  if (!date) return '';
  try {
    const zonedDate = utcToZonedTime(new Date(date), TIMEZONE);
    return formatInTimeZone(zonedDate, TIMEZONE, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
}

export function formatTimeForInput(date: string | Date): string {
  if (!date) return '';
  try {
    const zonedDate = utcToZonedTime(new Date(date), TIMEZONE);
    return formatInTimeZone(zonedDate, TIMEZONE, 'HH:mm');
  } catch (error) {
    console.error('Error formatting time for input:', error);
    return '';
  }
}

export function parseDateTime(date: string, time: string): Date {
  try {
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
  } catch (error) {
    console.error('Error parsing datetime:', error);
    throw new Error('Invalid date or time format');
  }
}

export function formatFullDateTime(date: string | Date): string {
  if (!date) return '';
  try {
    const zonedDate = utcToZonedTime(new Date(date), TIMEZONE);
    return formatInTimeZone(zonedDate, TIMEZONE, 'dd/MM/yyyy HH:mm:ss');
  } catch (error) {
    console.error('Error formatting full datetime:', error);
    return 'Invalid date/time';
  }
}

export function toUTC(date: Date): Date {
  try {
    return zonedTimeToUtc(date, TIMEZONE);
  } catch (error) {
    console.error('Error converting to UTC:', error);
    throw error;
  }
}

export function fromUTC(date: Date): Date {
  try {
    return utcToZonedTime(date, TIMEZONE);
  } catch (error) {
    console.error('Error converting from UTC:', error);
    throw error;
  }
}