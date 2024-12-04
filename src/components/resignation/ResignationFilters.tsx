import { Search } from 'lucide-react';
import { Button } from '../ui/Button';

interface ResignationFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onExport: () => void;
}

export function ResignationFilters({
  searchQuery,
  onSearchChange,
  onExport,
}: ResignationFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-[#105283]/10 rounded-lg">
          <Search className="h-6 w-6 text-[#105283]" />
        </div>
        <h2 className="text-2xl font-bold text-[#105283]">Resignation Requests</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
        <div className="relative flex-1 sm:w-64">
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

        <Button
          onClick={onExport}
          variant="secondary"
          className="inline-flex items-center whitespace-nowrap"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </Button>
      </div>
    </div>
  );
}