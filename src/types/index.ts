export interface Employee {
  id: string;
  name: string;
  position: string;
  additionalPositions?: string[];
  joinDate: string;
  warnings: Warning[];
  workingHours: WorkingHours[];
}

export interface Warning {
  id: string;
  date: string;
  message: string;
}

export interface WorkingHours {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  totalHours: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface ResignationRequest {
  id: string;
  employeeId: string;
  passport: string;
  reasonIC: string;
  reasonOOC: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}