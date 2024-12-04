import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { LeaveRequest } from '../../types';

interface LeaveRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  initialData?: Partial<LeaveRequest>;
  title: string;
  employeeId: string;
}

export function LeaveRequestForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
  employeeId,
}: LeaveRequestFormProps) {
  const [formData, setFormData] = useState({
    startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
    endDate: initialData?.endDate || new Date().toISOString().split('T')[0],
    reason: initialData?.reason || '',
    employeeId,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      setError('Please fill in all fields');
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('End date must be after start date');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit leave request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2D85B2] focus:border-[#2D85B2] sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={formData.startDate}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2D85B2] focus:border-[#2D85B2] sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Reason</label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            rows={4}
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-[#2D85B2] focus:border-[#2D85B2] sm:text-sm"
            placeholder="Please provide a detailed reason for your leave request..."
          />
        </div>
      </div>
    </Modal>
  );
}