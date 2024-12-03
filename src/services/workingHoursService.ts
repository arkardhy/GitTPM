import {
  checkIn as apiCheckIn,
  checkOut as apiCheckOut,
  updateTimeEntry as apiUpdateTimeEntry,
  deleteTimeEntry as apiDeleteTimeEntry,
  create as apiCreate
} from '../lib/api/workingHoursApi';
import { validateEmployeeId, validateWorkingHoursData } from './validation';
import type { WorkingHours } from '../types';

function splitTimeEntryAcrossMonths(entry: Partial<WorkingHours>): Partial<WorkingHours>[] {
  if (!entry.checkIn || !entry.checkOut) {
    return [entry];
  }

  const checkIn = new Date(entry.checkIn);
  const checkOut = new Date(entry.checkOut);
  
  // If both dates are in the same month, return single entry
  if (checkIn.getMonth() === checkOut.getMonth() && 
      checkIn.getFullYear() === checkOut.getFullYear()) {
    return [entry];
  }

  // Create entry for the first month
  const endOfFirstMonth = new Date(checkIn.getFullYear(), checkIn.getMonth() + 1, 0, 23, 59, 59, 999);
  const firstMonthHours = (endOfFirstMonth.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

  // Create entry for the second month
  const startOfSecondMonth = new Date(checkOut.getFullYear(), checkOut.getMonth(), 1, 0, 0, 0, 0);
  const secondMonthHours = (checkOut.getTime() - startOfSecondMonth.getTime()) / (1000 * 60 * 60);

  return [
    {
      date: checkIn.toISOString().split('T')[0],
      checkIn: checkIn.toISOString(),
      checkOut: endOfFirstMonth.toISOString(),
      totalHours: firstMonthHours,
    },
    {
      date: startOfSecondMonth.toISOString().split('T')[0],
      checkIn: startOfSecondMonth.toISOString(),
      checkOut: checkOut.toISOString(),
      totalHours: secondMonthHours,
    },
  ];
}

export const workingHoursService = {
  async create(employeeId: string, data: Partial<WorkingHours>): Promise<WorkingHours[]> {
    validateEmployeeId(employeeId);
    validateWorkingHoursData({
      date: data.date,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
    });

    const entries = splitTimeEntryAcrossMonths(data);
    return apiCreate(employeeId, entries);
  },

  async checkIn(employeeId: string, date: string, checkIn: string): Promise<WorkingHours> {
    validateEmployeeId(employeeId);
    validateWorkingHoursData({ date, checkIn });
    return apiCheckIn(employeeId, date, checkIn);
  },

  async checkOut(id: string, checkOut: string, totalHours: number): Promise<WorkingHours> {
    if (!id) throw new Error('Working hours ID is required');
    return apiCheckOut(id, checkOut, totalHours);
  },

  async updateTimeEntry(id: string, updates: Partial<WorkingHours>): Promise<WorkingHours> {
    if (!id) throw new Error('Working hours ID is required');
    
    if (updates.checkIn && updates.checkOut) {
      const checkInTime = new Date(updates.checkIn).getTime();
      const checkOutTime = new Date(updates.checkOut).getTime();
      
      if (checkInTime >= checkOutTime) {
        throw new Error('Check-out time must be after check-in time');
      }
      
      updates.totalHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
    }

    return apiUpdateTimeEntry(id, updates);
  },

  async delete(id: string): Promise<void> {
    if (!id) throw new Error('Working hours ID is required');
    return apiDeleteTimeEntry(id);
  },
};