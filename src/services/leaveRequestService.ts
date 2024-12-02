import { supabase } from '../lib/supabase';
import type { LeaveRequest } from '../types';

export const leaveRequestService = {
  async getAll(): Promise<LeaveRequest[]> {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(transformLeaveRequestData);
  },

  async create(request: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>): Promise<LeaveRequest> {
    const { data, error } = await supabase
      .from('leave_requests')
      .insert({
        employee_id: request.employeeId,
        start_date: request.startDate,
        end_date: request.endDate,
        reason: request.reason,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return transformLeaveRequestData(data);
  },

  async update(id: string, updates: Partial<LeaveRequest>): Promise<LeaveRequest> {
    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        start_date: updates.startDate,
        end_date: updates.endDate,
        reason: updates.reason,
        status: updates.status,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return transformLeaveRequestData(data);
  },

  async updateStatus(id: string, status: LeaveRequest['status']): Promise<LeaveRequest> {
    const { data, error } = await supabase
      .from('leave_requests')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return transformLeaveRequestData(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('leave_requests')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

function transformLeaveRequestData(data: any): LeaveRequest {
  return {
    id: data.id,
    employeeId: data.employee_id,
    startDate: data.start_date,
    endDate: data.end_date,
    reason: data.reason,
    status: data.status,
    createdAt: data.created_at,
  };
}