import { formatDayMonthYear, formatTime, formatDateTimeWithSeconds } from './dateTime';

const DISCORD_WEBHOOK_URL = import.meta.env.VITE_DISCORD_WEBHOOK_URL;
const DISCORD_RESIGNATION_WEBHOOK_URL = import.meta.env.VITE_DISCORD_RESIGNATION_WEBHOOK_URL;
const DISCORD_LEAVE_WEBHOOK_URL = import.meta.env.VITE_DISCORD_LEAVE_WEBHOOK_URL;

if (!DISCORD_WEBHOOK_URL || !DISCORD_RESIGNATION_WEBHOOK_URL || !DISCORD_LEAVE_WEBHOOK_URL) {
  console.warn('One or more Discord webhook URLs are not configured. Notifications will be disabled.');
}

const COLORS = {
  CHECK_IN: 0x00FF00, // Green
  CHECK_OUT: 0xFF0000, // Red
  LEAVE_PENDING: 0xFFA500, // Orange
  LEAVE_APPROVED: 0x00FF00, // Green
  LEAVE_REJECTED: 0xFF0000, // Red
  RESIGNATION_PENDING: 0xFFA500, // Orange
  RESIGNATION_APPROVED: 0x00FF00, // Green
  RESIGNATION_REJECTED: 0xFF0000, // Red
};

interface BaseNotification {
  employeeName: string;
  employeePosition: string;
}

interface CheckInNotification extends BaseNotification {
  date: Date;
}

interface CheckOutNotification extends BaseNotification {
  date: Date;
  totalHours: number;
}

interface LeaveNotification extends BaseNotification {
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  startDate?: string;
  endDate?: string;
}

interface ResignationNotification extends BaseNotification {
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  passport: string;
  reasonIC: string;
  reasonOOC: string;
  submissionDate: string;
}

function formatDuration(hours: number): string {
  const totalMinutes = Math.floor(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h} hours ${m} minutes`;
}

async function sendDiscordEmbed(embed: any, webhookUrl: string = DISCORD_WEBHOOK_URL): Promise<void> {
  if (!webhookUrl) {
    console.warn('Discord notification skipped: webhook URL not configured');
    return;
  }

  const payload = { embeds: [embed] };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Discord API error (${response.status}): ${errorText}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to send Discord notification:', {
        error: error.message,
        webhook: webhookUrl.split('/').slice(0, -1).join('/') + '/[REDACTED]',
        payload: JSON.stringify(payload, null, 2),
      });
    }
    throw error;
  }
}

function createCheckInEmbed({ employeeName, employeePosition, date }: CheckInNotification) {
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

function createCheckOutEmbed({ 
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

function createLeaveRequestEmbed({ 
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

function createResignationRequestEmbed({
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

export const discordNotifications = {
  async checkIn(name: string, position: string, date: Date) {
    try {
      const embed = createCheckInEmbed({
        employeeName: name,
        employeePosition: position,
        date,
      });
      await sendDiscordEmbed(embed);
    } catch (error) {
      console.error('Failed to send check-in notification:', error);
      throw error;
    }
  },

  async checkOut(name: string, position: string, date: Date, totalHours: number) {
    try {
      const embed = createCheckOutEmbed({
        employeeName: name,
        employeePosition: position,
        date,
        totalHours,
      });
      await sendDiscordEmbed(embed);
    } catch (error) {
      console.error('Failed to send check-out notification:', error);
      throw error;
    }
  },

  async leaveRequest(
    name: string, 
    position: string, 
    reason: string, 
    status: 'pending' | 'approved' | 'rejected',
    startDate?: string,
    endDate?: string,
  ) {
    try {
      const embed = createLeaveRequestEmbed({
        employeeName: name,
        employeePosition: position,
        reason,
        status,
        startDate,
        endDate,
      });
      await sendDiscordEmbed(embed, DISCORD_LEAVE_WEBHOOK_URL);
    } catch (error) {
      console.error('Failed to send leave request notification:', error);
      throw error;
    }
  },

  async resignationRequest(
    name: string,
    position: string,
    status: 'pending' | 'approved' | 'rejected',
    requestDate: string,
    passport: string,
    reasonIC: string,
    reasonOOC: string,
  ) {
    try {
      const embed = createResignationRequestEmbed({
        employeeName: name,
        employeePosition: position,
        status,
        requestDate,
        passport,
        reasonIC,
        reasonOOC,
        submissionDate: new Date().toISOString(),
      });
      await sendDiscordEmbed(embed, DISCORD_RESIGNATION_WEBHOOK_URL);
    } catch (error) {
      console.error('Failed to send resignation request notification:', error);
      throw error;
    }
  },
};