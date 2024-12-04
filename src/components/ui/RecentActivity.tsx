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
        <Activity className="h-5 w-5 text-[#2F8FC9]" />
        <h2 className="text-lg font-semibold text-[#105283]">Recent Activity</h2>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div 
            key={index}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#F8FAFC] transition-colors"
          >
            <div className={`w-2 h-2 rounded-full ${
              activity.status === 'pending' ? 'bg-[#6EC7F7]' :
              activity.status === 'approved' ? 'bg-[#2D85B2]' :
              'bg-red-400'
            }`} />
            <div className="flex-1">
              <p className="text-sm text-[#105283]">
                <span className="font-medium">{activity.employee?.name}</span>
                {' '}submitted a {activity.type} request
              </p>
              <p className="text-xs text-[#706B68] mt-1">
                {formatDistanceToNow(activity.date, { addSuffix: true })}
              </p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              activity.status === 'pending' ? 'bg-[#6EC7F7]/10 text-[#206E9D]' :
              activity.status === 'approved' ? 'bg-[#2D85B2]/10 text-[#105283]' :
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