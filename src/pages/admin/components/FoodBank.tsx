import { useState, useEffect } from 'react';
import { Plus, History } from 'lucide-react';
import { foodService } from '../../../services/foodService';
import { employeeService } from '../../../services/employeeService';
import { exportToCSV } from '../../../utils/csv';
import { formatDateTime } from '../../../utils/dateTime';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { SearchBar } from '../../../components/ui/SearchBar';
import type { Employee, FoodItem, FoodTransaction } from '../../../types';

export function FoodBank() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [transactions, setTransactions] = useState<FoodTransaction[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(null);
  const [transactionForm, setTransactionForm] = useState({
    employeeId: '',
    supervisor: '',
    description: '',
    quantity: 0,
    transactionType: 'deposit' as const,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [items, txns, emps] = await Promise.all([
        foodService.getItems(),
        foodService.getTransactions(),
        employeeService.getAll(),
      ]);
      setFoodItems(items);
      setTransactions(txns);
      setEmployees(emps);
      setLoading(false);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
      setLoading(false);
    }
  }

  const handleCreateTransaction = async () => {
    if (!selectedFoodItem) return;

    try {
      await foodService.createTransaction({
        foodItemId: selectedFoodItem.id,
        ...transactionForm,
      });

      await loadData();
      setShowTransactionModal(false);
      setSelectedFoodItem(null);
      setTransactionForm({
        employeeId: '',
        supervisor: '',
        description: '',
        quantity: 0,
        transactionType: 'deposit',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
    }
  };

  const handleExportCSV = () => {
    const exportData = transactions.map(tx => ({
      'Item Name': foodItems.find(item => item.id === tx.foodItemId)?.name || 'Unknown',
      'Employee': employees.find(emp => emp.id === tx.employeeId)?.name || 'Unknown',
      'Supervisor': tx.supervisor,
      'Type': tx.transactionType,
      'Quantity': tx.quantity,
      'Description': tx.description || '',
      'Date': formatDateTime(tx.createdAt),
    }));

    exportToCSV(exportData, 'food-transactions');
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Food Bank</h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name..."
            />
            <div className="flex gap-4">
              <Button
                onClick={() => setShowHistoryModal(true)}
                variant="secondary"
                className="inline-flex items-center"
              >
                <History className="h-5 w-5 mr-2" />
                History
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
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Quantity</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {foodItems
                    .filter(item => 
                      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      item.type.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((item) => (
                      <tr key={item.id}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          {item.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">
                          {item.type}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <Button
                            onClick={() => {
                              setSelectedFoodItem(item);
                              setShowTransactionModal(true);
                            }}
                            size="sm"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Transaction
                          </Button>
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
        isOpen={showTransactionModal}
        onClose={() => {
          setShowTransactionModal(false);
          setSelectedFoodItem(null);
          setTransactionForm({
            employeeId: '',
            supervisor: '',
            description: '',
            quantity: 0,
            transactionType: 'deposit',
          });
        }}
        title={`New Transaction - ${selectedFoodItem?.name}`}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowTransactionModal(false);
                setSelectedFoodItem(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateTransaction}>
              Create Transaction
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Employee</label>
            <select
              value={transactionForm.employeeId}
              onChange={(e) => setTransactionForm({ ...transactionForm, employeeId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select an employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} - {employee.position}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Transaction Type</label>
            <select
              value={transactionForm.transactionType}
              onChange={(e) => setTransactionForm({ 
                ...transactionForm, 
                transactionType: e.target.value as 'deposit' | 'withdraw'
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="deposit">Deposit</option>
              <option value="withdraw">Withdraw</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              min="1"
              value={transactionForm.quantity}
              onChange={(e) => setTransactionForm({ ...transactionForm, quantity: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Supervisor</label>
            <input
              type="text"
              value={transactionForm.supervisor}
              onChange={(e) => setTransactionForm({ ...transactionForm, supervisor: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={transactionForm.description}
              onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="Transaction History"
        footer={
          <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-4">
          {transactions.map((tx) => {
            const foodItem = foodItems.find(item => item.id === tx.foodItemId);
            const employee = employees.find(emp => emp.id === tx.employeeId);
            
            return (
              <div
                key={tx.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Item</p>
                    <p className="mt-1 text-sm text-gray-900">{foodItem?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Employee</p>
                    <p className="mt-1 text-sm text-gray-900">{employee?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Type</p>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{tx.transactionType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Quantity</p>
                    <p className="mt-1 text-sm text-gray-900">{tx.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Supervisor</p>
                    <p className="mt-1 text-sm text-gray-900">{tx.supervisor}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date</p>
                    <p className="mt-1 text-sm text-gray-900">{formatDateTime(tx.createdAt)}</p>
                  </div>
                </div>
                {tx.description && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">Description</p>
                    <p className="mt-1 text-sm text-gray-900">{tx.description}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}