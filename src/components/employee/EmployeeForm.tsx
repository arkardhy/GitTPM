import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { Employee } from '../../types';

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Employee, 'id' | 'warnings' | 'workingHours'>) => Promise<void>;
  initialData?: Partial<Employee>;
  title: string;
}

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

export function EmployeeForm({ isOpen, onClose, onSubmit, initialData, title }: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    position: initialData?.position || POSITIONS[0],
    joinDate: initialData?.joinDate || new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.position || !formData.joinDate) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save employee');
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
            {isSubmitting ? 'Saving...' : 'Save'}
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
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2D85B2] focus:ring-[#2D85B2] sm:text-sm"
            placeholder="Enter employee name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Position</label>
          <select
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2D85B2] focus:ring-[#2D85B2] sm:text-sm"
          >
            {POSITIONS.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Join Date</label>
          <input
            type="date"
            value={formData.joinDate}
            onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2D85B2] focus:ring-[#2D85B2] sm:text-sm"
          />
        </div>
      </div>
    </Modal>
  );
}