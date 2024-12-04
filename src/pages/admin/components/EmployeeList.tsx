import { useState, useEffect } from 'react';
import { UserPlus, Download, Search, Edit2, Trash2 } from 'lucide-react';
import { employeeService } from '../../../services/employeeService';
import { exportToCSV } from '../../../utils/csv';
import type { Employee } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmationDialog } from '../../../components/ui/ConfirmationDialog';

const POSITIONS = [
  'Komisaris Utama',
  'Sumber Daya Manusia',
  'Bendahara',
  'Pemasaran',
  'Sekretaris',
  'Staff Ahli',
  'Eksekutif',
  'Karyawan',
  'Training'
] as const;

export function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    show: boolean;
    employee: Employee | null;
  }>({ show: false, employee: null });
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    position: POSITIONS[0],
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (err) {
      setError('Failed to load employees');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredEmployees = employees.filter(employee => {
    const searchLower = searchQuery.toLowerCase();
    return (
      employee.name.toLowerCase().includes(searchLower) ||
      employee.position.toLowerCase().includes(searchLower)
    );
  });

  const handleAddEmployee = async () => {
    try {
      const employee = await employeeService.create({
        name: newEmployee.name,
        position: newEmployee.position,
        joinDate: new Date().toISOString(),
      });
      
      setEmployees([...employees, employee]);
      setShowAddModal(false);
      setNewEmployee({ name: '', position: POSITIONS[0] });
    } catch (err) {
      setError('Failed to add employee');
      console.error(err);
    }
  };

  const handleEditClick = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (!editingEmployee) return;

    try {
      const updated = await employeeService.update(editingEmployee.id, editingEmployee);
      setEmployees(employees.map(emp => emp.id === updated.id ? updated : emp));
      setShowEditModal(false);
      setEditingEmployee(null);
    } catch (err) {
      setError('Failed to update employee');
      console.error(err);
    }
  };

  const handleDeleteClick = (employee: Employee) => {
    setDeleteConfirmation({ show: true, employee });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.employee) return;

    try {
      await employeeService.delete(deleteConfirmation.employee.id);
      setEmployees(employees.filter(emp => emp.id !== deleteConfirmation.employee?.id));
      setDeleteConfirmation({ show: false, employee: null });
    } catch (err) {
      setError('Failed to delete employee');
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    exportToCSV(employees, 'employees');
  };

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-[#105283]">Anggota</h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D85B2] focus:border-transparent sm:text-sm"
                placeholder="Search by name or position..."
              />
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-[#105283] hover:bg-[#0A3B5C] text-white inline-flex items-center"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Add Employee
              </Button>
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
        </div>

        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr 
                  key={employee.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {employee.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(employee.joinDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleEditClick(employee)}
                        className="text-[#2D85B2] hover:text-[#105283] p-2 rounded-full hover:bg-[#F8FAFC] transition-colors duration-200"
                        aria-label="Edit employee"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(employee)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
                        aria-label="Delete employee"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Employee"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEmployee}>
              Add Employee
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={newEmployee.name}
              onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-[#2D85B2] focus:ring-[#2D85B2] sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Position</label>
            <select
              value={newEmployee.position}
              onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-[#2D85B2] focus:ring-[#2D85B2] sm:text-sm"
            >
              {POSITIONS.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingEmployee(null);
        }}
        title="Edit Employee"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowEditModal(false);
                setEditingEmployee(null);
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
        {editingEmployee && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={editingEmployee.name}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-[#2D85B2] focus:ring-[#2D85B2] sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Position</label>
              <select
                value={editingEmployee.position}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, position: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-[#2D85B2] focus:ring-[#2D85B2] sm:text-sm"
              >
                {POSITIONS.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmationDialog
        isOpen={deleteConfirmation.show}
        onClose={() => setDeleteConfirmation({ show: false, employee: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Employee"
        message={`Are you sure you want to delete ${deleteConfirmation.employee?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </div>
  );
}