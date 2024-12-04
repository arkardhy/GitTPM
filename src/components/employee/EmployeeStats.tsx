import { Clock, Calendar, TrendingUp } from 'lucide-react';
import type { Employee } from '../../types';
import { formatDuration } from '../../utils/time';

interface EmployeeStatsProps {
  employee: Employee;
}

export function EmployeeStats({ employee }: EmployeeStatsProps) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const previousMonth = new Date(new Date().setMonth(new Date().getMonth() - 1))
    .toISOString()
    .slice(0, 7);

  const monthlyHours = (month: string) =>
    employee.workingHours
      .filter(hours => hours.date.startsWith(month))
      .reduce((total, hours) => total + hours.totalHours, 0);

  const currentMonthHours = monthlyHours(currentMonth);
  const previousMonthHours = monthlyHours(previousMonth);
  const percentageChange = previousMonthHours
    ? ((currentMonthHours - previousMonthHours) / previousMonthHours) * 100
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center">
          <div className="bg-blue-50 rounded-lg p-3">
            <Clock className="h-6 w-6 text-[#2D85B2]" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Current Month</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">
              {formatDuration(currentMonthHours)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center">
          <div className="bg-green-50 rounded-lg p-3">
            <Calendar className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Previous Month</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">
              {formatDuration(previousMonthHours)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center">
          <div className="bg-purple-50 rounded-lg p-3">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Change</p>
            <p className={`mt-1 text-xl font-semibold ${
              percentageChange > 0 ? 'text-green-600' : 
              percentageChange < 0 ? 'text-red-600' : 
              'text-gray-900'
            }`}>
              {percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}