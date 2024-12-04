import { Users, Clock, FileText, AlertTriangle } from 'lucide-react';
import { DashboardCard } from './DashboardCard';
import type { Employee, LeaveRequest, ResignationRequest } from '../../types';

interface DashboardStatsProps {
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  resignationRequests: ResignationRequest[];
}

export function DashboardStats({ 
  employees, 
  leaveRequests, 
  resignationRequests 
}: DashboardStatsProps) {
  const activeEmployees = employees.length;
  const pendingLeaves = leaveRequests.filter(req => req.status === 'pending').length;
  const pendingResignations = resignationRequests.filter(req => req.status === 'pending').length;

  // Calculate total working hours this month
  const currentMonth = new Date().toISOString().slice(0, 7);
  const totalHours = employees.reduce((sum, emp) => {
    return sum + emp.workingHours
      .filter(h => h.date.startsWith(currentMonth))
      .reduce((total, h) => total + h.totalHours, 0);
  }, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <DashboardCard
        title="Total Employees"
        value={activeEmployees}
        icon={Users}
        trend={{ value: 12, isPositive: true }}
      />
      <DashboardCard
        title="Working Hours"
        value={`${Math.round(totalHours)}h`}
        icon={Clock}
        trend={{ value: 8, isPositive: true }}
      />
      <DashboardCard
        title="Pending Leaves"
        value={pendingLeaves}
        icon={FileText}
        className={pendingLeaves > 0 ? 'ring-2 ring-[#27acf9]/30' : ''}
      />
      <DashboardCard
        title="Pending Resignations"
        value={pendingResignations}
        icon={AlertTriangle}
        className={pendingResignations > 0 ? 'ring-2 ring-[#3cc5fd]/30' : ''}
      />
    </div>
  );
}