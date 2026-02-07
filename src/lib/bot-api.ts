/**
 * Shared bot API client for Denver MeshCore
 * Used by both /api/health and /api/stats routes
 */

import { BOT_NODE_NAME } from '@/lib/constants';

// meshcore-bot API URL (configured via environment variable)
const BOT_API_URL = process.env.BOT_API_URL;

// Cloudflare Access Service Token for bot API authentication
const CF_ACCESS_CLIENT_ID = process.env.CF_ACCESS_CLIENT_ID || '';
const CF_ACCESS_CLIENT_SECRET = process.env.CF_ACCESS_CLIENT_SECRET || '';

export interface BotStats {
  contacts_24h: number;
  contacts_7d: number;
  messages_24h: number;
  total_messages: number;
  avg_hop_count: number;
  max_hop_count: number;
  bot_reply_rate_24h: number;
  top_users: Array<{ user: string; count: number }>;
  avg_response_time_ms?: number;
}

export async function fetchBotStats(): Promise<BotStats | null> {
  if (!BOT_API_URL) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const headers: Record<string, string> = {};
    if (CF_ACCESS_CLIENT_ID && CF_ACCESS_CLIENT_SECRET) {
      headers['CF-Access-Client-Id'] = CF_ACCESS_CLIENT_ID;
      headers['CF-Access-Client-Secret'] = CF_ACCESS_CLIENT_SECRET;
    }

    // Add top_users_window=30d to get 30-day data for top_users leaderboard
    const url = new URL(BOT_API_URL);
    url.searchParams.set('top_users_window', '30d');

    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers,
      next: { revalidate: 30 },
    });

    if (!res.ok) return null;
    const data = await res.json();

    // Filter out the bot node from top_users - it's automated, not a human messenger
    const topUsers: Array<{ user: string; count: number }> = (data.top_users || [])
      .filter((u: { user: string }) => u.user !== BOT_NODE_NAME);

    return {
      contacts_24h: data.contacts_24h ?? 0,
      contacts_7d: data.contacts_7d ?? 0,
      messages_24h: data.messages_24h ?? 0,
      total_messages: data.total_messages ?? 0,
      avg_hop_count: data.avg_hop_count ?? 0,
      max_hop_count: data.max_hop_count ?? 0,
      bot_reply_rate_24h: data.bot_reply_rate_24h ?? 0,
      top_users: topUsers,
      avg_response_time_ms: data.avg_response_time_ms,
    };
  } catch (err) {
    console.warn('Failed to fetch bot stats:', err instanceof Error ? err.message : err);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
