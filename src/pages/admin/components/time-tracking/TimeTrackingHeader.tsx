import { Search, Plus, Download } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';

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
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <h2 className="text-2xl font-bold text-[#105283]">Lacak Jam Kerja</h2>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-none">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-[#46525A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D85B2] focus:border-transparent sm:text-sm"
            placeholder="Search by name, position..."
          />
        </div>

        <div className="flex gap-4">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-[#46525A] focus:outline-none focus:ring-2 focus:ring-[#2D85B2] focus:border-transparent sm:text-sm"
          />
          
          <Button
            onClick={onAdd}
            className="bg-[#105283] hover:bg-[#0A3B5C] text-white inline-flex items-center px-4 py-2 rounded-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Tambahkan
          </Button>

          <Button
            onClick={onExport}
            variant="secondary"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-[#46525A] bg-white hover:bg-gray-50 rounded-lg"
          >
            <Download className="h-5 w-5 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>
    </div>
  );
}