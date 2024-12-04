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