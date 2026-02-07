import { NextResponse } from 'next/server';
import { getNodesWithStats } from '@/lib/db';
import { getCachedOrFetch } from '@/lib/cache';
import type { ApiResponse, NodeWithStats } from '@/lib/types';

// Allow ISR caching for 30 seconds
export const revalidate = 30;

/**
 * GET /api/nodes
 * Returns all nodes in the network with their computed statistics
 */
export async function GET() {
  try {
    // Use in-memory cache to reduce function invocations (30 second TTL)
    const nodes = await getCachedOrFetch<NodeWithStats[]>('nodes', async () => {
      return getNodesWithStats();
    }, 30);

    const response = NextResponse.json<ApiResponse<NodeWithStats[]>>({
      success: true,
      data: nodes,
    });

    // Allow short caching to reduce function invocations
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');

    return response;
  } catch (error) {
    console.error('Error fetching nodes:', error);

    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: 'Failed to fetch nodes',
      },
      { status: 500 }
    );
  }
}
