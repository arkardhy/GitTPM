import { SearchBar } from '../../../../components/ui/SearchBar';
import { Button } from '../../../../components/ui/Button';
import { Plus } from 'lucide-react';

interface TimeTrackingHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onAdd: () => void;
  onExport: () => void;
}

export function TimeTrackingHeader({
  searchQuery,
  onSearchChange,
  selectedMonth,
  onMonthChange,
  onAdd,
  onExport,
}: TimeTrackingHeaderProps) {
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