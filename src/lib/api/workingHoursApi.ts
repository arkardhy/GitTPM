import { supabase } from '../supabase';
import type { WorkingHours } from '../../types';

export async function checkIn(employeeId: string, date: string, checkIn: string): Promise<WorkingHours> {
  // Check for active sessions
  const { data: activeSession } = await supabase
    .from('working_hours')
    .select('*')
    .eq('employee_id', employeeId)
    .is('check_out', null)
    .maybeSingle();

  if (activeSession) {
    throw new Error('Employee already has an active duty session');
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

  if (error) {
    if (error.code === '23505') {
      throw new Error('Employee already has an active duty session');
    }
    throw error;
  }

  return transformWorkingHoursData(data);
}

export async function checkOut(id: string, checkOut: string, totalHours: number): Promise<WorkingHours> {
  const { data: existing } = await supabase
    .from('working_hours')
    .select('*')
    .eq('id', id)
    .is('check_out', null)
    .single();

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

export async function updateTimeEntry(id: string, updates: Partial<WorkingHours>): Promise<WorkingHours> {
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