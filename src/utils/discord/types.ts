export interface BaseNotification {
  employeeName: string;
  employeePosition: string;
}

export interface CheckInNotification extends BaseNotification {
  date: Date;
}

export interface CheckOutNotification extends BaseNotification {
  date: Date;
  totalHours: number;
}

export interface LeaveNotification extends BaseNotification {
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  startDate?: string;
  endDate?: string;
}

export interface ResignationNotification extends BaseNotification {
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  passport: string;
  reasonIC: string;
  reasonOOC: string;
  submissionDate: string;
}

export const COLORS = {
  CHECK_IN: 0x00FF00,
  CHECK_OUT: 0xFF0000,
  LEAVE_PENDING: 0xFFA500,
  LEAVE_APPROVED: 0x00FF00,
  LEAVE_REJECTED: 0xFF0000,
  RESIGNATION_PENDING: 0xFFA500,
  RESIGNATION_APPROVED: 0x00FF00,
  RESIGNATION_REJECTED: 0xFF0000,
} as const;