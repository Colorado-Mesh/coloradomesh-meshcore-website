import { NextResponse } from 'next/server';
import { getCommunityStats } from '@/lib/db';
import { getCachedOrFetch } from '@/lib/cache';
import { fetchBotStats } from '@/lib/bot-api';
import type { ApiResponse, CommunityStats } from '@/lib/types';

// Allow ISR caching for 30 seconds
export const revalidate = 30;

export async function GET() {
  try {
    // Use in-memory cache to reduce function invocations (30 second TTL)
    const stats = await getCachedOrFetch<CommunityStats>('stats', async () => {
      // Fetch both DB stats and bot stats in parallel
      const [dbStats, botStats] = await Promise.all([
        getCommunityStats(),
        fetchBotStats(),
      ]);

      // Merge stats
      return {
        ...dbStats,
        ...(botStats && {
          contacts_24h: botStats.contacts_24h,
          contacts_7d: botStats.contacts_7d,
          messages_24h: botStats.messages_24h,
          total_messages: botStats.total_messages,
          avg_hop_count: botStats.avg_hop_count,
          max_hop_count: botStats.max_hop_count,
          bot_reply_rate_24h: botStats.bot_reply_rate_24h,
          top_users: botStats.top_users,
        }),
      };
    }, 30);

    const response = NextResponse.json<ApiResponse<CommunityStats>>({
      success: true,
      data: stats,
    });

    // Allow short caching to reduce function invocations
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');

    return response;
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: 'Failed to fetch community stats',
      },
      { status: 500 }
    );
  }
}
