import { useState } from 'react';
import { Calendar, FileText, User } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { ResignationRequest } from '../../types';

interface ResignationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<ResignationRequest, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  employeeId: string;
}

export function ResignationForm({
  isOpen,
  onClose,
  onSubmit,
  employeeId,
}: ResignationFormProps) {
  const [formData, setFormData] = useState({
    employeeId,
    passport: '',
    reasonIC: '',
    reasonOOC: '',
    requestDate: new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.passport || !formData.reasonIC || !formData.reasonOOC || !formData.requestDate) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit resignation request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Resignation Request"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Resignation'}
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

        <div>
          <label className="block text-sm font-medium text-gray-700">Passport</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={formData.passport}
              onChange={(e) => setFormData({ ...formData, passport: e.target.value })}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2D85B2] focus:border-[#2D85B2] sm:text-sm"
              placeholder="Enter your passport number"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Request Date</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              value={formData.requestDate}
              onChange={(e) => setFormData({ ...formData, requestDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2D85B2] focus:border-[#2D85B2] sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Reason (In Character)
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute top-3 left-3 pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              value={formData.reasonIC}
              onChange={(e) => setFormData({ ...formData, reasonIC: e.target.value })}
              rows={4}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2D85B2] focus:border-[#2D85B2] sm:text-sm"
              placeholder="Explain your resignation reason in character..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Reason (Out of Character)
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute top-3 left-3 pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              value={formData.reasonOOC}
              onChange={(e) => setFormData({ ...formData, reasonOOC: e.target.value })}
              rows={4}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2D85B2] focus:border-[#2D85B2] sm:text-sm"
              placeholder="Explain your resignation reason out of character..."
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}