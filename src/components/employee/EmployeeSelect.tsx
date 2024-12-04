import { UserCircle } from 'lucide-react';
import type { Employee } from '../../types';

interface EmployeeSelectProps {
  employees: Employee[];
  selectedEmployee: Employee | null;
  onSelect: (employee: Employee | null) => void;
  onClearError?: () => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function EmployeeSelect({
  employees,
  selectedEmployee,
  onSelect,
  onClearError,
  label = 'Select Employee',
  placeholder = 'Choose an employee...',
  className = '',
}: EmployeeSelectProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className="block w-full pl-10 pr-4 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2D85B2] focus:border-[#2D85B2] sm:text-sm rounded-lg shadow-sm"
          value={selectedEmployee?.id || ''}
          onChange={(e) => {
            const employee = employees.find((emp) => emp.id === e.target.value);
            onSelect(employee || null);
            onClearError?.();
          }}
        >
          <option value="">{placeholder}</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name} - {employee.position}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <UserCircle className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
}