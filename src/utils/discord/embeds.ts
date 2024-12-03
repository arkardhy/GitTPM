import { formatDayMonthYear, formatTime, formatDateTimeWithSeconds } from '../dateTime';
import { formatDuration } from '../time';
import { COLORS } from './types';
import type { 
  CheckInNotification, 
  CheckOutNotification, 
  LeaveNotification, 
  ResignationNotification 
} from './types';

export function createCheckInEmbed({ employeeName, employeePosition, date }: CheckInNotification) {
  return {
    title: '🟢 Mulai On Duty',
    color: COLORS.CHECK_IN,
    fields: [
      {
        name: 'Nama',
        value: employeeName,
        inline: true,
      },
      {
        name: 'Posisi',
        value: employeePosition,
        inline: true,
      },
      {
        name: '\u200B',
        value: '\u200B',
        inline: true,
      },
      {
        name: 'Tanggal',
        value: formatDayMonthYear(date),
        inline: true,
      },
      {
        name: 'Waktu',
        value: formatTime(date),
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

export function createCheckOutEmbed({ 
  employeeName, 
  employeePosition, 
  date, 
  totalHours 
}: CheckOutNotification) {
  return {
    title: '🔴 Off Duty',
    color: COLORS.CHECK_OUT,
    fields: [
      {
        name: 'Nama',
        value: employeeName,
        inline: true,
      },
      {
        name: 'Posisi',
        value: employeePosition,
        inline: true,
      },
      {
        name: '\u200B',
        value: '\u200B',
        inline: true,
      },
      {
        name: 'Tanggal',
        value: formatDayMonthYear(date),
        inline: true,
      },
      {
        name: 'Waktu',
        value: formatTime(date),
        inline: true,
      },
      {
        name: 'Total Durasi',
        value: formatDuration(totalHours),
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

export function createLeaveRequestEmbed({ 
  employeeName, 
  employeePosition, 
  reason, 
  status,
  startDate,
  endDate,
}: LeaveNotification) {
  const statusEmoji = {
    pending: '⏳',
    approved: '✅',
    rejected: '❌',
  }[status];

  const statusColor = {
    pending: COLORS.LEAVE_PENDING,
    approved: COLORS.LEAVE_APPROVED,
    rejected: COLORS.LEAVE_REJECTED,
  }[status];

  const dateDisplay = startDate && endDate
    ? `${formatDayMonthYear(startDate)} - ${formatDayMonthYear(endDate)}`
    : 'Not specified';

  return {
    title: `📋 Pengajuan Cuti ${statusEmoji}`,
    color: statusColor,
    fields: [
      {
        name: 'Nama',
        value: employeeName,
        inline: true,
      },
      {
        name: 'Posisi',
        value: employeePosition,
        inline: true,
      },
      {
        name: '\u200B',
        value: '\u200B',
        inline: true,
      },
      {
        name: 'Tanggal',
        value: dateDisplay,
        inline: true,
      },
      {
        name: 'Status',
        value: status.toUpperCase(),
        inline: true,
      },
      {
        name: '\u200B',
        value: '\u200B',
        inline: true,
      },
      {
        name: 'Alasan',
        value: reason || 'Not provided',
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

export function createResignationRequestEmbed({
  employeeName,
  employeePosition,
  status,
  requestDate,
  passport,
  reasonIC,
  reasonOOC,
  submissionDate,
}: ResignationNotification) {
  const statusEmoji = {
    pending: '⏳',
    approved: '✅',
    rejected: '❌',
  }[status];

  const statusColor = {
    pending: COLORS.RESIGNATION_PENDING,
    approved: COLORS.RESIGNATION_APPROVED,
    rejected: COLORS.RESIGNATION_REJECTED,
  }[status];

  return {
    title: `📄 Pengajuan Pengunduran Diri ${statusEmoji}`,
    color: statusColor,
    fields: [
      {
        name: 'Nama',
        value: employeeName,
        inline: true,
      },
      {
        name: 'Posisi',
        value: employeePosition,
        inline: true,
      },
      {
        name: '\u200B',
        value: '\u200B',
        inline: true,
      },
      {
        name: 'Passport',
        value: passport,
        inline: true,
      },
      {
        name: 'Status',
        value: status.toUpperCase(),
        inline: true,
      },
      {
        name: '\u200B',
        value: '\u200B',
        inline: true,
      },
      {
        name: 'Tanggal Pengajuan',
        value: formatDayMonthYear(requestDate),
        inline: true,
      },
      {
        name: 'Tanggal Permintaan',
        value: formatDateTimeWithSeconds(submissionDate),
        inline: true,
      },
      {
        name: '\u200B',
        value: '\u200B',
        inline: true,
      },
      {
        name: 'Alasan (In Character)',
        value: reasonIC || 'Not provided',
      },
      {
        name: 'Alasan (Out of Character)',
        value: reasonOOC || 'Not provided',
      },
    ],
    timestamp: new Date().toISOString(),
  };
}