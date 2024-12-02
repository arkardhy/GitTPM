import { supabase } from '../supabase';

export async function markWageAsWithdrawn(employeeId: string, amount: number, month: string): Promise<void> {
  const { error } = await supabase
    .from('wage_withdrawals')
    .insert({
      employee_id: employeeId,
      amount,
      month,
      withdrawn_at: new Date().toISOString(),
    });

  if (error) throw error;
}

export async function getWageWithdrawals(month: string): Promise<Array<{ employee_id: string }>> {
  const { data, error } = await supabase
    .from('wage_withdrawals')
    .select('employee_id')
    .eq('month', month);

  if (error) throw error;
  return data || [];
}