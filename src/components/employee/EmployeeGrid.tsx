import { EmployeeCard } from './EmployeeCard';
import type { Employee } from '../../types';

interface EmployeeGridProps {
  employees: Employee[];
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
}

export function EmployeeGrid({ employees, onEdit, onDelete }: EmployeeGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {employees.map((employee) => (
        <EmployeeCard
          key={employee.id}
          employee={employee}
          onEdit={() => onEdit?.(employee)}
          onDelete={() => onDelete?.(employee)}
        />
      ))}
    </div>
  );
}