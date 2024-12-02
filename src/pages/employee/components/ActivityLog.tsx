import { Calendar, Clock } from 'lucide-react';
import type { WorkingHours } from '../../../types';
import { formatDuration } from '../../../utils/time';
import { formatDateTime, formatDayMonthYear } from '../../../utils/dateTime';

interface ActivityLogProps {
  workingHours: WorkingHours[];
}

export function ActivityLog({ workingHours }: ActivityLogProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Aktivitas Terakhir</h2>
      <div className="space-y-3 sm:space-y-4">
        {workingHours.slice(-5).map((hours, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-100 transition-all hover:shadow-md"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-900">
                  {formatDayMonthYear(hours.date)}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>
                  {formatDateTime(hours.checkIn)} -{' '}
                  {hours.checkOut ? formatDateTime(hours.checkOut) : 'Active'}
                </span>
              </div>
            </div>
            {hours.checkOut && (
              <div className="mt-2 text-xs sm:text-sm font-medium text-indigo-600">
                Total Jam: {formatDuration(hours.totalHours)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}