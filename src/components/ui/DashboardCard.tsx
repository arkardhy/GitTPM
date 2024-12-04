import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function DashboardCard({ title, value, icon: Icon, trend, className = '' }: DashboardCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#105283] text-sm font-medium mb-1">{title}</p>
          <h3 className="text-[#080A0C] text-2xl font-bold">{value}</h3>
          {trend && (
            <p className={`text-sm mt-2 flex items-center ${trend.isPositive ? 'text-[#2D85B2]' : 'text-red-500'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              <span className="text-[#706B68] ml-1">vs last month</span>
            </p>
          )}
        </div>
        <div className="bg-[#6EC7F7]/10 p-4 rounded-lg">
          <Icon className="h-6 w-6 text-[#2F8FC9]" />
        </div>
      </div>
    </div>
  );
}