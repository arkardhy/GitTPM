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
      <div className="flex items-center mb-4">
        <div className="p-2 bg-[#105283]/10 rounded-lg">
          <Clock className="h-5 w-5 text-[#105283]" />
        </div>
        <h2 className="text-lg font-semibold text-[#105283] ml-3">Aktivitas Terakhir</h2>
      </div>
      
      <div className="space-y-3">
        {workingHours.slice(-5).map((hours, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-lg p-4 border border-gray-100 transition-all hover:shadow-md hover:border-[#2D85B2]/20"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-[#2D85B2]" />
                <span className="text-sm font-medium text-gray-900">
                  {formatDayMonthYear(hours.date)}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-[#2D85B2]" />
                <span>
                  {formatDateTime(hours.checkIn)} -{' '}
                  {hours.checkOut ? formatDateTime(hours.checkOut) : (
                    <span className="text-green-600 font-medium">Active</span>
                  )}
                </span>
              </div>
            </div>
            {hours.checkOut && (
              <div className="mt-2 text-sm font-medium text-[#2D85B2]">
                Total Jam: {formatDuration(hours.totalHours)}
              </div>
            )}
          </div>
        ))}
        {workingHours.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            No activity recorded yet
          </div>
        )}
      </div>
    </div>
  );
}