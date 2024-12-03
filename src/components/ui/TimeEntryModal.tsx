import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import type { Employee, WorkingHours } from '../../types';
import { formatDateForInput, formatTimeForInput, parseDateTime } from '../../utils/dateTime';

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
  const [checkInDate, setCheckInDate] = useState(
    initialData?.checkIn ? formatDateForInput(initialData.checkIn) : date
  );
  const [checkInTime, setCheckInTime] = useState(
    initialData?.checkIn ? formatTimeForInput(initialData.checkIn) : ''
  );
  const [checkOutDate, setCheckOutDate] = useState(
    initialData?.checkOut ? formatDateForInput(initialData.checkOut) : date
  );
  const [checkOutTime, setCheckOutTime] = useState(
    initialData?.checkOut ? formatTimeForInput(initialData.checkOut) : ''
  );
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSave = async () => {
    if (!employee) {
      setError('Please select an employee');
      return;
    }

    if (!date || !checkInDate || !checkInTime) {
      setError('Date and Check-in time are required');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const checkInDateTime = parseDateTime(checkInDate, checkInTime);
      const checkOutDateTime = checkOutDate && checkOutTime ? 
        parseDateTime(checkOutDate, checkOutTime) : null;

      if (checkOutDateTime && checkInDateTime >= checkOutDateTime) {
        setError('Check-out time must be after check-in time');
        return;
      }

      const totalHours = checkOutDateTime 
        ? (checkOutDateTime.getTime() - checkInDateTime.getTime()) / (1000 * 60 * 60)
        : 0;

      await onSave({
        date,
        checkIn: checkInDateTime.toISOString(),
        checkOut: checkOutDateTime?.toISOString() || null,
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
          <label className="block text-sm font-medium text-gray-700">Entry Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              // Update check-in/out dates if they haven't been modified
              if (date === checkInDate) setCheckInDate(e.target.value);
              if (date === checkOutDate) setCheckOutDate(e.target.value);
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Check-in</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <input
              type="time"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              step="1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Check-out</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <input
              type="time"
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              step="1"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}