import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import type { Employee, WorkingHours } from '../../types';

interface TimeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Partial<WorkingHours>) => Promise<void>;
  employee: Employee | null;
  employees?: Employee[];
  onEmployeeSelect?: (employee: Employee | null) => void;
  title: string;
  initialData?: Partial<WorkingHours>;
}

export function TimeEntryModal({ 
  isOpen, 
  onClose, 
  onSave, 
  employee,
  employees,
  onEmployeeSelect,
  title,
  initialData 
}: TimeEntryModalProps) {
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().slice(0, 10));
  const [checkIn, setCheckIn] = useState(initialData?.checkIn?.slice(11, 16) || '');
  const [checkOut, setCheckOut] = useState(initialData?.checkOut?.slice(11, 16) || '');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSave = async () => {
    if (!employee) {
      setError('Please select an employee');
      return;
    }

    if (!date || !checkIn) {
      setError('Date and Check-in time are required');
      return;
    }

    const checkInDate = new Date(`${date}T${checkIn}`);
    const checkOutDate = checkOut ? new Date(`${date}T${checkOut}`) : null;

    if (checkOutDate && checkInDate >= checkOutDate) {
      setError('Check-out time must be after check-in time');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const totalHours = checkOutDate 
        ? (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60)
        : 0;

      await onSave({
        date,
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate?.toISOString() || null,
        totalHours,
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save time entry');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave}
            disabled={isProcessing}
          >
            {isProcessing ? 'Saving...' : 'Save'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {employees && onEmployeeSelect && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Employee</label>
            <select
              value={employee?.id || ''}
              onChange={(e) => {
                const selected = employees.find(emp => emp.id === e.target.value);
                onEmployeeSelect(selected || null);
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Select an employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} - {emp.position}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Check-in Time</label>
          <input
            type="time"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Check-out Time</label>
          <input
            type="time"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>
    </Modal>
  );
}