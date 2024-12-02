import { Modal } from './Modal';
import { Button } from './Button';

interface ImportResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: {
    success: number;
    failed: number;
    errors: string[];
  };
}

export function ImportResultModal({ isOpen, onClose, results }: ImportResultModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Results"
      footer={
        <Button variant="primary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-green-800">Successful Imports</p>
            <p className="mt-1 text-2xl font-semibold text-green-600">{results.success}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-red-800">Failed Imports</p>
            <p className="mt-1 text-2xl font-semibold text-red-600">{results.failed}</p>
          </div>
        </div>

        {results.errors.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Error Details</h3>
            <div className="bg-red-50 rounded-lg p-4 max-h-60 overflow-y-auto">
              <ul className="list-disc list-inside space-y-1">
                {results.errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}