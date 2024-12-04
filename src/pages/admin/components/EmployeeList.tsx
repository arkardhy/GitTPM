import { useState, useEffect } from 'react';
import { UserPlus, Trash2, Edit2 } from 'lucide-react';
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Anggota</h2>
          <div className="space-x-4">
            <Button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Tambah Data
            </Button>
            <Button
              onClick={handleExportCSV}
              variant="secondary"
              className="inline-flex items-center"
            >
              Export CSV
            </Button>
          </div>
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
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Posisi</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tanggal</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Rubah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{employee.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{employee.position}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(employee.joinDate).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleEditClick(employee)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition-colors duration-200"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(employee)}
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors duration-200"
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
        </div>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Employee"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Batalkan
            </Button>
            <Button variant="primary" onClick={handleAddEmployee}>
              Tambah Data
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama</label>
            <input
              type="text"
              value={newEmployee.name}
              onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Posisi</label>
            <select
              value={newEmployee.position}
              onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
              Batalkan
            </Button>
            <Button variant="primary" onClick={handleEditSave}>
              Simpan Data
            </Button>
          </>
        }
      >
        {editingEmployee && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama</label>
              <input
                type="text"
                value={editingEmployee.name}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Posisi</label>
              <select
                value={editingEmployee.position}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, position: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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