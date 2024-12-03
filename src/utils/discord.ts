import { formatDayMonthYear, formatTime, formatDateTimeWithSeconds } from './dateTime';
import { formatDuration } from './time';

const DISCORD_WEBHOOK_URL = import.meta.env.VITE_DISCORD_WEBHOOK_URL;
const DISCORD_RESIGNATION_WEBHOOK_URL = import.meta.env.VITE_DISCORD_RESIGNATION_WEBHOOK_URL;
const DISCORD_LEAVE_WEBHOOK_URL = import.meta.env.VITE_DISCORD_LEAVE_WEBHOOK_URL;

const COLORS = {
  CHECK_IN: 0x00FF00,
  CHECK_OUT: 0xFF0000,
  LEAVE_PENDING: 0xFFA500,
  LEAVE_APPROVED: 0x00FF00,
  LEAVE_REJECTED: 0xFF0000,
  RESIGNATION_PENDING: 0xFFA500,
  RESIGNATION_APPROVED: 0x00FF00,
  RESIGNATION_REJECTED: 0xFF0000,
} as const;

async function sendDiscordEmbed(embed: any, webhookUrl: string = DISCORD_WEBHOOK_URL): Promise<void> {
  if (!webhookUrl) {
    console.warn('Discord notification skipped: webhook URL not configured');
    return;
  }

  const payload = { embeds: [embed] };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

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
  }
}

export const discordNotifications = {
  async checkIn(name: string, position: string, date: Date) {
    try {
      const embed = {
        title: '🟢 Mulai On Duty',
        color: COLORS.CHECK_IN,
        fields: [
          {
            name: 'Nama',
            value: name,
            inline: true,
          },
          {
            name: 'Posisi',
            value: position,
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
      await sendDiscordEmbed(embed);
    } catch (error) {
      console.error('Failed to send check-in notification:', error);
    }
  },

  async checkOut(name: string, position: string, date: Date, totalHours: number) {
    try {
      const embed = {
        title: '🔴 Off Duty',
        color: COLORS.CHECK_OUT,
        fields: [
          {
            name: 'Nama',
            value: name,
            inline: true,
          },
          {
            name: 'Posisi',
            value: position,
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
      await sendDiscordEmbed(embed);
    } catch (error) {
      console.error('Failed to send check-out notification:', error);
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

      const embed = {
        title: `📋 Pengajuan Cuti ${statusEmoji}`,
        color: statusColor,
        fields: [
          {
            name: 'Nama',
            value: name,
            inline: true,
          },
          {
            name: 'Posisi',
            value: position,
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
      await sendDiscordEmbed(embed, DISCORD_LEAVE_WEBHOOK_URL);
    } catch (error) {
      console.error('Failed to send leave request notification:', error);
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

      const embed = {
        title: `📄 Pengajuan Pengunduran Diri ${statusEmoji}`,
        color: statusColor,
        fields: [
          {
            name: 'Nama',
            value: name,
            inline: true,
          },
          {
            name: 'Posisi',
            value: position,
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
            value: formatDateTimeWithSeconds(new Date().toISOString()),
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
      await sendDiscordEmbed(embed, DISCORD_RESIGNATION_WEBHOOK_URL);
    } catch (error) {
      console.error('Failed to send resignation request notification:', error);
    }
  },
};