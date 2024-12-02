import { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, Edit2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { employeeService } from '../../../services/employeeService';
import { workingHoursService } from '../../../services/workingHoursService';
import { exportToCSV } from '../../../utils/csv';
import { formatDuration } from '../../../utils/time';
import { TimeEditModal } from '../../../components/ui/TimeEditModal';
import { SearchBar } from '../../../components/ui/SearchBar';
import type { Employee, WorkingHours } from '../../../types';

export function TimeTracking() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<WorkingHours | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadEmployees();

    // Subscribe to working_hours changes
    const workingHoursSubscription = supabase
      .channel('working-hours-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'working_hours',
        },
        () => {
          // Reload employees data when working hours change
          loadEmployees();
        }
      )
      .subscribe();

    return () => {
      workingHoursSubscription.unsubscribe();
    };
  }, []);

  async function loadEmployees() {
    try {
      const data = await employeeService.getAll();
      setEmployees(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
      setLoading(false);
    }
  }

  const filteredTimeEntries = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    return employees.flatMap(employee => 
      employee.workingHours
        .filter(hours => hours.date.startsWith(selectedMonth))
        .filter(hours => {
          const matchesName = employee.name.toLowerCase().includes(searchLower);
          const matchesPosition = employee.position.toLowerCase().includes(searchLower);
          const matchesDate = new Date(hours.date).toLocaleDateString().toLowerCase().includes(searchLower);
          const matchesTime = new Date(hours.checkIn).toLocaleTimeString().toLowerCase().includes(searchLower) ||
                            (hours.checkOut && new Date(hours.checkOut).toLocaleTimeString().toLowerCase().includes(searchLower));
          
          return matchesName || matchesPosition || matchesDate || matchesTime;
        })
        .map(hours => ({
          hours,
          employee
        }))
    ).sort((a, b) => new Date(b.hours.date).getTime() - new Date(a.hours.date).getTime());
  }, [employees, selectedMonth, searchQuery]);

  const handleExportCSV = () => {
    const timeTrackingData = filteredTimeEntries.map(({ hours, employee }) => ({
      ...hours,
      employeeName: employee.name,
      position: employee.position
    }));
    exportToCSV(timeTrackingData, 'time-tracking');
  };

  const handleEditClick = (entry: WorkingHours, employee: Employee) => {
    setSelectedEntry({ ...entry, employeeName: employee.name });
    setShowEditModal(true);
  };

  const handleSaveTimeEntry = async (updatedEntry: WorkingHours) => {
    try {
      await workingHoursService.updateTimeEntry(updatedEntry.id, updatedEntry);
      await loadEmployees();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update time entry');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Time Tracking</h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name, position, date..."
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
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Employee</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Position</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Check In</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Check Out</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Total Hours</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTimeEntries.map(({ hours, employee }) => (
                    <tr key={hours.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        {employee.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {employee.position}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(hours.date).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(hours.checkIn).toLocaleTimeString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {hours.checkOut 
                          ? new Date(hours.checkOut).toLocaleTimeString()
                          : 'Active'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatDuration(hours.totalHours)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <button
                          onClick={() => handleEditClick(hours, employee)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <TimeEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedEntry(null);
          setError(null);
        }}
        timeEntry={selectedEntry}
        onSave={handleSaveTimeEntry}
      />
    </div>
  );
}