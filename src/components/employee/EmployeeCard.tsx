import { UserCircle } from 'lucide-react';
import type { Employee } from '../../types';
import { formatDayMonthYear } from '../../utils/dateTime';

interface EmployeeCardProps {
  employee: Employee;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function EmployeeCard({ employee, onEdit, onDelete }: EmployeeCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-[#105283] to-[#2D85B2] rounded-full p-3">
              <UserCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{employee.name}</h3>
              <p className="text-sm text-gray-500">{employee.position}</p>
            </div>
          </div>
          {(onEdit || onDelete) && (
            <div className="flex space-x-2">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="text-[#2D85B2] hover:text-[#105283] p-2 rounded-full hover:bg-[#F8FAFC] transition-colors duration-200"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500">Join Date</p>
              <p className="mt-1 text-sm text-gray-900">
                {formatDayMonthYear(employee.joinDate)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Total Hours</p>
              <p className="mt-1 text-sm text-gray-900">
                {employee.workingHours.reduce((sum, wh) => sum + wh.totalHours, 0).toFixed(1)}h
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}