import { Clock, Edit2, Trash2 } from 'lucide-react';
import { formatDateTime, formatDuration } from '../../utils/dateTime';
import type { Employee, WorkingHours } from '../../types';

interface TimeEntryListProps {
  entries: WorkingHours[];
  employeeName: string;
  onEdit: (entry: WorkingHours) => void;
  onDelete: (entry: WorkingHours) => void;
}

export function TimeEntryList({ entries, employeeName, onEdit, onDelete }: TimeEntryListProps) {
  return (
    <div className="mt-8 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Check In</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Check Out</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Duration</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {formatDateTime(entry.date)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {formatDateTime(entry.checkIn)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {entry.checkOut ? formatDateTime(entry.checkOut) : 'Active'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {formatDuration(entry.totalHours)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(entry)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onDelete(entry)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}