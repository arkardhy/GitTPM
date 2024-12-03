import { format } from 'date-fns';
import type { Employee, LeaveRequest, WorkingHours } from '../../types';
import type { ExcelFormatter, WageExportData } from './types';
import { formatDuration } from '../time';
import { formatCurrency } from '../wage';

export const wageCalculationFormatter: ExcelFormatter<WageExportData> = {
  format: (data) => {
    const baseFormat = {
      'Employee Name': data.employee.name,
      'Position': data.employee.position,
      'Total Hours': data.isFixedSalary ? 'Fixed Salary' : data.monthlyHours.toFixed(2),
      'Base Wage': formatCurrency(data.wageBreakdown.baseWage),
    };

    if (data.isFixedSalary) {
      return {
        ...baseFormat,
        'Total': formatCurrency(data.wageBreakdown.totalWage),
        'Status': data.isWithdrawn ? 'Withdrawn' : 'Pending',
      };
    }

    return {
      ...baseFormat,
      'Performance Bonus': formatCurrency(data.wageBreakdown.performanceBonus),
      'Fixed Bonus': formatCurrency(data.wageBreakdown.fixedBonus),
      'Total': formatCurrency(data.wageBreakdown.totalWage),
      'Status': data.isWithdrawn ? 'Withdrawn' : 'Pending',
    };
  },
};

export const employeeFormatter: ExcelFormatter<Employee> = {
  format: (employee) => ({
    'Name': employee.name,
    'Position': employee.position,
    'Join Date': format(new Date(employee.joinDate), 'dd MMMM yyyy'),
    'Total Hours': formatDuration(
      employee.workingHours.reduce((sum, wh) => sum + wh.totalHours, 0)
    ),
  }),
};

export const leaveRequestFormatter: ExcelFormatter<LeaveRequest> = {
  format: (request) => ({
    'Employee ID': request.employeeId,
    'Start Date': format(new Date(request.startDate), 'dd MMMM yyyy'),
    'End Date': format(new Date(request.endDate), 'dd MMMM yyyy'),
    'Reason': request.reason,
    'Status': request.status.charAt(0).toUpperCase() + request.status.slice(1),
    'Created At': format(new Date(request.createdAt), 'dd MMMM yyyy HH:mm:ss'),
  }),
};

export const timeTrackingFormatter: ExcelFormatter<{
  hours: WorkingHours;
  employeeName: string;
  position: string;
}> = {
  format: (record) => ({
    'Employee Name': record.employeeName,
    'Position': record.position,
    'Date': format(new Date(record.hours.date), 'dd MMMM yyyy'),
    'Check In': format(new Date(record.hours.checkIn), 'HH:mm:ss'),
    'Check Out': record.hours.checkOut 
      ? format(new Date(record.hours.checkOut), 'HH:mm:ss')
      : 'Active',
    'Duration': formatDuration(record.hours.totalHours),
  }),
};