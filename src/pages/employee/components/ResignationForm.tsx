import { useState } from 'react';
import { FileText } from 'lucide-react';
import { resignationService } from '../../../services/resignationService';
import { discordNotifications } from '../../../utils/discord';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import type { Employee } from '../../../types';

interface ResignationFormProps {
  employee: Employee;
  onSuccess: () => void;
}

export function ResignationForm({ employee, onSuccess }: ResignationFormProps) {
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    passport: '',
    reasonIC: '',
    reasonOOC: '',
    requestDate: new Date().toISOString().slice(0, 10),
  });

  const handleSubmit = async () => {
    if (!formData.passport || !formData.reasonIC || !formData.reasonOOC || !formData.requestDate) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      await resignationService.create({
        employeeId: employee.id,
        passport: formData.passport,
        reasonIC: formData.reasonIC,
        reasonOOC: formData.reasonOOC,
        requestDate: formData.requestDate,
      });

      await discordNotifications.resignationRequest(
        employee.name,
        employee.position,
        'pending',
        formData.requestDate,
        formData.passport,
        formData.reasonIC,
        formData.reasonOOC
      );

      setShowModal(false);
      setFormData({
        passport: '',
        reasonIC: '',
        reasonOOC: '',
        requestDate: new Date().toISOString().slice(0, 10),
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit resignation request');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        variant="danger"
        className="h-12 sm:h-14"
      >
        <FileText className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
        <span className="text-sm sm:text-base">Request Resignation</span>
      </Button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Submit Resignation Request"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Submit Request'
              )}
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
            <label className="block text-sm font-medium text-gray-700">Passport Number</label>
            <input
              type="text"
              value={formData.passport}
              onChange={(e) => setFormData({ ...formData, passport: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter your passport number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Reason (In Character)
            </label>
            <textarea
              value={formData.reasonIC}
              onChange={(e) => setFormData({ ...formData, reasonIC: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Explain your resignation reason in character..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Reason (Out of Character)
            </label>
            <textarea
              value={formData.reasonOOC}
              onChange={(e) => setFormData({ ...formData, reasonOOC: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Explain your resignation reason out of character..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Request Date</label>
            <input
              type="date"
              value={formData.requestDate}
              onChange={(e) => setFormData({ ...formData, requestDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}