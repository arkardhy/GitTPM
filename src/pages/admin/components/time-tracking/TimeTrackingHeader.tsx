import { Search, Plus, Download, Upload } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';

interface TimeTrackingHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onAdd: () => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadTemplate: () => void;
  importing: boolean;
}

export function TimeTrackingHeader({
  searchQuery,
  onSearchChange,
  selectedMonth,
  onMonthChange,
  onAdd,
  onExport,
  onImport,
  onDownloadTemplate,
  importing,
}: TimeTrackingHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h2 className="text-2xl font-bold text-[#105283]">Time Tracking</h2>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-none">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D85B2] focus:border-transparent sm:text-sm"
            placeholder="Search by name, position..."
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2D85B2] focus:border-transparent sm:text-sm"
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
              className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg ${
                importing
                  ? 'bg-gray-100 cursor-not-allowed text-gray-500'
                  : 'bg-white hover:bg-gray-50 cursor-pointer text-gray-700'
              }`}
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
            className="bg-[#105283] hover:bg-[#0A3B5C] text-white inline-flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Entry
          </Button>

          <Button
            onClick={onExport}
            variant="secondary"
            className="inline-flex items-center"
          >
            <Download className="h-5 w-5 mr-2" />
            Export
          </Button>
        </div>
      </div>
    </div>
  );
}