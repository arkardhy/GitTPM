import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }: SearchBarProps) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-[#46525A]/50" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-10 pr-3 py-2 border border-[#92C0D8] rounded-lg text-[#46525A] placeholder-[#46525A]/50 focus:ring-[#2D85B2] focus:border-[#2D85B2] sm:text-sm"
        placeholder={placeholder}
      />
    </div>
  );
}