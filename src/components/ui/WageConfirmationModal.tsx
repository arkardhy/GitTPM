import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { formatCurrency } from '../../utils/wage';

interface WageConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeName: string;
  position: string;
  amount: number;
  onConfirm: () => Promise<void>;
}

export function WageConfirmationModal({
  isOpen,
  onClose,
  employeeName,
  position,
  amount,
  onConfirm,
}: WageConfirmationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process wage withdrawal');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Wage Withdrawal Confirmation"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Confirm Withdrawal'}
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

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Employee</p>
              <p className="mt-1 text-sm text-gray-900">{employeeName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Position</p>
              <p className="mt-1 text-sm text-gray-900">{position}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">Amount to Withdraw</p>
            <p className="mt-1 text-lg font-semibold text-indigo-600">
              {formatCurrency(amount)}
            </p>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          <p>Please confirm that you want to mark this wage as withdrawn.</p>
          <p className="mt-2">This action cannot be undone.</p>
        </div>
      </div>
    </Modal>
  );
}