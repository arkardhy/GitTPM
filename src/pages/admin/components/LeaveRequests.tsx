import { useState, useEffect } from 'react';
import { Check, X, Edit2, Trash2 } from 'lucide-react';
import { employeeService } from '../../../services/employeeService';
import { leaveRequestService } from '../../../services/leaveRequestService';
import { discordNotifications } from '../../../utils/discord';
import { exportToCSV } from '../../../utils/csv';
import type { Employee, LeaveRequest } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';

export function LeaveRequests() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState<LeaveRequest | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [leaveRequests, employeeList] = await Promise.all([
        leaveRequestService.getAll(),
        employeeService.getAll()
      ]);
      setRequests(leaveRequests);
      setEmployees(employeeList);
      setLoading(false);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
      setLoading(false);
    }
  }

  const handleApprove = async (request: LeaveRequest) => {
    try {
      const updatedRequest = await leaveRequestService.updateStatus(request.id, 'approved');
      setRequests(requests.map(req =>
        req.id === request.id ? updatedRequest : req
      ));
      
      const employee = employees.find(emp => emp.id === request.employeeId);
      if (employee) {
        await discordNotifications.leaveRequest(
          employee.name,
          employee.position,
          request.reason,
          'approved',
          request.startDate,
          request.endDate
        );
      }
    } catch (err) {
      setError('Failed to approve request');
      console.error(err);
    }
  };

  const handleReject = async (request: LeaveRequest) => {
    try {
      const updatedRequest = await leaveRequestService.updateStatus(request.id, 'rejected');
      setRequests(requests.map(req =>
        req.id === request.id ? updatedRequest : req
      ));
      
      const employee = employees.find(emp => emp.id === request.employeeId);
      if (employee) {
        await discordNotifications.leaveRequest(
          employee.name,
          employee.position,
          request.reason,
          'rejected',
          request.startDate,
          request.endDate
        );
      }
    } catch (err) {
      setError('Failed to reject request');
      console.error(err);
    }
  };

  const handleDelete = async (request: LeaveRequest) => {
    if (!confirm('Are you sure you want to delete this leave request?')) {
      return;
    }

    try {
      await leaveRequestService.delete(request.id);
      setRequests(requests.filter(req => req.id !== request.id));
    } catch (err) {
      setError('Failed to delete request');
      console.error(err);
    }
  };

  const handleEditClick = (request: LeaveRequest) => {
    setEditingRequest(request);
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (!editingRequest) return;

    try {
      const updatedRequest = await leaveRequestService.update(editingRequest.id, editingRequest);
      setRequests(requests.map(req =>
        req.id === updatedRequest.id ? updatedRequest : req
      ));
      
      const employee = employees.find(emp => emp.id === editingRequest.employeeId);
      if (employee) {
        await discordNotifications.leaveRequest(
          employee.name,
          employee.position,
          updatedRequest.reason,
          updatedRequest.status,
          updatedRequest.startDate,
          updatedRequest.endDate
        );
      }

      setShowEditModal(false);
      setEditingRequest(null);
    } catch (err) {
      setError('Failed to update request');
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    exportToCSV(requests, 'leave-requests');
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
          <h2 className="text-2xl font-bold text-gray-900">Permintaan Cuti</h2>
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
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Nama</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Mulai</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Sampai</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Alasan</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Rubah</th>
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
                          {new Date(request.startDate).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(request.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">{request.reason}</td>
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
                              onClick={() => handleEditClick(request)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit2 className="h-5 w-5" />
                            </button>
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
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingRequest(null);
        }}
        title="Edit Leave Request"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowEditModal(false);
                setEditingRequest(null);
              }}
            >
              Batalkan
            </Button>
            <Button variant="primary" onClick={handleEditSave}>
              Simpan Data
            </Button>
          </>
        }
      >
        {editingRequest && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Mulai</label>
              <input
                type="date"
                value={editingRequest.startDate}
                onChange={(e) => setEditingRequest({ ...editingRequest, startDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sampai</label>
              <input
                type="date"
                value={editingRequest.endDate}
                onChange={(e) => setEditingRequest({ ...editingRequest, endDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Alasan</label>
              <textarea
                value={editingRequest.reason}
                onChange={(e) => setEditingRequest({ ...editingRequest, reason: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={editingRequest.status}
                onChange={(e) => setEditingRequest({ 
                  ...editingRequest, 
                  status: e.target.value as LeaveRequest['status']
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="pending">Tertunda</option>
                <option value="approved">Disetujui</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}