import { UserCircle } from 'lucide-react';
import type { Employee } from '../../../types';

interface EmployeeSelectProps {
  employees: Employee[];
  selectedEmployee: Employee | null;
  onSelect: (employee: Employee | null) => void;
  onClearError: () => void;
}

export function EmployeeSelect({
  employees,
  selectedEmployee,
  onSelect,
  onClearError,
}: EmployeeSelectProps) {
  return (
    <div className="mb-8">
      <label className="block text-sm font-medium text-[#105283] mb-2">
        Nama Anggota Trans
      </label>
      <div className="relative">
        <select
          className="block w-full pl-10 pr-4 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2D85B2] focus:border-[#2D85B2] sm:text-sm rounded-lg shadow-sm transition-all duration-200"
          value={selectedEmployee?.id || ''}
          onChange={(e) => {
            const employee = employees.find((emp) => emp.id === e.target.value);
            onSelect(employee || null);
            onClearError();
          }}
        >
          <option value="">Pilih Nama Kamu</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name} - {employee.position}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <UserCircle className="h-5 w-5 text-[#2D85B2]" />
        </div>
      </div>
    </div>
  );
}