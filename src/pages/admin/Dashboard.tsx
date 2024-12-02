import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, LogOut, FileText, Calendar, Menu, X, Calculator } from 'lucide-react';
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
    <div className="min-h-screen bg-gray-100">
      <Header>
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white p-2 rounded-md hover:bg-indigo-800"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <Button
            onClick={handleLogout}
            className="ml-4"
            variant="secondary"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </Header>

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out pt-16`}
        >
          <nav className="mt-8 px-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`${
                      activeTab === item.id
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-4 py-3 text-sm font-medium rounded-md w-full transition-colors duration-150`}
                  >
                    <Icon
                      className={`${
                        activeTab === item.id ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-150`}
                    />
                    {item.name}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Main content */}
        <main
          className={`flex-1 transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'ml-64' : 'ml-0'
          } pt-16`}
        >
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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