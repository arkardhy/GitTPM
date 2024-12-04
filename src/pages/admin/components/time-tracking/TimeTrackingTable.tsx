import { Edit2, Trash2 } from 'lucide-react';
import { formatDate, formatFullDateTime } from '../../../../utils/dateTime';
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
    <div className="mt-6 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3.5 text-left text-sm font-semibold text-[#105283]">Nama</th>
                <th className="px-4 py-3.5 text-left text-sm font-semibold text-[#105283]">Posisi</th>
                <th className="px-4 py-3.5 text-left text-sm font-semibold text-[#105283]">Tanggal</th>
                <th className="px-4 py-3.5 text-left text-sm font-semibold text-[#105283]">On Duty</th>
                <th className="px-4 py-3.5 text-left text-sm font-semibold text-[#105283]">Off Duty</th>
                <th className="px-4 py-3.5 text-left text-sm font-semibold text-[#105283]">Total Jam</th>
                <th className="px-4 py-3.5 text-left text-sm font-semibold text-[#105283]">Rubah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {entries.map(({ hours, employee }) => (
                <tr 
                  key={hours.id}
                  className="hover:bg-[#F8FAFC] transition-colors duration-200"
                >
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-[#46525A]">
                    {employee.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-[#46525A]">
                    {employee.position}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-[#46525A]">
                    {formatDate(hours.date)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-[#46525A]">
                    {formatFullDateTime(hours.checkIn)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-[#46525A]">
                    {hours.checkOut ? formatFullDateTime(hours.checkOut) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-[#46525A]">
                    {formatDuration(hours.totalHours)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => onEdit(hours, employee)}
                        className="text-[#2D85B2] hover:text-[#105283] transition-colors duration-200"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onDelete(hours)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
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