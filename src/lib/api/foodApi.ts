import { supabase } from '../supabase';
import type { FoodItem, FoodTransaction } from '../../types';

export async function getFoodItems(): Promise<FoodItem[]> {
  const { data, error } = await supabase
    .from('food_items')
    .select('*')
    .order('name');

  if (error) throw error;
  return transformFoodItemData(data);
}

export async function createFoodTransaction(transaction: Omit<FoodTransaction, 'id' | 'createdAt'>): Promise<FoodTransaction> {
  const { data, error } = await supabase
    .from('food_transactions')
    .insert({
      food_item_id: transaction.foodItemId,
      employee_id: transaction.employeeId,
      supervisor: transaction.supervisor,
      description: transaction.description,
      quantity: transaction.quantity,
      transaction_type: transaction.transactionType,
    })
    .select()
    .single();

  if (error) throw error;
  return transformFoodTransactionData(data);
}

export async function getFoodTransactions(): Promise<FoodTransaction[]> {
  const { data, error } = await supabase
    .from('food_transactions')
    .select(`
      *,
      food_items (
        name,
        type
      ),
      employees (
        name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(transformFoodTransactionData);
}

function transformFoodItemData(data: any[]): FoodItem[] {
  return data.map(item => ({
    id: item.id,
    name: item.name,
    type: item.type,
    quantity: item.quantity,
    createdAt: item.created_at,
  }));
}

function transformFoodTransactionData(data: any): FoodTransaction {
  return {
    id: data.id,
    foodItemId: data.food_item_id,
    employeeId: data.employee_id,
    supervisor: data.supervisor,
    description: data.description,
    quantity: data.quantity,
    transactionType: data.transaction_type,
    createdAt: data.created_at,
  };
}