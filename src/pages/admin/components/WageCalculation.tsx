import { useState, useMemo } from 'react';
import { Calculator, Download } from 'lucide-react';
import { calculateWage, formatCurrency } from '../../../utils/wage';
import { SearchBar } from '../../../components/ui/SearchBar';
import { exportToCSV } from '../../../utils/csv';
import type { Employee } from '../../../types';

interface WageCalculationProps {
  employees: Employee[];
}

export function WageCalculation({ employees }: WageCalculationProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const wageData = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    
    return employees
      .filter(employee => {
        const matchesName = employee.name.toLowerCase().includes(searchLower);
        const matchesPosition = employee.position.toLowerCase().includes(searchLower);
        return matchesName || matchesPosition;
      })
      .map(employee => {
        const monthlyHours = employee.workingHours
          .filter(hours => hours.date.startsWith(selectedMonth))
          .reduce((total, hours) => total + hours.totalHours, 0);

        const wage = calculateWage(employee.position, monthlyHours);

        return {
          employee,
          monthlyHours,
          ...wage,
          isFixedSalary: ['Komisaris Utama', 'Sumber Daya Manusia', 'Bendahara', 'Pemasaran', 'Sekretaris'].includes(employee.position)
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [employees, selectedMonth, searchQuery]);

  const handleExportCSV = () => {
    const exportData = wageData.map(({ employee, monthlyHours, base, bonus, total, isFixedSalary }) => ({
      'Employee Name': employee.name,
      'Position': employee.position,
      'Total Hours': isFixedSalary ? 'Fixed Salary' : monthlyHours.toFixed(2),
      'Base Wage': formatCurrency(base),
      'Bonus': formatCurrency(bonus),
      'Total Wage': formatCurrency(total),
    }));

    exportToCSV(exportData, 'wage-calculation');
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Wage Calculation</h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name or position..."
            />
            <div className="flex gap-4">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-5 w-5 mr-2" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Employee</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Position</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Total Hours</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Base Wage</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Bonus</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Total Wage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {wageData.map(({ employee, monthlyHours, base, bonus, total, isFixedSalary }) => (
                    <tr key={employee.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        {employee.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {employee.position}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {isFixedSalary ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Fixed Salary
                          </span>
                        ) : (
                          monthlyHours.toFixed(2)
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatCurrency(base)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        {bonus > 0 ? (
                          <span className="text-green-600 font-medium">{formatCurrency(bonus)}</span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-indigo-600">
                        {formatCurrency(total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}