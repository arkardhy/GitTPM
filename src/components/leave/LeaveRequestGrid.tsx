import { LeaveRequestCard } from './LeaveRequestCard';
import type { LeaveRequest } from '../../types';

interface LeaveRequestGridProps {
  requests: Array<{
    request: LeaveRequest;
    employeeName: string;
  }>;
  onApprove?: (request: LeaveRequest) => void;
  onReject?: (request: LeaveRequest) => void;
  onEdit?: (request: LeaveRequest) => void;
  onDelete?: (request: LeaveRequest) => void;
}

export function LeaveRequestGrid({
  requests,
  onApprove,
  onReject,
  onEdit,
  onDelete,
}: LeaveRequestGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {requests.map(({ request, employeeName }) => (
        <LeaveRequestCard
          key={request.id}
          request={request}
          employeeName={employeeName}
          onApprove={() => onApprove?.(request)}
          onReject={() => onReject?.(request)}
          onEdit={() => onEdit?.(request)}
          onDelete={() => onDelete?.(request)}
        />
      ))}
    </div>
  );
}