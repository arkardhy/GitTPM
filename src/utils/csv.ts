import { format } from 'date-fns';
import type { Employee, LeaveRequest, WorkingHours } from '../types';

type ExportData = {
  [key: string]: string | number | boolean | null;
};

function sanitizeCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yyyy');
}

function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yyyy HH:mm:ss');
}

function formatTimeHMS(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  const s = Math.floor(((hours - h) * 60 - m) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function calculateMonthlyHours(workingHours: WorkingHours[], monthYear?: string): number {
  const targetMonth = monthYear || new Date().toISOString().slice(0, 7);
  return workingHours
    .filter(hours => hours.date.startsWith(targetMonth))
    .reduce((total, hours) => total + hours.totalHours, 0);
}

export const exportToCSV = (data: any[], type: 'employees' | 'leave-requests' | 'time-tracking'): void => {
  let formattedData: ExportData[] = [];
  let filename = '';

  switch (type) {
    case 'employees':
      filename = `employees_${format(new Date(), 'yyyy-MM-dd')}`;
      formattedData = data.map((employee: Employee) => {
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
          'Join Date': formatDate(employee.joinDate),
          'Current Month Hours': formatTimeHMS(currentMonthHours),
          'Previous Month Hours': formatTimeHMS(previousMonthHours),
          'Total Hours': formatTimeHMS(
            employee.workingHours.reduce((sum, wh) => sum + wh.totalHours, 0)
          ),
        };
      });
      break;

    case 'leave-requests':
      filename = `leave_requests_${format(new Date(), 'yyyy-MM-dd')}`;
      formattedData = data.map((request: LeaveRequest) => ({
        'Employee ID': request.employeeId,
        'Start Date': formatDate(request.startDate),
        'End Date': formatDate(request.endDate),
        Reason: request.reason,
        Status: request.status.charAt(0).toUpperCase() + request.status.slice(1),
        'Created At': formatDateTime(request.createdAt),
      }));
      break;

    case 'time-tracking':
      filename = `time_tracking_${format(new Date(), 'yyyy-MM-dd')}`;
      formattedData = data.map((record: any) => ({
        'Employee Name': record.employeeName,
        'Position': record.position,
        'Date': formatDate(record.date),
        'Check In': formatDateTime(record.checkIn),
        'Check Out': record.checkOut ? formatDateTime(record.checkOut) : 'Active',
        'Duration': formatTimeHMS(record.totalHours),
      }));
      break;
  }

  if (formattedData.length === 0) {
    console.warn('No data to export');
    return;
  }

  const headers = Object.keys(formattedData[0]);
  const csvContent = [
    headers.join(','),
    ...formattedData.map(row => 
      headers.map(header => sanitizeCSVValue(row[header])).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};