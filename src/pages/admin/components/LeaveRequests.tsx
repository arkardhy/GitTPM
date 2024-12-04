import { useState, useEffect } from 'react';
import { FileText, Download, Check, X, Edit2, Trash2, Calendar } from 'lucide-react';
import { employeeService } from '../../../services/employeeService';
import { leaveRequestService } from '../../../services/leaveRequestService';
import { discordNotifications } from '../../../utils/discord';
import { exportToCSV } from '../../../utils/csv';
import type { Employee, LeaveRequest } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { SearchBar } from '../../../components/ui/SearchBar';
import { formatDayMonthYear } from '../../../utils/dateTime';

export function LeaveRequests() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState<LeaveRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredRequests = requests.filter(request => {
    const employee = employees.find(emp => emp.id === request.employeeId);
    const searchLower = searchQuery.toLowerCase();
    
    return (
      employee?.name.toLowerCase().includes(searchLower) ||
      employee?.position.toLowerCase().includes(searchLower) ||
      request.reason.toLowerCase().includes(searchLower)
    );
  });

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
      setError(null);
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
      setError(null);
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
      setError(null);
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
      setError(null);
    } catch (err) {
      setError('Failed to update request');
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    const exportData = requests.map(request => {
      const employee = employees.find(emp => emp.id === request.employeeId);
      return {
        'Employee': employee?.name || 'Unknown',
        'Position': employee?.position || 'Unknown',
        'Start Date': formatDayMonthYear(request.startDate),
        'End Date': formatDayMonthYear(request.endDate),
        'Reason': request.reason,
        'Status': request.status.charAt(0).toUpperCase() + request.status.slice(1),
        'Created At': formatDayMonthYear(request.createdAt),
      };
    });
    exportToCSV(exportData, 'leave-requests');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#2D85B2] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#105283]/10 rounded-lg">
              <Calendar className="h-6 w-6 text-[#105283]" />
            </div>
            <h2 className="text-2xl font-bold text-[#105283]">Leave Requests</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search requests..."
              />
            </div>

            <Button
              onClick={handleExportCSV}
              variant="secondary"
              className="inline-flex items-center"
            >
              <Download className="h-5 w-5 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => {
                const employee = employees.find(emp => emp.id === request.employeeId);
                return (
                  <tr 
                    key={request.id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{employee?.name || 'Unknown'}</span>
                        <span className="text-sm text-gray-500">{employee?.position}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900">{formatDayMonthYear(request.startDate)}</span>
                        <span className="text-sm text-gray-500">{formatDayMonthYear(request.endDate)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 line-clamp-2">{request.reason}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : request.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(request)}
                              className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50 transition-colors duration-200"
                              title="Approve"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleReject(request)}
                              className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors duration-200"
                              title="Reject"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleEditClick(request)}
                          className="text-[#2D85B2] hover:text-[#105283] p-1 rounded-full hover:bg-[#2D85B2]/10 transition-colors duration-200"
                          title="Edit"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(request)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors duration-200"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No leave requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
              Cancel
            </Button>
            <Button onClick={handleEditSave}>
              Save Changes
            </Button>
          </>
        }
      >
        {editingRequest && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={editingRequest.startDate}
                onChange={(e) => setEditingRequest({ ...editingRequest, startDate: e.target.value })}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-[#2D85B2] focus:border-[#2D85B2] sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={editingRequest.endDate}
                onChange={(e) => setEditingRequest({ ...editingRequest, endDate: e.target.value })}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-[#2D85B2] focus:border-[#2D85B2] sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reason</label>
              <textarea
                value={editingRequest.reason}
                onChange={(e) => setEditingRequest({ ...editingRequest, reason: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-[#2D85B2] focus:border-[#2D85B2] sm:text-sm"
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
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-[#2D85B2] focus:border-[#2D85B2] sm:text-sm"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}