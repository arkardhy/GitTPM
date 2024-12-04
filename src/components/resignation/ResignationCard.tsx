import { FileText, Calendar, User } from 'lucide-react';
import type { ResignationRequest } from '../../types';
import { formatDayMonthYear, formatDateTime } from '../../utils/dateTime';

interface ResignationCardProps {
  request: ResignationRequest;
  employeeName: string;
  employeePosition: string;
  onApprove?: () => void;
  onReject?: () => void;
  onDelete?: () => void;
  onViewDetails?: () => void;
}

export function ResignationCard({
  request,
  employeeName,
  employeePosition,
  onApprove,
  onReject,
  onDelete,
  onViewDetails,
}: ResignationCardProps) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-[#105283] to-[#2D85B2] rounded-full p-3">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{employeeName}</h3>
              <p className="text-sm text-gray-500">{employeePosition}</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${statusColors[request.status]}`}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
            </div>
          </div>

          <div className="flex space-x-2">
            {request.status === 'pending' && (
              <>
                <button
                  onClick={onApprove}
                  className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-50 transition-colors duration-200"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={onReject}
                  className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </>
            )}
            <button
              onClick={onViewDetails}
              className="text-[#2D85B2] hover:text-[#105283] p-2 rounded-full hover:bg-[#F8FAFC] transition-colors duration-200"
            >
              <FileText className="h-5 w-5" />
            </button>
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs font-medium text-gray-500">Request Date</p>
              <p className="text-sm text-gray-900">{formatDayMonthYear(request.requestDate)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs font-medium text-gray-500">Passport</p>
              <p className="text-sm text-gray-900">{request.passport}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500">Submitted</p>
          <p className="mt-1 text-sm text-gray-900">{formatDateTime(request.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}