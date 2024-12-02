import { useState, useMemo } from 'react';
import { Calculator, Download } from 'lucide-react';
import { calculateWage, formatCurrency } from '../../../utils/wage';
import { SearchBar } from '../../../components/ui/SearchBar';
import { exportToCSV } from '../../../utils/csv';
import type { Employee } from '../../../types';

interface WageCalculationProps {
  employees: Employee[];
}

const FIXED_SALARY_POSITIONS = [
  'Komisaris Utama',
  'Sekretaris',
  'Sumber Daya Manusia',
  'Pemasaran',
  'Bendahara',
  'Eksekutif',
];

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

        const wageBreakdown = calculateWage(employee.position, monthlyHours);

        return {
          employee,
          monthlyHours,
          wageBreakdown,
          isFixedSalary: FIXED_SALARY_POSITIONS.includes(employee.position),
        };
      })
      .sort((a, b) => b.wageBreakdown.totalWage - a.wageBreakdown.totalWage);
  }, [employees, selectedMonth, searchQuery]);

  const handleExportCSV = () => {
    const exportData = wageData.map(({ employee, monthlyHours, wageBreakdown, isFixedSalary }) => ({
      'Employee Name': employee.name,
      'Position': employee.position,
      'Total Hours': isFixedSalary ? 'Fixed Salary' : monthlyHours.toFixed(2),
      'Base Wage': formatCurrency(wageBreakdown.baseWage),
      ...(isFixedSalary ? {} : {
        'Performance Bonus': formatCurrency(wageBreakdown.performanceBonus),
        'Fixed Bonus': formatCurrency(wageBreakdown.fixedBonus),
      }),
      'Total': formatCurrency(wageBreakdown.totalWage),
    }));

    exportToCSV(exportData, 'wage-calculation');
  };

  const hasHourlyEmployees = wageData.some(({ isFixedSalary }) => !isFixedSalary);

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
                    {hasHourlyEmployees && (
                      <>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Base Wage</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Performance Bonus</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Fixed Bonus</th>
                      </>
                    )}
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {wageData.map(({ employee, monthlyHours, wageBreakdown, isFixedSalary }) => (
                    <tr key={employee.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        {employee.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {employee.position}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {isFixedSalary ? (
                          <span className="italic text-gray-400">Fixed Salary</span>
                        ) : (
                          monthlyHours.toFixed(2)
                        )}
                      </td>
                      {hasHourlyEmployees && !isFixedSalary && (
                        <>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                            {formatCurrency(wageBreakdown.baseWage)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-green-600">
                            {formatCurrency(wageBreakdown.performanceBonus)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-blue-600">
                            {formatCurrency(wageBreakdown.fixedBonus)}
                          </td>
                        </>
                      )}
                      {hasHourlyEmployees && isFixedSalary && (
                        <td colSpan={3} className="whitespace-nowrap px-3 py-4 text-sm text-gray-400 italic">
                          Fixed Monthly Salary
                        </td>
                      )}
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-indigo-600">
                        {formatCurrency(wageBreakdown.totalWage)}
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