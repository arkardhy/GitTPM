import { 
  fetchEmployees, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee 
} from '../lib/api/employeeApi';
import { validateEmployeeId, validateEmployeeData } from './validation';
import type { Employee } from '../types';

export const employeeService = {
  async getAll(): Promise<Employee[]> {
    return fetchEmployees();
  },

  async create(employee: Omit<Employee, 'id' | 'warnings' | 'workingHours'>): Promise<Employee> {
    validateEmployeeData(employee);
    return createEmployee(employee);
  },

  async update(id: string, updates: Partial<Employee>): Promise<Employee> {
    validateEmployeeId(id);
    validateEmployeeData({ ...updates, position: updates.position ?? 'placeholder' });
    return updateEmployee(id, updates);
  },

  async delete(id: string): Promise<void> {
    validateEmployeeId(id);
    return deleteEmployee(id);
  },
};