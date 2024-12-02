import { generateCSV } from './generator';
import { employeeFormatter, leaveRequestFormatter, timeTrackingFormatter } from './formatters';
import type { Employee, LeaveRequest, WorkingHours } from '../../types';

export function exportEmployeesToCSV(employees: Employee[]): void {
  generateCSV(employees, employeeFormatter, {
    filename: 'employees',
  });
}

export function exportLeaveRequestsToCSV(requests: LeaveRequest[]): void {
  generateCSV(requests, leaveRequestFormatter, {
    filename: 'leave-requests',
  });
}

export function exportTimeTrackingToCSV(
  data: Array<{
    hours: WorkingHours;
    employeeName: string;
    position: string;
  }>
): void {
  generateCSV(data, timeTrackingFormatter, {
    filename: 'time-tracking',
  });
}

export { type CSVOptions, type CSVFormatter, type CSVValue } from './types';