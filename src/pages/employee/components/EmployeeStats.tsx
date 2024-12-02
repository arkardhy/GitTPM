import { Clock, Calendar } from 'lucide-react';
import type { Employee } from '../../../types';
import { formatDuration } from '../../../utils/time';

interface EmployeeStatsProps {
  employee: Employee;
}

export function EmployeeStats({ employee }: EmployeeStatsProps) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const monthlyHours = employee.workingHours
    .filter(hours => hours.date.startsWith(currentMonth))
    .reduce((total, hours) => total + hours.totalHours, 0);

  const workDays = employee.workingHours
    .filter(hours => hours.date.startsWith(currentMonth))
    .length;

  const averageHours = workDays > 0 ? monthlyHours / workDays : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
        <div className="flex items-center">
          <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
          <div className="ml-3 sm:ml-4">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Monthly Hours</p>
            <p className="text-lg sm:text-2xl font-semibold text-gray-900">{formatDuration(monthlyHours)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
        <div className="flex items-center">
          <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
          <div className="ml-3 sm:ml-4">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Daily Average</p>
            <p className="text-lg sm:text-2xl font-semibold text-gray-900">{formatDuration(averageHours)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}