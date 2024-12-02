import { useState, useEffect, useMemo } from 'react';
import { employeeService } from '../../../services/employeeService';
import { workingHoursService } from '../../../services/workingHoursService';
import { exportToCSV } from '../../../utils/csv';
import { TimeEntryModal } from '../../../components/ui/TimeEntryModal';
import type { Employee, WorkingHours } from '../../../types';
import { TimeTrackingHeader } from './time-tracking/TimeTrackingHeader';
import { TimeTrackingTable } from './time-tracking/TimeTrackingTable';

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
          const matchesDate = hours.date.toLowerCase().includes(searchLower);
          
          return matchesName || matchesPosition || matchesDate;
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
        <TimeTrackingHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          onAdd={() => {
            setSelectedEntry(null);
            setSelectedEmployee(null);
            setShowAddModal(true);
          }}
          onExport={handleExportCSV}
        />

        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <TimeTrackingTable
          entries={filteredTimeEntries}
          onEdit={handleEditClick}
          onDelete={handleDelete}
        />
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