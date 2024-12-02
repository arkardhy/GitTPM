import { useState, useEffect } from 'react';
import { Check, X, FileText, Trash2 } from 'lucide-react';
import { employeeService } from '../../../services/employeeService';
import { resignationService } from '../../../services/resignationService';
import { discordNotifications } from '../../../utils/discord';
import { exportToCSV } from '../../../utils/csv';
import type { Employee, ResignationRequest } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';

export function ResignationRequests() {
  const [requests, setRequests] = useState<ResignationRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ResignationRequest | null>(null);

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
        'Request Date': new Date(request.requestDate).toLocaleDateString(),
        'Status': request.status.charAt(0).toUpperCase() + request.status.slice(1),
        'Created At': new Date(request.createdAt).toLocaleString(),
      };
    });
    exportToCSV(exportData, 'resignation-requests');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Resignation Requests</h2>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Export CSV
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Employee</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Position</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Request Date</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {requests.map((request) => {
                    const employee = employees.find(emp => emp.id === request.employeeId);
                    return (
                      <tr key={request.id}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          {employee?.name || 'Unknown'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {employee?.position || 'Unknown'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(request.requestDate).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              request.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : request.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {request.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowDetailsModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FileText className="h-5 w-5" />
                            </button>
                            {request.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(request)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <Check className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleReject(request)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDelete(request)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
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
              <label className="block text-sm font-medium text-gray-700">Passport Number</label>
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
                {new Date(selectedRequest.requestDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Submission Date</label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(selectedRequest.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}