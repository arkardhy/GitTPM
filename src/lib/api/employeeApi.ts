import { supabase } from '../supabase';
import type { Employee } from '../../types';

export async function fetchEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from('employees')
    .select(`
      *,
      working_hours (
        id,
        date,
        check_in,
        check_out,
        total_hours
      )
    `)
    .order('name');

  if (error) throw error;
  return transformEmployeeData(data);
}

export async function createEmployee(employee: Omit<Employee, 'id' | 'warnings' | 'workingHours'>): Promise<Employee> {
  const { data, error } = await supabase
    .from('employees')
    .insert({
      name: employee.name,
      position: employee.position,
      join_date: employee.joinDate,
    })
    .select()
    .single();

  if (error) throw error;
  return transformEmployeeData([data])[0];
}

export async function updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
  const { data, error } = await supabase
    .from('employees')
    .update({
      name: updates.name,
      position: updates.position,
      join_date: updates.joinDate,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return transformEmployeeData([data])[0];
}

export async function deleteEmployee(id: string): Promise<void> {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

function transformEmployeeData(data: any[]): Employee[] {
  return data.map(item => ({
    id: item.id,
    name: item.name,
    position: item.position,
    joinDate: item.join_date,
    warnings: [],
    workingHours: item.working_hours?.map((wh: any) => ({
      id: wh.id,
      date: wh.date,
      checkIn: wh.check_in,
      checkOut: wh.check_out,
      totalHours: wh.total_hours || 0,
    })) || [],
  }));
}