import {
  checkIn as apiCheckIn,
  checkOut as apiCheckOut,
  updateTimeEntry as apiUpdateTimeEntry,
  deleteTimeEntry as apiDeleteTimeEntry
} from '../lib/api/workingHoursApi';
import { validateEmployeeId, validateWorkingHoursData } from './validation';
import type { WorkingHours } from '../types';

export const workingHoursService = {
  async create(employeeId: string, data: Partial<WorkingHours>): Promise<WorkingHours> {
    validateEmployeeId(employeeId);
    validateWorkingHoursData({
      date: data.date,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
    });

    // Calculate total hours if both check-in and check-out are provided
    let totalHours = 0;
    if (data.checkIn && data.checkOut) {
      const checkInTime = new Date(data.checkIn).getTime();
      const checkOutTime = new Date(data.checkOut).getTime();
      totalHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
    }

    return apiCheckIn(employeeId, data.date!, data.checkIn!);
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

    // Calculate total hours if both check-in and check-out are provided
    if (updates.checkIn && updates.checkOut) {
      const checkInTime = new Date(updates.checkIn).getTime();
      const checkOutTime = new Date(updates.checkOut).getTime();
      updates.totalHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
    }

    return apiUpdateTimeEntry(id, updates);
  },

  async delete(id: string): Promise<void> {
    if (!id) throw new Error('Working hours ID is required');
    return apiDeleteTimeEntry(id);
  },
};