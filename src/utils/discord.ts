import { formatDayMonthYear, formatTime, formatDateTimeWithSeconds } from './dateTime';

const DISCORD_WEBHOOK_URL = import.meta.env.VITE_DISCORD_WEBHOOK_URL;
const DISCORD_RESIGNATION_WEBHOOK_URL = import.meta.env.VITE_DISCORD_RESIGNATION_WEBHOOK_URL;
const DISCORD_LEAVE_WEBHOOK_URL = import.meta.env.VITE_DISCORD_LEAVE_WEBHOOK_URL;

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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

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
    // Don't throw the error - we don't want to break the application flow
    // if Discord notifications fail
  }
}

// Rest of the file remains unchanged...