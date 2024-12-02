import { useState, useMemo, useEffect } from 'react';
import { Calculator, Download, CheckCircle } from 'lucide-react';
import { calculateWage, formatCurrency } from '../../../utils/wage';
import { SearchBar } from '../../../components/ui/SearchBar';
import { exportToExcel } from '../../../utils/excel';
import { markWageAsWithdrawn, getWageWithdrawals } from '../../../lib/api/wageApi';
import { WageConfirmationModal } from '../../../components/ui/WageConfirmationModal';
import type { Employee } from '../../../types';
import type { WageExportData } from '../../../utils/excel/types';

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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<{
    id: string;
    name: string;
    position: string;
    amount: number;
  } | null>(null);
  const [withdrawnEmployees, setWithdrawnEmployees] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadWithdrawals();
  }, [selectedMonth]);

  const loadWithdrawals = async () => {
    try {
      setLoading(true);
      const withdrawals = await getWageWithdrawals(selectedMonth);
      setWithdrawnEmployees(new Set(withdrawals.map(w => w.employee_id)));
    } catch (error) {
      console.error('Failed to load wage withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

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
          employee: {
            id: employee.id,
            name: employee.name,
            position: employee.position,
          },
          monthlyHours,
          wageBreakdown,
          isFixedSalary: FIXED_SALARY_POSITIONS.includes(employee.position),
          isWithdrawn: withdrawnEmployees.has(employee.id),
        };
      })
      .sort((a, b) => b.wageBreakdown.totalWage - a.wageBreakdown.totalWage);
  }, [employees, selectedMonth, searchQuery, withdrawnEmployees]);

  const handleExportCSV = () => {
    exportToExcel(wageData, 'wage-calculation', {
      filename: `wage_calculation_${selectedMonth}`,
      sheetName: 'Wage Calculation',
    });
  };

  const handleWithdraw = async () => {
    if (!selectedEmployee) return;

    try {
      await markWageAsWithdrawn(
        selectedEmployee.id,
        selectedEmployee.amount,
        selectedMonth
      );
      await loadWithdrawals();
      setShowConfirmation(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error('Failed to mark wage as withdrawn:', error);
      throw error;
    }
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
                Export Excel
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Nama</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Posisi</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Total Jam</th>
                      {hasHourlyEmployees && (
                        <>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Gaji</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Bonus</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Bonus Tetap</th>
                        </>
                      )}
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Total</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {wageData.map(({ employee, monthlyHours, wageBreakdown, isFixedSalary, isWithdrawn }) => (
                      <tr key={employee.id}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          {employee.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {employee.position}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {isFixedSalary ? (
                            <span className="italic text-gray-400">Gaji Tetap</span>
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
                            Gaji Tetap Tiap Bulan
                          </td>
                        )}
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-indigo-600">
                          {formatCurrency(wageBreakdown.totalWage)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          {isWithdrawn ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Withdrawn
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedEmployee({
                                  id: employee.id,
                                  name: employee.name,
                                  position: employee.position,
                                  amount: wageBreakdown.totalWage,
                                });
                                setShowConfirmation(true);
                              }}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Withdraw
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedEmployee && (
        <WageConfirmationModal
          isOpen={showConfirmation}
          onClose={() => {
            setShowConfirmation(false);
            setSelectedEmployee(null);
          }}
          employeeName={selectedEmployee.name}
          position={selectedEmployee.position}
          amount={selectedEmployee.amount}
          onConfirm={handleWithdraw}
        />
      )}
    </div>
  );
}