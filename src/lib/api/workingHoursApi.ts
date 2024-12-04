import { supabase } from '../supabase';
import type { WorkingHours } from '../../types';
import { toUTC } from '../../utils/dateTime';

export async function checkIn(employeeId: string, date: string, checkIn: string): Promise<WorkingHours> {
  // Check for active sessions
  const { data: activeSession, error: checkError } = await supabase
    .from('working_hours')
    .select('*')
    .eq('employee_id', employeeId)
    .is('check_out', null)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    throw checkError;
  }

  if (activeSession) {
    throw new Error('Employee already has an active duty session');
  }

  // Check for existing check-in on the same date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const { data: existingEntry } = await supabase
    .from('working_hours')
    .select('*')
    .eq('employee_id', employeeId)
    .gte('check_in', toUTC(startOfDay).toISOString())
    .lte('check_in', toUTC(endOfDay).toISOString())
    .maybeSingle();

  if (existingEntry) {
    throw new Error('Employee already has a check-in for this date');
  }

  const { data, error } = await supabase
    .from('working_hours')
    .insert({
      employee_id: employeeId,
      date,
      check_in: checkIn,
      total_hours: 0,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Employee already has an active duty session');
    }
    throw error;
  }

  return transformWorkingHoursData(data);
}

export async function checkOut(id: string, checkOut: string, totalHours: number): Promise<WorkingHours> {
  const { data: existing, error: checkError } = await supabase
    .from('working_hours')
    .select('*')
    .eq('id', id)
    .is('check_out', null)
    .single();

  if (checkError) {
    if (checkError.code === 'PGRST116') {
      throw new Error('No active duty session found');
    }
    throw checkError;
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

  if (error) throw error;
  return transformWorkingHoursData(data);
}

export async function create(employeeId: string, entries: Partial<WorkingHours>[]): Promise<WorkingHours[]> {
  const { data, error } = await supabase
    .from('working_hours')
    .insert(
      entries.map(entry => ({
        employee_id: employeeId,
        date: entry.date,
        check_in: entry.checkIn,
        check_out: entry.checkOut,
        total_hours: entry.totalHours || 0,
      }))
    )
    .select();

  if (error) throw error;
  return data.map(transformWorkingHoursData);
}

export async function updateTimeEntry(id: string, updates: Partial<WorkingHours>): Promise<WorkingHours> {
  const { data: existing, error: checkError } = await supabase
    .from('working_hours')
    .select('*')
    .eq('id', id)
    .single();

  if (checkError) throw checkError;

  if (!existing) {
    throw new Error('Time entry not found');
  }

  const { data, error } = await supabase
    .from('working_hours')
    .update({
      date: updates.date,
      check_in: updates.checkIn,
      check_out: updates.checkOut,
      total_hours: updates.totalHours || 0,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return transformWorkingHoursData(data);
}

export async function deleteTimeEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from('working_hours')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

function transformWorkingHoursData(data: any): WorkingHours {
  return {
    id: data.id,
    date: data.date,
    checkIn: data.check_in,
    checkOut: data.check_out,
    totalHours: data.total_hours || 0,
  };
}