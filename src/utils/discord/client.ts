const DISCORD_WEBHOOK_URL = import.meta.env.VITE_DISCORD_WEBHOOK_URL;
const DISCORD_RESIGNATION_WEBHOOK_URL = import.meta.env.VITE_DISCORD_RESIGNATION_WEBHOOK_URL;
const DISCORD_LEAVE_WEBHOOK_URL = import.meta.env.VITE_DISCORD_LEAVE_WEBHOOK_URL;

export async function sendDiscordEmbed(embed: any, webhookUrl: string = DISCORD_WEBHOOK_URL): Promise<void> {
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

export const webhooks = {
  default: DISCORD_WEBHOOK_URL,
  resignation: DISCORD_RESIGNATION_WEBHOOK_URL,
  leave: DISCORD_LEAVE_WEBHOOK_URL,
} as const;