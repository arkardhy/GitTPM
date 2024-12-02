import { Employee, LeaveRequest } from '../types';

const STORAGE_KEYS = {
  EMPLOYEES: 'hr_portal_employees',
  LEAVE_REQUESTS: 'hr_portal_leave_requests',
  ADMIN_TOKEN: 'hr_portal_admin_token',
};

export const storage = {
  getEmployees: (): Employee[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
  },

  setEmployees: (employees: Employee[]) => {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  },

  getLeaveRequests: (): LeaveRequest[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.LEAVE_REQUESTS) || '[]');
  },

  setLeaveRequests: (requests: LeaveRequest[]) => {
    localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(requests));
  },

  isAdminAuthenticated: (): boolean => {
    return !!localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
  },

  setAdminToken: (token: string) => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
  },

  clearAdminToken: () => {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
  },
};