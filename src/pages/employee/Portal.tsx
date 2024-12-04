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
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#2D85B2] border-t-transparent"></div>
      </div>
    );
  }

  const isOnDuty = !!getLastDutySession();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header showNavigation={false} />

      <main className="pt-24 sm:pt-28 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
            <div className="flex flex-col items-center justify-center mb-6 sm:mb-8">
              <div className="p-3 bg-gradient-to-br from-[#105283] to-[#2D85B2] rounded-full">
                <UserCircle className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#105283] mt-4 text-center">
                Trans Check Log
              </h1>
            </div>
            
            {(dutyError || leaveError) && (
              <div className="mb-6 p-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
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
                <div className="bg-gradient-to-br from-[#105283] to-[#2D85B2] rounded-lg p-4 sm:p-6 transform transition-all duration-200 hover:scale-[1.02]">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    <div className="bg-white/10 rounded-full p-4">
                      <UserCircle className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h2 className="text-xl sm:text-2xl font-bold text-white">{selectedEmployee.name}</h2>
                      <p className="text-[#E5F2F9] opacity-90 text-sm sm:text-base">{selectedEmployee.position}</p>
                      <div className="flex items-center justify-center sm:justify-start mt-2">
                        <div className={`w-2 h-2 rounded-full ${isOnDuty ? 'bg-green-400' : 'bg-yellow-400'} mr-2`}></div>
                        <p className="text-sm text-[#E5F2F9]">
                          {isOnDuty ? "On Duty" : "Off Duty"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <EmployeeStats employee={selectedEmployee} />

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                  <Button
                    onClick={() => startDuty(selectedEmployee)}
                    disabled={isOnDuty || isDutyProcessing}
                    variant={isOnDuty ? 'secondary' : 'primary'}
                    className="h-14 relative bg-[#105283] hover:bg-[#0A3B5C] transition-all duration-200 text-sm sm:text-base"
                  >
                    {isDutyProcessing ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      </div>
                    ) : (
                      <>
                        <Clock className="h-5 w-5 mr-2" />
                        On Duty
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => endDuty(selectedEmployee)}
                    disabled={!isOnDuty || isDutyProcessing}
                    variant={!isOnDuty ? 'secondary' : 'danger'}
                    className="h-14 relative transition-all duration-200 text-sm sm:text-base"
                  >
                    {isDutyProcessing ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      </div>
                    ) : (
                      <>
                        <Clock className="h-5 w-5 mr-2" />
                        Off Duty
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowLeaveModal(true)}
                    variant="primary"
                    disabled={isDutyProcessing || isLeaveProcessing}
                    className="h-14 bg-[#2D85B2] hover:bg-[#206E9D] transition-all duration-200 text-sm sm:text-base"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Cuti
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
              className="bg-[#105283] hover:bg-[#0A3B5C]"
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
            <label className="block text-sm font-medium text-gray-700">Mulai Tanggal</label>
            <input
              type="date"
              value={leaveRequest.startDate}
              onChange={(e) => setLeaveRequest({ ...leaveRequest, startDate: e.target.value })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2D85B2] focus:ring-[#2D85B2] sm:text-sm"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sampai</label>
            <input
              type="date"
              value={leaveRequest.endDate}
              onChange={(e) => setLeaveRequest({ ...leaveRequest, endDate: e.target.value })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2D85B2] focus:ring-[#2D85B2] sm:text-sm"
              min={leaveRequest.startDate || new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Alasan</label>
            <textarea
              value={leaveRequest.reason}
              onChange={(e) => setLeaveRequest({ ...leaveRequest, reason: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2D85B2] focus:ring-[#2D85B2] sm:text-sm"
              placeholder="Berikan alasan cuti anda..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}