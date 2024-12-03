import { isUUID } from '../utils/uuid';

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

  // Validate date format if provided
  if (data.date) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.date)) {
      throw new ValidationError('Date must be in YYYY-MM-DD format');
    }
  }

  // Validate ISO datetime format for check-in/out if provided
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$|^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
  
  if (data.checkIn && !isoDateRegex.test(data.checkIn)) {
    throw new ValidationError('Check-in time must be in ISO format');
  }
  
  if (data.checkOut && !isoDateRegex.test(data.checkOut)) {
    throw new ValidationError('Check-out time must be in ISO format');
  }

  // Validate chronological order if both times are provided
  if (data.checkIn && data.checkOut) {
    const checkInTime = new Date(data.checkIn).getTime();
    const checkOutTime = new Date(data.checkOut).getTime();
    
    if (checkInTime >= checkOutTime) {
      throw new ValidationError('Check-out time must be after check-in time');
    }
  }
}