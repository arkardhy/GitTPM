import { 
  getFoodItems,
  createFoodTransaction,
  getFoodTransactions,
} from '../lib/api/foodApi';
import type { FoodItem, FoodTransaction } from '../types';

export const foodService = {
  async getItems(): Promise<FoodItem[]> {
    return getFoodItems();
  },

  async createTransaction(transaction: Omit<FoodTransaction, 'id' | 'createdAt'>): Promise<FoodTransaction> {
    return createFoodTransaction(transaction);
  },

  async getTransactions(): Promise<FoodTransaction[]> {
    return getFoodTransactions();
  },
};