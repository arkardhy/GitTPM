import { Plus, Upload, Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { SearchBar } from '../ui/SearchBar';

interface TimeEntryToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadTemplate: () => void;
  onAdd: () => void;
  onExport: () => void;
  importing: boolean;
}

export function TimeEntryToolbar({
  searchQuery,
  onSearchChange,
  selectedMonth,
  onMonthChange,
  onImport,
  onDownloadTemplate,
  onAdd,
  onExport,
  importing,
}: TimeEntryToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Lacak Jam Kerja</h2>
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search by name, position, date..."
        />
        <div className="flex gap-4">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <div className="relative">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={onImport}
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
            onClick={onDownloadTemplate}
            variant="secondary"
            className="inline-flex items-center"
          >
            <Download className="h-5 w-5 mr-2" />
            Template
          </Button>
          <Button
            onClick={onAdd}
            className="inline-flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Tambahkan
          </Button>
          <Button
            onClick={onExport}
            variant="secondary"
            className="inline-flex items-center"
          >
            Export CSV
          </Button>
        </div>
      </div>
    </div>
  );
}