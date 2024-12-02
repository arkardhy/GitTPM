import { format } from 'date-fns';
import type { Employee, LeaveRequest, WorkingHours } from '../../types';
import type { ExcelFormatter, WageExportData } from './types';
import { formatDuration } from '../time';
import { calculateMonthlyHours } from './helpers';
import { formatCurrency } from '../wage';

export const employeeFormatter: ExcelFormatter<Employee> = {
  format: (employee) => {
    const currentMonthHours = calculateMonthlyHours(employee.workingHours);
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const previousMonthHours = calculateMonthlyHours(
      employee.workingHours,
      previousMonth.toISOString().slice(0, 7)
    );

    return {
      Name: employee.name,
      Position: employee.position,
      'Join Date': format(new Date(employee.joinDate), 'dd MMMM yyyy'),
      'Current Month Hours': formatDuration(currentMonthHours),
      'Previous Month Hours': formatDuration(previousMonthHours),
      'Total Hours': formatDuration(
        employee.workingHours.reduce((sum, wh) => sum + wh.totalHours, 0)
      ),
    };
  },
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

export const wageCalculationFormatter: ExcelFormatter<WageExportData> = {
  format: (data) => {
    const baseFormat = {
      'Employee Name': data.employee.name,
      'Position': data.employee.position,
      'Status': data.isWithdrawn ? 'Withdrawn' : 'Pending',
    };

    if (data.isFixedSalary) {
      return {
        ...baseFormat,
        'Total Hours': 'Fixed Salary',
        'Base Wage': formatCurrency(data.wageBreakdown.baseWage),
        'Total': formatCurrency(data.wageBreakdown.totalWage),
      };
    }

    return {
      ...baseFormat,
      'Total Hours': data.monthlyHours.toFixed(2),
      'Base Wage': formatCurrency(data.wageBreakdown.baseWage),
      'Performance Bonus': formatCurrency(data.wageBreakdown.performanceBonus),
      'Fixed Bonus': formatCurrency(data.wageBreakdown.fixedBonus),
      'Total': formatCurrency(data.wageBreakdown.totalWage),
    };
  },
};