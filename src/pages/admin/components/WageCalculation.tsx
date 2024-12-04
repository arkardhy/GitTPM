import { useState, useMemo, useEffect } from 'react';
import { Calculator, Download, CheckCircle, Search } from 'lucide-react';
import { calculateWage, formatCurrency } from '../../../utils/wage';
import { SearchBar } from '../../../components/ui/SearchBar';
import { exportToExcel } from '../../../utils/excel';
import { markWageAsWithdrawn, getWageWithdrawals } from '../../../lib/api/wageApi';
import { WageConfirmationModal } from '../../../components/ui/WageConfirmationModal';
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

  const handleExportExcel = () => {
    const exportData = wageData.map(data => ({
      ...data,
      employee: {
        id: data.employee.id,
        name: data.employee.name,
        position: data.employee.position,
      },
      monthlyHours: data.monthlyHours,
      wageBreakdown: data.wageBreakdown,
      isFixedSalary: data.isFixedSalary,
      isWithdrawn: data.isWithdrawn,
    }));

    exportToExcel(exportData, 'wage-calculation', {
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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#105283]/10 rounded-lg">
              <Calculator className="h-6 w-6 text-[#105283]" />
            </div>
            <h2 className="text-2xl font-bold text-[#105283]">Wage Calculation</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search employees..."
              />
            </div>

            <div className="flex gap-4">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2D85B2] focus:border-transparent transition-all duration-200"
              />
              <button
                onClick={handleExportExcel}
                className="inline-flex items-center px-4 py-2 bg-[#105283] text-white rounded-lg hover:bg-[#0A3B5C] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D85B2]"
              >
                <Download className="h-5 w-5 mr-2" />
                Export Excel
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#2D85B2] border-t-transparent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                  {hasHourlyEmployees && (
                    <>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Wage</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fixed Bonus</th>
                    </>
                  )}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {wageData.map(({ employee, monthlyHours, wageBreakdown, isFixedSalary, isWithdrawn }) => (
                  <tr 
                    key={employee.id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#105283]/10 text-[#105283]">
                        {employee.position}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {isFixedSalary ? (
                        <span className="text-gray-400 italic">Fixed Salary</span>
                      ) : (
                        monthlyHours.toFixed(1)
                      )}
                    </td>
                    {hasHourlyEmployees && !isFixedSalary && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(wageBreakdown.baseWage)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                          {formatCurrency(wageBreakdown.performanceBonus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                          {formatCurrency(wageBreakdown.fixedBonus)}
                        </td>
                      </>
                    )}
                    {hasHourlyEmployees && isFixedSalary && (
                      <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 italic">
                        Fixed Monthly Salary
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-[#105283]">
                        {formatCurrency(wageBreakdown.totalWage)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isWithdrawn ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
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
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-[#2D85B2] hover:bg-[#105283] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D85B2] transition-colors duration-200"
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