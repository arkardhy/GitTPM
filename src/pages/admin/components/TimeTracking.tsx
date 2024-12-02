import { useState, useEffect } from 'react';
import { employeeService } from '../../../services/employeeService';
import { workingHoursService } from '../../../services/workingHoursService';
import { importTimeEntries } from '../../../services/time-tracking/timeTrackingService';
import { exportToCSV } from '../../../utils/csv';
import { downloadTimeTrackingTemplate } from '../../../utils/excel/templates';
import { TimeEntryModal } from '../../../components/ui/TimeEntryModal';
import { TimeEntryList } from '../../../components/time-tracking/TimeEntryList';
import { TimeEntryToolbar } from '../../../components/time-tracking/TimeEntryToolbar';
import type { Employee, WorkingHours } from '../../../types';

export function TimeTracking() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [searchQuery, setSearchQuery] = useState('');
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<WorkingHours | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (err) {
      setError('Failed to load employees');
      console.error(err);
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      setError(null);
      await importTimeEntries(file, employees);
      await loadEmployees();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import data');
      console.error('Import error:', err);
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  const handleExportCSV = () => {
    const exportData = employees.flatMap(employee =>
      employee.workingHours
        .filter(hours => hours.date.startsWith(selectedMonth))
        .map(hours => ({
          hours,
          employeeName: employee.name,
          position: employee.position,
        }))
    );
    exportToCSV(exportData, 'time-tracking');
  };

  const handleEditEntry = async (entry: WorkingHours) => {
    setSelectedEntry(entry);
    setShowAddModal(true);
  };

  const handleDeleteEntry = async (entry: WorkingHours) => {
    if (!confirm('Are you sure you want to delete this time entry?')) {
      return;
    }

    try {
      await workingHoursService.delete(entry.id);
      await loadEmployees();
    } catch (err) {
      setError('Failed to delete time entry');
      console.error(err);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const searchLower = searchQuery.toLowerCase();
    return (
      employee.name.toLowerCase().includes(searchLower) ||
      employee.position.toLowerCase().includes(searchLower) ||
      employee.workingHours.some(hours =>
        hours.date.toLowerCase().includes(searchLower)
      )
    );
  });

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <TimeEntryToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          onImport={handleImport}
          onDownloadTemplate={downloadTimeTrackingTemplate}
          onAdd={() => {
            setSelectedEntry(null);
            setSelectedEmployee(null);
            setShowAddModal(true);
          }}
          onExport={handleExportCSV}
          importing={importing}
        />

        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {filteredEmployees.map(employee => (
          <div key={employee.id} className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {employee.name} - {employee.position}
            </h3>
            <TimeEntryList
              entries={employee.workingHours.filter(hours =>
                hours.date.startsWith(selectedMonth)
              )}
              employeeName={employee.name}
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}
            />
          </div>
        ))}

        <TimeEntryModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedEntry(null);
            setSelectedEmployee(null);
          }}
          onSave={async (entry) => {
            try {
              if (selectedEntry) {
                await workingHoursService.updateTimeEntry(selectedEntry.id, entry);
              } else if (selectedEmployee) {
                await workingHoursService.create(selectedEmployee.id, entry);
              }
              await loadEmployees();
              setShowAddModal(false);
              setSelectedEntry(null);
              setSelectedEmployee(null);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to save time entry');
            }
          }}
          employee={selectedEmployee}
          employees={employees}
          onEmployeeSelect={setSelectedEmployee}
          title={selectedEntry ? 'Edit Time Entry' : 'Add Time Entry'}
          initialData={selectedEntry || undefined}
        />
      </div>
    </div>
  );
}