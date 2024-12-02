import { format } from 'date-fns';
import type { Employee, LeaveRequest, WorkingHours } from '../../types';
import type { CSVFormatter } from './types';
import { formatDuration } from '../time';

export const employeeFormatter: CSVFormatter<Employee> = {
  format: (employee) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const previousMonth = new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .slice(0, 7);

    const monthlyHours = (month: string) =>
      employee.workingHours
        .filter(hours => hours.date.startsWith(month))
        .reduce((total, hours) => total + hours.totalHours, 0);

    return {
      Name: employee.name,
      Position: employee.position,
      'Join Date': format(new Date(employee.joinDate), 'dd MMMM yyyy'),
      'Current Month Hours': formatDuration(monthlyHours(currentMonth)),
      'Previous Month Hours': formatDuration(monthlyHours(previousMonth)),
      'Total Hours': formatDuration(
        employee.workingHours.reduce((sum, wh) => sum + wh.totalHours, 0)
      ),
    };
  },
};

export const leaveRequestFormatter: CSVFormatter<LeaveRequest> = {
  format: (request) => ({
    'Employee ID': request.employeeId,
    'Start Date': format(new Date(request.startDate), 'dd MMMM yyyy'),
    'End Date': format(new Date(request.endDate), 'dd MMMM yyyy'),
    'Reason': request.reason,
    'Status': request.status.charAt(0).toUpperCase() + request.status.slice(1),
    'Created At': format(new Date(request.createdAt), 'dd MMMM yyyy HH:mm:ss'),
  }),
};

export const timeTrackingFormatter: CSVFormatter<{
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