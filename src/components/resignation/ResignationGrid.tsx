import { ResignationCard } from './ResignationCard';
import type { ResignationRequest } from '../../types';

interface ResignationGridProps {
  requests: Array<{
    request: ResignationRequest;
    employeeName: string;
    employeePosition: string;
  }>;
  onApprove?: (request: ResignationRequest) => void;
  onReject?: (request: ResignationRequest) => void;
  onDelete?: (request: ResignationRequest) => void;
  onViewDetails?: (request: ResignationRequest) => void;
}

export function ResignationGrid({
  requests,
  onApprove,
  onReject,
  onDelete,
  onViewDetails,
}: ResignationGridProps) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No resignation requests</h3>
        <p className="text-sm text-gray-500">No resignation requests have been submitted yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {requests.map(({ request, employeeName, employeePosition }) => (
        <ResignationCard
          key={request.id}
          request={request}
          employeeName={employeeName}
          employeePosition={employeePosition}
          onApprove={() => onApprove?.(request)}
          onReject={() => onReject?.(request)}
          onDelete={() => onDelete?.(request)}
          onViewDetails={() => onViewDetails?.(request)}
        />
      ))}
    </div>
  );
}