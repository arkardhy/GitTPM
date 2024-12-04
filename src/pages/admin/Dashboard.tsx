import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, LogOut, FileText, Calendar, Calculator, X } from 'lucide-react';
import { storage } from '../../utils/storage';
import { employeeService } from '../../services/employeeService';
import { EmployeeList } from './components/EmployeeList';
import { LeaveRequests } from './components/LeaveRequests';
import { TimeTracking } from './components/TimeTracking';
import { ResignationRequests } from './components/ResignationRequests';
import { WageCalculation } from './components/WageCalculation';
import { Header } from '../../components/ui/Header';
import { Button } from '../../components/ui/Button';
import type { Employee } from '../../types';

type Tab = 'employees' | 'leave-requests' | 'time-tracking' | 'resignation-requests' | 'wage-calculation';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('employees');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (err) {
      console.error('Failed to load employees:', err);
    }
  }

  const handleLogout = () => {
    storage.clearAdminToken();
    navigate('/admin/login');
  };

  const navItems = [
    {
      id: 'employees' as Tab,
      name: 'Employees',
      icon: Users,
    },
    {
      id: 'leave-requests' as Tab,
      name: 'Leave Requests',
      icon: FileText,
    },
    {
      id: 'time-tracking' as Tab,
      name: 'Time Tracking',
      icon: Calendar,
    },
    {
      id: 'resignation-requests' as Tab,
      name: 'Resignation Requests',
      icon: FileText,
    },
    {
      id: 'wage-calculation' as Tab,
      name: 'Pay Wage',
      icon: Calculator,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onLogout={handleLogout}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex h-screen pt-16 sm:pt-20">
        {/* Sidebar for mobile */}
        <div
          className={`fixed inset-0 z-40 lg:hidden ${
            sidebarOpen ? 'block' : 'hidden'
          }`}
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </div>

        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between h-16 sm:h-20 px-4 border-b border-gray-200">
              <span className="text-lg font-semibold text-gray-900">Admin Portal</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`${
                      activeTab === item.id
                        ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-3 py-3 text-sm font-medium rounded-md w-full transition-all duration-200`}
                  >
                    <Icon
                      className={`${
                        activeTab === item.id ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 h-5 w-5 flex-shrink-0`}
                    />
                    {item.name}
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-gray-200 lg:hidden">
              <Button
                onClick={handleLogout}
                variant="secondary"
                className="w-full"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {activeTab === 'employees' && <EmployeeList />}
            {activeTab === 'leave-requests' && <LeaveRequests />}
            {activeTab === 'time-tracking' && <TimeTracking />}
            {activeTab === 'resignation-requests' && <ResignationRequests />}
            {activeTab === 'wage-calculation' && <WageCalculation employees={employees} />}
          </div>
        </main>
      </div>
    </div>
  );
}