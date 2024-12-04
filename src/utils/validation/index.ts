import { isUUID } from '../uuid';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateEmployeeId(id: unknown): asserts id is string {
  if (!id || typeof id !== 'string' || !isUUID(id)) {
    throw new ValidationError('Invalid employee ID');
  }
}

export function validateEmployeeData(data: unknown): void {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Invalid employee data');
  }

  const { name, position } = data as any;

  if (!name || typeof name !== 'string') {
    throw new ValidationError('Employee name is required');
  }

  if (!position || typeof position !== 'string') {
    throw new ValidationError('Employee position is required');
  }
}

export function validateDateString(date: string): void {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    throw new ValidationError('Invalid date format. Use YYYY-MM-DD');
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new ValidationError('Invalid date');
  }
}

export function validateTimeString(time: string): void {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
  if (!timeRegex.test(time)) {
    throw new ValidationError('Invalid time format. Use HH:mm or HH:mm:ss');
  }
}

export function validateWorkingHoursData(data: { date?: unknown; checkIn?: unknown; checkOut?: unknown }): void {
  if (data.date && typeof data.date !== 'string') {
    throw new ValidationError('Invalid date format');
  }

  if (data.checkIn && typeof data.checkIn !== 'string') {
    throw new ValidationError('Invalid check-in time format');
  }

  if (data.checkOut && typeof data.checkOut !== 'string') {
    throw new ValidationError('Invalid check-out time format');
  }

  if (data.date) {
    validateDateString(data.date);
  }

  if (data.checkIn) {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$|^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
    if (!isoDateRegex.test(data.checkIn)) {
      throw new ValidationError('Check-in time must be in ISO format');
    }
  }

  if (data.checkOut) {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$|^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
    if (!isoDateRegex.test(data.checkOut)) {
      throw new ValidationError('Check-out time must be in ISO format');
    }
  }

  if (data.checkIn && data.checkOut) {
    const checkInTime = new Date(data.checkIn).getTime();
    const checkOutTime = new Date(data.checkOut).getTime();
    
    if (checkInTime >= checkOutTime) {
      throw new ValidationError('Check-out time must be after check-in time');
    }
  }
}