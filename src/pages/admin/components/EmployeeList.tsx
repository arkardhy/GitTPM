import { useState, useEffect } from 'react';
import { UserPlus, Trash2, Edit2 } from 'lucide-react';
import { employeeService } from '../../../services/employeeService';
import { exportToCSV } from '../../../utils/csv';
import type { Employee } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';

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

const ADDITIONAL_POSITIONS = ['Eksekutif', 'Karyawan'] as const;

export function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    position: POSITIONS[0],
    additionalPositions: [] as string[],
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
        additionalPositions: newEmployee.position === 'Staff Ahli' ? newEmployee.additionalPositions : [],
        joinDate: new Date().toISOString(),
      });
      
      setEmployees([...employees, employee]);
      setShowAddModal(false);
      setNewEmployee({ name: '', position: POSITIONS[0], additionalPositions: [] });
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

  const handleDeleteEmployee = async (id: string) => {
    try {
      await employeeService.delete(id);
      setEmployees(employees.filter(emp => emp.id !== id));
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
          <h2 className="text-2xl font-bold text-gray-900">Employees</h2>
          <div className="space-x-4">
            <Button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Add Employee
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
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Position</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Additional Positions</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Join Date</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{employee.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{employee.position}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {employee.additionalPositions?.length ? (
                          <div className="flex gap-1">
                            {employee.additionalPositions.map((pos, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {pos}
                              </span>
                            ))}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(employee.joinDate).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditClick(employee)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(employee.id)}
                            className="text-red-600 hover:text-red-900"
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
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddEmployee}>
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Position</label>
            <select
              value={newEmployee.position}
              onChange={(e) => setNewEmployee({ 
                ...newEmployee, 
                position: e.target.value,
                additionalPositions: [] // Reset additional positions when changing main position
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {POSITIONS.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </div>
          {newEmployee.position === 'Staff Ahli' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Additional Positions</label>
              <div className="mt-2 space-y-2">
                {ADDITIONAL_POSITIONS.map((position) => (
                  <label key={position} className="inline-flex items-center mr-4">
                    <input
                      type="checkbox"
                      checked={newEmployee.additionalPositions.includes(position)}
                      onChange={(e) => {
                        const positions = e.target.checked
                          ? [...newEmployee.additionalPositions, position]
                          : newEmployee.additionalPositions.filter(p => p !== position);
                        setNewEmployee({ ...newEmployee, additionalPositions: positions });
                      }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{position}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
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
            <Button variant="primary" onClick={handleEditSave}>
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Position</label>
              <select
                value={editingEmployee.position}
                onChange={(e) => setEditingEmployee({ 
                  ...editingEmployee, 
                  position: e.target.value,
                  additionalPositions: [] // Reset additional positions when changing main position
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {POSITIONS.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>
            {editingEmployee.position === 'Staff Ahli' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Additional Positions</label>
                <div className="mt-2 space-y-2">
                  {ADDITIONAL_POSITIONS.map((position) => (
                    <label key={position} className="inline-flex items-center mr-4">
                      <input
                        type="checkbox"
                        checked={editingEmployee.additionalPositions?.includes(position)}
                        onChange={(e) => {
                          const positions = e.target.checked
                            ? [...(editingEmployee.additionalPositions || []), position]
                            : (editingEmployee.additionalPositions || []).filter(p => p !== position);
                          setEditingEmployee({ ...editingEmployee, additionalPositions: positions });
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{position}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}