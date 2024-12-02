import { Edit2, Trash2 } from 'lucide-react';
import { formatDate, formatTime } from '../../../../utils/dateTime';
import { formatDuration } from '../../../../utils/time';
import type { Employee, WorkingHours } from '../../../../types';

interface TimeTrackingTableProps {
  entries: Array<{
    hours: WorkingHours;
    employee: Employee;
  }>;
  onEdit: (hours: WorkingHours, employee: Employee) => void;
  onDelete: (hours: WorkingHours) => void;
}

export function TimeTrackingTable({ entries, onEdit, onDelete }: TimeTrackingTableProps) {
  return (
    <div className="mt-8 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Nama</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Posisi</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tanggal</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">On Duty</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Off Duty</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Total Jam</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Rubah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {entries.map(({ hours, employee }) => (
                <tr key={hours.id}>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {employee.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {employee.position}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {formatDate(hours.date)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {formatTime(hours.checkIn)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {hours.checkOut ? formatTime(hours.checkOut) : 'Active'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {formatDuration(hours.totalHours)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(hours, employee)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onDelete(hours)}
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