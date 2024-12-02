import { format } from 'date-fns';

const DISCORD_WEBHOOK_URL = import.meta.env.VITE_DISCORD_WEBHOOK_URL;

if (!DISCORD_WEBHOOK_URL) {
  console.error('Discord webhook URL is not configured');
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
}

function formatDuration(hours: number): string {
  const totalMinutes = Math.floor(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h} hours ${m} minutes`;
}

async function sendDiscordEmbed(embed: any) {
  if (!DISCORD_WEBHOOK_URL) {
    console.error('Cannot send Discord notification: webhook URL is not configured');
    return;
  }

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ embeds: [embed] }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send Discord notification: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error sending Discord notification:', error);
    throw error;
  }
}

function createCheckInEmbed({ employeeName, employeePosition, date }: CheckInNotification) {
  return {
    title: '🟢 Employee Check In',
    color: COLORS.CHECK_IN,
    fields: [
      {
        name: 'Employee',
        value: employeeName,
        inline: true,
      },
      {
        name: 'Position',
        value: employeePosition,
        inline: true,
      },
      {
        name: '\u200B',
        value: '\u200B',
        inline: true,
      },
      {
        name: 'Date',
        value: format(date, 'dd MMMM yyyy'),
        inline: true,
      },
      {
        name: 'Time',
        value: format(date, 'HH:mm:ss'),
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
    title: '🔴 Employee Check Out',
    color: COLORS.CHECK_OUT,
    fields: [
      {
        name: 'Employee',
        value: employeeName,
        inline: true,
      },
      {
        name: 'Position',
        value: employeePosition,
        inline: true,
      },
      {
        name: '\u200B',
        value: '\u200B',
        inline: true,
      },
      {
        name: 'Date',
        value: format(date, 'dd MMMM yyyy'),
        inline: true,
      },
      {
        name: 'Time',
        value: format(date, 'HH:mm:ss'),
        inline: true,
      },
      {
        name: 'Duration',
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
    ? `${format(new Date(startDate), 'dd MMMM yyyy')} - ${format(new Date(endDate), 'dd MMMM yyyy')}`
    : 'Not specified';

  return {
    title: `📋 Leave Request ${statusEmoji}`,
    color: statusColor,
    fields: [
      {
        name: 'Employee',
        value: employeeName,
        inline: true,
      },
      {
        name: 'Position',
        value: employeePosition,
        inline: true,
      },
      {
        name: '\u200B',
        value: '\u200B',
        inline: true,
      },
      {
        name: 'Date Range',
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
        name: 'Reason',
        value: reason,
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
    title: `📄 Resignation Request ${statusEmoji}`,
    color: statusColor,
    fields: [
      {
        name: 'Employee',
        value: employeeName,
        inline: true,
      },
      {
        name: 'Position',
        value: employeePosition,
        inline: true,
      },
      {
        name: '\u200B',
        value: '\u200B',
        inline: true,
      },
      {
        name: 'Request Date',
        value: format(new Date(requestDate), 'dd MMMM yyyy'),
        inline: true,
      },
      {
        name: 'Status',
        value: status.toUpperCase(),
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

export const discordNotifications = {
  async checkIn(name: string, position: string, date: Date) {
    const embed = createCheckInEmbed({
      employeeName: name,
      employeePosition: position,
      date,
    });
    await sendDiscordEmbed(embed);
  },

  async checkOut(name: string, position: string, date: Date, totalHours: number) {
    const embed = createCheckOutEmbed({
      employeeName: name,
      employeePosition: position,
      date,
      totalHours,
    });
    await sendDiscordEmbed(embed);
  },

  async leaveRequest(
    name: string, 
    position: string, 
    reason: string, 
    status: 'pending' | 'approved' | 'rejected',
    startDate?: string,
    endDate?: string,
  ) {
    const embed = createLeaveRequestEmbed({
      employeeName: name,
      employeePosition: position,
      reason,
      status,
      startDate,
      endDate,
    });
    await sendDiscordEmbed(embed);
  },

  async resignationRequest(
    name: string,
    position: string,
    status: 'pending' | 'approved' | 'rejected',
    requestDate: string,
  ) {
    const embed = createResignationRequestEmbed({
      employeeName: name,
      employeePosition: position,
      status,
      requestDate,
    });
    await sendDiscordEmbed(embed);
  },
};