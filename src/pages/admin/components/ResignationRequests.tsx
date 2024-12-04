import { useState, useEffect } from 'react';
import { employeeService } from '../../../services/employeeService';
import { resignationService } from '../../../services/resignationService';
import { discordNotifications } from '../../../utils/discord';
import { exportToCSV } from '../../../utils/csv';
import type { Employee, ResignationRequest } from '../../../types';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { ResignationFilters } from '../../../components/resignation/ResignationFilters';
import { ResignationGrid } from '../../../components/resignation/ResignationGrid';
import { formatDayMonthYear } from '../../../utils/dateTime';

export function ResignationRequests() {
  const [requests, setRequests] = useState<ResignationRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ResignationRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [resignationRequests, employeeList] = await Promise.all([
        resignationService.getAll(),
        employeeService.getAll()
      ]);
      setRequests(resignationRequests);
      setEmployees(employeeList);
      setLoading(false);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
      setLoading(false);
    }
  }

  const handleApprove = async (request: ResignationRequest) => {
    try {
      const updatedRequest = await resignationService.updateStatus(request.id, 'approved');
      setRequests(requests.map(req =>
        req.id === request.id ? updatedRequest : req
      ));
      
      const employee = employees.find(emp => emp.id === request.employeeId);
      if (employee) {
        await discordNotifications.resignationRequest(
          employee.name,
          employee.position,
          'approved',
          request.requestDate,
          request.passport,
          request.reasonIC,
          request.reasonOOC
        );
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve request');
      console.error(err);
    }
  };

  const handleReject = async (request: ResignationRequest) => {
    try {
      const updatedRequest = await resignationService.updateStatus(request.id, 'rejected');
      setRequests(requests.map(req =>
        req.id === request.id ? updatedRequest : req
      ));
      
      const employee = employees.find(emp => emp.id === request.employeeId);
      if (employee) {
        await discordNotifications.resignationRequest(
          employee.name,
          employee.position,
          'rejected',
          request.requestDate,
          request.passport,
          request.reasonIC,
          request.reasonOOC
        );
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject request');
      console.error(err);
    }
  };

  const handleDelete = async (request: ResignationRequest) => {
    if (!confirm('Are you sure you want to delete this resignation request?')) {
      return;
    }

    try {
      await resignationService.delete(request.id);
      setRequests(requests.filter(req => req.id !== request.id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete request');
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    const exportData = requests.map(request => {
      const employee = employees.find(emp => emp.id === request.employeeId);
      return {
        'Employee Name': employee?.name || 'Unknown',
        'Position': employee?.position || 'Unknown',
        'Passport': request.passport,
        'Request Date': formatDayMonthYear(request.requestDate),
        'Status': request.status.charAt(0).toUpperCase() + request.status.slice(1),
        'Created At': formatDayMonthYear(request.createdAt),
        'Reason (IC)': request.reasonIC,
        'Reason (OOC)': request.reasonOOC,
      };
    });
    exportToCSV(exportData, 'resignation-requests');
  };

  const filteredRequests = requests
    .filter(request => {
      const employee = employees.find(emp => emp.id === request.employeeId);
      const searchLower = searchQuery.toLowerCase();
      
      return (
        employee?.name.toLowerCase().includes(searchLower) ||
        employee?.position.toLowerCase().includes(searchLower) ||
        request.passport.toLowerCase().includes(searchLower) ||
        request.reasonIC.toLowerCase().includes(searchLower) ||
        request.reasonOOC.toLowerCase().includes(searchLower)
      );
    })
    .map(request => ({
      request,
      employeeName: employees.find(emp => emp.id === request.employeeId)?.name || 'Unknown',
      employeePosition: employees.find(emp => emp.id === request.employeeId)?.position || 'Unknown',
    }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#2D85B2] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="p-6 space-y-6">
        <ResignationFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onExport={handleExportCSV}
        />

        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <ResignationGrid
          requests={filteredRequests}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={handleDelete}
          onViewDetails={(request) => {
            setSelectedRequest(request);
            setShowDetailsModal(true);
          }}
        />
      </div>

      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedRequest(null);
        }}
        title="Resignation Request Details"
        footer={
          <Button
            variant="secondary"
            onClick={() => {
              setShowDetailsModal(false);
              setSelectedRequest(null);
            }}
          >
            Close
          </Button>
        }
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Passport</label>
              <p className="mt-1 text-sm text-gray-900">{selectedRequest.passport}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reason (In Character)</label>
              <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{selectedRequest.reasonIC}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reason (Out of Character)</label>
              <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{selectedRequest.reasonOOC}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Request Date</label>
              <p className="mt-1 text-sm text-gray-900">
                {formatDayMonthYear(selectedRequest.requestDate)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Submission Date</label>
              <p className="mt-1 text-sm text-gray-900">
                {formatDayMonthYear(selectedRequest.createdAt)}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}