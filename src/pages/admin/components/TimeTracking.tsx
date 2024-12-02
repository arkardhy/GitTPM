import { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, Edit2, Trash2, Plus } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { employeeService } from '../../../services/employeeService';
import { workingHoursService } from '../../../services/workingHoursService';
import { exportToCSV } from '../../../utils/csv';
import { formatDuration } from '../../../utils/time';
import { TimeEntryModal } from '../../../components/ui/TimeEntryModal';
import { SearchBar } from '../../../components/ui/SearchBar';
import { Button } from '../../../components/ui/Button';
import type { Employee, WorkingHours } from '../../../types';

export function TimeTracking() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<WorkingHours | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
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
    setSelectedEntry(entry);
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  const handleDelete = async (entry: WorkingHours) => {
    if (!confirm('Are you sure you want to delete this time entry?')) {
      return;
    }

    try {
      await workingHoursService.delete(entry.id);
      await loadEmployees();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete time entry');
    }
  };

  const handleSaveTimeEntry = async (updatedEntry: Partial<WorkingHours>) => {
    try {
      if (selectedEntry) {
        await workingHoursService.updateTimeEntry(selectedEntry.id, {
          ...selectedEntry,
          ...updatedEntry,
        });
      } else if (selectedEmployee) {
        await workingHoursService.create(selectedEmployee.id, updatedEntry);
      }
      await loadEmployees();
      setError(null);
      setShowEditModal(false);
      setShowAddModal(false);
      setSelectedEntry(null);
      setSelectedEmployee(null);
    } catch (err) {
      throw err;
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
          <h2 className="text-2xl font-bold text-gray-900">Lacak Jam Kerja</h2>
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
                className="rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <Button
                onClick={() => {
                  setSelectedEntry(null);
                  setSelectedEmployee(null);
                  setShowAddModal(true);
                }}
                className="inline-flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Tambahkan
              </Button>
              <Button
                onClick={handleExportCSV}
                variant="secondary"
                className="inline-flex items-center"
              >
                Export CSV
              </Button>
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
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Nama</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Posisi</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tanggal</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">On Duty</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Off Duty</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Total Jam</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Rubah</th>
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
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditClick(hours, employee)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(hours)}
                            className="text-red-600 hover:text-red-900"
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
      </div>

      <TimeEntryModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedEntry(null);
          setSelectedEmployee(null);
          setError(null);
        }}
        title="Edit Time Entry"
        employee={selectedEmployee}
        initialData={selectedEntry || undefined}
        onSave={handleSaveTimeEntry}
      />

      <TimeEntryModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedEmployee(null);
          setError(null);
        }}
        title="Add Time Entry"
        employee={selectedEmployee}
        employees={employees}
        onEmployeeSelect={setSelectedEmployee}
        onSave={handleSaveTimeEntry}
      />
    </div>
  );
}