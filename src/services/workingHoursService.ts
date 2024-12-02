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

    if (error) {
      throw new Error(`Failed to fetch working hours: ${error.message}`);
    }
    
    return (data || []).map(transformWorkingHoursData);
  },

  async create(employeeId: string, entry: Partial<WorkingHours>): Promise<WorkingHours> {
    validateEmployeeId(employeeId);
    validateWorkingHoursData(entry);

    const { data, error } = await supabase
      .from('working_hours')
      .insert({
        employee_id: employeeId,
        date: entry.date,
        check_in: entry.checkIn,
        check_out: entry.checkOut,
        total_hours: entry.totalHours,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create working hours record: ${error.message}`);
    }

    return transformWorkingHoursData(data);
  },

  async checkIn(employeeId: string, date: string, checkIn: string): Promise<WorkingHours> {
    validateEmployeeId(employeeId);
    validateWorkingHoursData({ date, checkIn });

    try {
      // First, check for any active sessions across all dates
      const { data: activeSession, error: checkError } = await supabase
        .from('working_hours')
        .select('*')
        .eq('employee_id', employeeId)
        .is('check_out', null)
        .maybeSingle();

      if (checkError) {
        throw new Error(`Failed to check active session: ${checkError.message}`);
      }

      if (activeSession) {
        throw new Error('Employee already has an active duty session');
      }

      // If no active session, create a new one
      const { data, error } = await supabase
        .from('working_hours')
        .insert({
          employee_id: employeeId,
          date,
          check_in: checkIn,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('Employee already has an active duty session');
        }
        throw new Error(`Failed to create working hours record: ${error.message}`);
      }

      return transformWorkingHoursData(data);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while starting duty');
    }
  },

  async checkOut(id: string, checkOut: string, totalHours: number): Promise<WorkingHours> {
    if (!id) {
      throw new Error('Working hours ID is required');
    }

    try {
      // Validate the working hours record exists and hasn't been checked out
      const { data: existing, error: fetchError } = await supabase
        .from('working_hours')
        .select('*')
        .eq('id', id)
        .is('check_out', null)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          throw new Error('No active duty session found');
        }
        throw new Error(`Failed to fetch working hours: ${fetchError.message}`);
      }

      if (!existing) {
        throw new Error('No active duty session found');
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

      if (error) {
        throw new Error(`Failed to update working hours record: ${error.message}`);
      }

      return transformWorkingHoursData(data);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while ending duty');
    }
  },

  async updateTimeEntry(id: string, updates: Partial<WorkingHours>): Promise<WorkingHours> {
    if (!id) {
      throw new Error('Working hours ID is required');
    }

    try {
      const { data, error } = await supabase
        .from('working_hours')
        .update({
          date: updates.date,
          check_in: updates.checkIn,
          check_out: updates.checkOut,
          total_hours: updates.totalHours,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update working hours record: ${error.message}`);
      }

      return transformWorkingHoursData(data);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while updating time entry');
    }
  },

  async delete(id: string): Promise<void> {
    if (!id) {
      throw new Error('Working hours ID is required');
    }

    try {
      const { error } = await supabase
        .from('working_hours')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete working hours record: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while deleting time entry');
    }
  },

  async hasActiveSession(employeeId: string): Promise<boolean> {
    validateEmployeeId(employeeId);

    try {
      const { data, error } = await supabase
        .from('working_hours')
        .select('id')
        .eq('employee_id', employeeId)
        .is('check_out', null)
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to check active session: ${error.message}`);
      }

      return !!data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while checking active session');
    }
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