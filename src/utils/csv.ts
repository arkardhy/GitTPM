import { exportToExcel } from './excel';

export function exportToCSV(data: any[], type: 'employees' | 'leave-requests' | 'time-tracking'): void {
  exportToExcel(data, type);
}