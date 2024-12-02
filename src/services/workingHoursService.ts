import { supabase } from '../lib/supabase';
import { validateEmployeeId, validateWorkingHoursData } from './validation';
import type { WorkingHours } from '../types';

export const workingHoursService = {
  async getByEmployeeId(employeeId: string): Promise<WorkingHours[]> {
    validateEmployeeId(employeeId);

    const { data, error } = await supabase
      .from('working_hours')
      .select('id, date, check_in, check_out, total_hours')
      .eq('employee_id', employeeId)
      .order('date', { ascending: false });

    if (error) throw error;
    return (data || []).map(transformWorkingHoursData);
  },

  async checkIn(employeeId: string, date: string, checkIn: string): Promise<WorkingHours> {
    validateEmployeeId(employeeId);
    validateWorkingHoursData({ date, checkIn });

    // Check if there's already an active check-in
    const { data: existing } = await supabase
      .from('working_hours')
      .select('*')
      .eq('employee_id', employeeId)
      .is('check_out', null)
      .single();

    if (existing) {
      throw new Error('Employee already has an active check-in');
    }

    const { data, error } = await supabase
      .from('working_hours')
      .insert({
        employee_id: employeeId,
        date,
        check_in: checkIn,
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create working hours record');

    return transformWorkingHoursData(data);
  },

  async checkOut(id: string, checkOut: string, totalHours: number): Promise<WorkingHours> {
    if (!id) throw new Error('Working hours ID is required');

    // Validate the working hours record exists and hasn't been checked out
    const { data: existing } = await supabase
      .from('working_hours')
      .select('*')
      .eq('id', id)
      .is('check_out', null)
      .single();

    if (!existing) {
      throw new Error('No active check-in found');
    }

    const { data, error } = await supabase
      .from('working_hours')
      .update({
        check_out: checkOut,
        total_hours: totalHours,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to update working hours record');

    return transformWorkingHoursData(data);
  },

  async updateTimeEntry(id: string, updates: Partial<WorkingHours>): Promise<WorkingHours> {
    if (!id) throw new Error('Working hours ID is required');

    const { data, error } = await supabase
      .from('working_hours')
      .update({
        check_in: updates.checkIn,
        check_out: updates.checkOut,
        total_hours: updates.totalHours,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to update working hours record');

    return transformWorkingHoursData(data);
  },
};

function transformWorkingHoursData(data: any): WorkingHours {
  if (!data?.id || !data?.date || !data?.check_in) {
    throw new Error('Invalid working hours data');
  }

  return {
    id: data.id,
    date: data.date,
    checkIn: data.check_in,
    checkOut: data.check_out,
    totalHours: data.total_hours || 0,
  };
}