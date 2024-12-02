import { useState, useEffect } from 'react';
import { Clock, FileText, UserCircle, Calendar } from 'lucide-react';
import { employeeService } from '../../services/employeeService';
import { leaveRequestService } from '../../services/leaveRequestService';
import { discordNotifications } from '../../utils/discord';
import { useWorkingHours } from '../../hooks/useWorkingHours';
import { Header } from '../../components/ui/Header';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { EmployeeSelect } from './components/EmployeeSelect';
import { ActivityLog } from './components/ActivityLog';
import { EmployeeStats } from './components/EmployeeStats';
import { ResignationForm } from './components/ResignationForm';
import type { Employee } from '../../types';

export function EmployeePortal() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leaveRequest, setLeaveRequest] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  });

  const loadEmployees = async () => {
    try {
      const data = await employeeService.getAll();
      setEmployees(data);
      if (selectedEmployee) {
        setSelectedEmployee(data.find(emp => emp.id === selectedEmployee.id) || null);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to load employees:', err);
      setLoading(false);
    }
  };

  const { 
    isProcessing: isDutyProcessing, 
    error: dutyError,
    startDuty,
    endDuty,
    clearError: clearDutyError,
  } = useWorkingHours(loadEmployees);

  const [isLeaveProcessing, setIsLeaveProcessing] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleLeaveRequest = async () => {
    if (!selectedEmployee?.id) {
      setLeaveError('Please select an employee first');
      return;
    }

    if (!leaveRequest.startDate || !leaveRequest.endDate || !leaveRequest.reason) {
      setLeaveError('Please fill in all leave request fields');
      return;
    }

    try {
      setIsLeaveProcessing(true);
      setLeaveError(null);

      await leaveRequestService.create({
        employeeId: selectedEmployee.id,
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
        reason: leaveRequest.reason,
      });
      
      await discordNotifications.leaveRequest(
        selectedEmployee.name,
        selectedEmployee.position,
        leaveRequest.reason,
        'pending',
        leaveRequest.startDate,
        leaveRequest.endDate
      );

      setShowLeaveModal(false);
      setLeaveRequest({ startDate: '', endDate: '', reason: '' });
    } catch (err) {
      setLeaveError(err instanceof Error ? err.message : 'Failed to submit leave request');
      console.error('Leave request error:', err);
    } finally {
      setIsLeaveProcessing(false);
    }
  };

  const getLastDutySession = () => {
    if (!selectedEmployee?.workingHours?.length) return null;
    const lastEntry = selectedEmployee.workingHours[selectedEmployee.workingHours.length - 1];
    return lastEntry && !lastEntry.checkOut ? lastEntry : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const isOnDuty = !!getLastDutySession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <Header showNavigation={false} />

      <main className="pt-16 sm:pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center mb-6">
              Employee Portal
            </h1>
            
            {(dutyError || leaveError) && (
              <div className="mb-6 p-3 sm:p-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
                {dutyError || leaveError}
              </div>
            )}

            <EmployeeSelect
              employees={employees}
              selectedEmployee={selectedEmployee}
              onSelect={setSelectedEmployee}
              onClearError={() => {
                clearDutyError();
                setLeaveError(null);
              }}
            />

            {selectedEmployee && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg p-4 sm:p-6 text-white">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <UserCircle className="h-12 w-12 sm:h-16 sm:w-16" />
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold">{selectedEmployee.name}</h2>
                      <p className="text-sm sm:text-base text-indigo-100">{selectedEmployee.position}</p>
                      <p className="text-sm mt-1 text-indigo-100">
                        Status: <span className={isOnDuty ? "text-green-300" : "text-yellow-300"}>
                          {isOnDuty ? "On Duty" : "Off Duty"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <EmployeeStats employee={selectedEmployee} />

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
                  <Button
                    onClick={() => startDuty(selectedEmployee)}
                    disabled={isOnDuty || isDutyProcessing}
                    variant={isOnDuty ? 'secondary' : 'primary'}
                    className="h-12 sm:h-14 relative"
                  >
                    {isDutyProcessing ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      </div>
                    ) : (
                      <>
                        <Clock className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                        <span className="text-sm sm:text-base">Start Duty</span>
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => endDuty(selectedEmployee)}
                    disabled={!isOnDuty || isDutyProcessing}
                    variant={!isOnDuty ? 'secondary' : 'danger'}
                    className="h-12 sm:h-14 relative"
                  >
                    {isDutyProcessing ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      </div>
                    ) : (
                      <>
                        <Clock className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                        <span className="text-sm sm:text-base">End Duty</span>
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowLeaveModal(true)}
                    variant="primary"
                    disabled={isDutyProcessing || isLeaveProcessing}
                    className="h-12 sm:h-14"
                  >
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                    <span className="text-sm sm:text-base">Request Leave</span>
                  </Button>
                  <ResignationForm 
                    employee={selectedEmployee}
                    onSuccess={loadEmployees}
                  />
                </div>

                <ActivityLog workingHours={selectedEmployee.workingHours} />
              </div>
            )}
          </div>
        </div>
      </main>

      <Modal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        title="Request Leave"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowLeaveModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleLeaveRequest}
              disabled={isLeaveProcessing}
            >
              {isLeaveProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Submit Request'
              )}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={leaveRequest.startDate}
              onChange={(e) => setLeaveRequest({ ...leaveRequest, startDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={leaveRequest.endDate}
              onChange={(e) => setLeaveRequest({ ...leaveRequest, endDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              min={leaveRequest.startDate || new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Reason</label>
            <textarea
              value={leaveRequest.reason}
              onChange={(e) => setLeaveRequest({ ...leaveRequest, reason: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Please provide a detailed reason for your leave request..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}