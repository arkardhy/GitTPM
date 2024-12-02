import { useState } from 'react';
import { Clock } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import type { WorkingHours } from '../../types';

interface TimeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeEntry: WorkingHours | null;
  onSave: (updatedEntry: WorkingHours) => Promise<void>;
}

export function TimeEditModal({ isOpen, onClose, timeEntry, onSave }: TimeEditModalProps) {
  const [checkIn, setCheckIn] = useState(
    timeEntry?.checkIn ? new Date(timeEntry.checkIn).toISOString().slice(0, 16) : ''
  );
  const [checkOut, setCheckOut] = useState(
    timeEntry?.checkOut ? new Date(timeEntry.checkOut).toISOString().slice(0, 16) : ''
  );
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!timeEntry) return;
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = checkOut ? new Date(checkOut) : null;

    // Validation
    if (checkOutDate && checkInDate >= checkOutDate) {
      setError('Check-out time must be after check-in time');
      return;
    }

    const now = new Date();
    if (checkInDate > now || (checkOutDate && checkOutDate > now)) {
      setError('Cannot set times in the future');
      return;
    }

    try {
      const totalHours = checkOutDate 
        ? (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60)
        : 0;

      await onSave({
        ...timeEntry,
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate?.toISOString() || null,
        totalHours,
      });
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update time entry');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Time Entry"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
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

        <div>
          <label className="block text-sm font-medium text-gray-700">Check-in Time</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="datetime-local"
              value={checkIn}
              onChange={(e) => {
                setCheckIn(e.target.value);
                setError(null);
              }}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Check-out Time</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="datetime-local"
              value={checkOut}
              onChange={(e) => {
                setCheckOut(e.target.value);
                setError(null);
              }}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}