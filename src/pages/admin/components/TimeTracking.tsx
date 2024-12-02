import { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, Edit2, Trash2, Plus, Upload, Download } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { employeeService } from '../../../services/employeeService';
import { workingHoursService } from '../../../services/workingHoursService';
import { exportToCSV } from '../../../utils/csv';
import { formatDuration } from '../../../utils/time';
import { formatDate, formatTime, parseDate, parseTime } from '../../../utils/dateTime';
import { TimeEntryModal } from '../../../components/ui/TimeEntryModal';
import { SearchBar } from '../../../components/ui/SearchBar';
import { Button } from '../../../components/ui/Button';
import { read, utils } from 'xlsx';
import { downloadTimeTrackingTemplate } from '../../../utils/excel/templates';
import type { Employee, WorkingHours } from '../../../types';

export function TimeTracking() {
  // ... existing state declarations remain the same ...

  const handleDownloadTemplate = () => {
    downloadTimeTrackingTemplate();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      setError(null);

      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet);

      for (const row of jsonData) {
        const {
          Name,
          Position,
          Date,
          'Check In': checkIn,
          'Check Out': checkOut,
        } = row as any;

        // Find employee by name and position
        const employee = employees.find(
          emp => emp.name === Name && emp.position === Position
        );

        if (!employee) {
          console.warn(`Employee not found: ${Name} (${Position})`);
          continue;
        }

        try {
          await workingHoursService.create(employee.id, {
            date: parseDate(Date),
            checkIn: new Date(checkIn).toISOString(),
            checkOut: checkOut ? new Date(checkOut).toISOString() : null,
            totalHours: checkOut ? 
              (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60) : 
              0,
          });
        } catch (err) {
          console.error(`Failed to import entry for ${Name}:`, err);
        }
      }

      await loadEmployees();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import data');
      console.error('Import error:', err);
    } finally {
      setImporting(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  // ... rest of the component remains the same until the buttons section ...

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
              <div className="relative">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImport}
                  className="hidden"
                  id="import-file"
                  disabled={importing}
                />
                <label
                  htmlFor="import-file"
                  className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    importing
                      ? 'bg-gray-100 cursor-not-allowed'
                      : 'bg-white hover:bg-gray-50 cursor-pointer'
                  } text-gray-700`}
                >
                  <Upload className="h-5 w-5 mr-2" />
                  {importing ? 'Importing...' : 'Import'}
                </label>
              </div>
              <Button
                onClick={handleDownloadTemplate}
                variant="secondary"
                className="inline-flex items-center"
              >
                <Download className="h-5 w-5 mr-2" />
                Template
              </Button>
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

        {/* ... rest of the component remains exactly the same ... */}
      </div>
    </div>
  );
}