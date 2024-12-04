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
          <p className="text-[#164c6c] text-sm font-medium mb-1">{title}</p>
          <h3 className="text-[#010407] text-2xl font-bold">{value}</h3>
          {trend && (
            <p className={`text-sm mt-2 flex items-center ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              <span className="text-gray-500 ml-1">vs last month</span>
            </p>
          )}
        </div>
        <div className="bg-[#37b5fe]/10 p-4 rounded-lg">
          <Icon className="h-6 w-6 text-[#37b5fe]" />
        </div>
      </div>
    </div>
  );
}