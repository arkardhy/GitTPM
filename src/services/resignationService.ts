import { supabase } from '../lib/supabase';
import type { ResignationRequest } from '../types';

export const resignationService = {
  async getAll(): Promise<ResignationRequest[]> {
    const { data, error } = await supabase
      .from('resignation_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(transformResignationData);
  },

  async create(request: Omit<ResignationRequest, 'id' | 'status' | 'createdAt'>): Promise<ResignationRequest> {
    const { data, error } = await supabase
      .from('resignation_requests')
      .insert({
        employee_id: request.employeeId,
        passport: request.passport,
        reason_ic: request.reasonIC,
        reason_ooc: request.reasonOOC,
        request_date: request.requestDate,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return transformResignationData(data);
  },

  async updateStatus(id: string, status: ResignationRequest['status']): Promise<ResignationRequest> {
    const { data, error } = await supabase
      .from('resignation_requests')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return transformResignationData(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('resignation_requests')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

function transformResignationData(data: any): ResignationRequest {
  return {
    id: data.id,
    employeeId: data.employee_id,
    passport: data.passport,
    reasonIC: data.reason_ic,
    reasonOOC: data.reason_ooc,
    requestDate: data.request_date,
    status: data.status,
    createdAt: data.created_at,
  };
}