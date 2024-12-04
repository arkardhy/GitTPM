import { formatDistanceToNow } from 'date-fns';
import { Activity } from 'lucide-react';
import type { Employee, LeaveRequest, ResignationRequest } from '../../types';

interface RecentActivityProps {
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  resignationRequests: ResignationRequest[];
}

export function RecentActivity({
  employees,
  leaveRequests,
  resignationRequests,
}: RecentActivityProps) {
  // Combine and sort recent activities
  const activities = [
    ...leaveRequests.map(req => ({
      type: 'leave' as const,
      date: new Date(req.createdAt),
      employee: employees.find(emp => emp.id === req.employeeId),
      status: req.status,
    })),
    ...resignationRequests.map(req => ({
      type: 'resignation' as const,
      date: new Date(req.createdAt),
      employee: employees.find(emp => emp.id === req.employeeId),
      status: req.status,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime())
   .slice(0, 5);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="h-5 w-5 text-[#37b5fe]" />
        <h2 className="text-lg font-semibold text-[#010407]">Recent Activity</h2>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div 
            key={index}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className={`w-2 h-2 rounded-full ${
              activity.status === 'pending' ? 'bg-yellow-400' :
              activity.status === 'approved' ? 'bg-green-400' :
              'bg-red-400'
            }`} />
            <div className="flex-1">
              <p className="text-sm text-[#164c6c]">
                <span className="font-medium">{activity.employee?.name}</span>
                {' '}submitted a {activity.type} request
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDistanceToNow(activity.date, { addSuffix: true })}
              </p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              activity.status === 'approved' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {activity.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}