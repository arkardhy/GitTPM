import { supabase } from '../lib/supabase';
import { validateEmployeeId, validateEmployeeData } from './validation';
import type { Employee } from '../types';

export const employeeService = {
  async getAll(): Promise<Employee[]> {
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
    return data.map(transformEmployeeData);
  },

  async create(employee: Omit<Employee, 'id' | 'warnings' | 'workingHours'>): Promise<Employee> {
    validateEmployeeData(employee);

    const { data, error } = await supabase
      .from('employees')
      .insert({
        name: employee.name,
        position: employee.position,
        additional_positions: employee.additionalPositions,
        join_date: employee.joinDate,
      })
      .select()
      .single();

    if (error) throw error;
    return transformEmployeeData(data);
  },

  async update(id: string, updates: Partial<Employee>): Promise<Employee> {
    validateEmployeeId(id);
    validateEmployeeData({ ...updates, position: updates.position ?? 'placeholder' });

    const { data, error } = await supabase
      .from('employees')
      .update({
        name: updates.name,
        position: updates.position,
        additional_positions: updates.additionalPositions,
        join_date: updates.joinDate,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return transformEmployeeData(data);
  },

  async delete(id: string): Promise<void> {
    validateEmployeeId(id);

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

function transformEmployeeData(data: any): Employee {
  return {
    id: data.id,
    name: data.name,
    position: data.position,
    additionalPositions: data.additional_positions || [],
    joinDate: data.join_date,
    warnings: [],
    workingHours: data.working_hours?.map((wh: any) => ({
      id: wh.id,
      date: wh.date,
      checkIn: wh.check_in,
      checkOut: wh.check_out,
      totalHours: wh.total_hours || 0,
    })) || [],
  };
}