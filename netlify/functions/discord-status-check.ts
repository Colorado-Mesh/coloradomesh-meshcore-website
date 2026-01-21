import type { Config } from '@netlify/functions';

/**
 * Scheduled function to check network status and alert on changes
 * Runs every 30 minutes to reduce function invocations while still providing timely alerts
 * Only sends alerts when status actually changes (with cooldown)
 */
export default async function handler() {
  const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL;
  const webhookSecret = process.env.DISCORD_WEBHOOK_SECRET;

  if (!siteUrl || !webhookSecret) {
    // Silent return - don't spam logs if not configured
    return new Response('Not configured', { status: 200 });
  }

  try {
    const response = await fetch(`${siteUrl}/api/discord-webhook`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${webhookSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'status_check' }),
    });

    const data = await response.json();

    // Only log if an alert was actually sent
    if (data.success && data.data?.sent) {
      console.log(
        `Discord status alert sent: type=${data.data.type}, status=${data.data.status}, score=${data.data.score}`
      );
    }

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Discord status check failed:', error);
    return new Response(
      JSON.stringify({ error: 'Status check failed' }),
      { status: 500 }
    );
  }
}

// Run every 30 minutes to reduce function invocations
export const config: Config = {
  schedule: '*/30 * * * *',
};
