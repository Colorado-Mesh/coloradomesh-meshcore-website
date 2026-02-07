import { NextResponse } from 'next/server';
import { getNetworkHealth, db } from '@/lib/db';
import { getCachedOrFetch } from '@/lib/cache';
import { fetchBotStats } from '@/lib/bot-api';
import type { BotStats } from '@/lib/bot-api';
import type { ApiResponse, NetworkHealth } from '@/lib/types';

// Allow ISR caching for 30 seconds
export const revalidate = 30;

interface GeoData {
  geo_spread_km: number;
  nodes_with_location: number;
}

/**
 * Calculate geographic spread of nodes with location data
 * Uses Haversine formula to calculate distance between furthest nodes
 */
async function calculateGeoSpread(): Promise<GeoData> {
  try {
    const result = await db.execute({
      sql: `
        SELECT latitude, longitude
        FROM nodes
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      `,
      args: [],
    });

    const nodes = result.rows.map(row => ({
      lat: row.latitude as number,
      lon: row.longitude as number,
    }));

    if (nodes.length < 2) {
      return { geo_spread_km: 0, nodes_with_location: nodes.length };
    }

    // Calculate max distance between any two nodes (Haversine formula)
    let maxDistance = 0;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const distance = haversineDistance(
          nodes[i].lat, nodes[i].lon,
          nodes[j].lat, nodes[j].lon
        );
        if (distance > maxDistance) {
          maxDistance = distance;
        }
      }
    }

    return {
      geo_spread_km: Math.round(maxDistance * 10) / 10,
      nodes_with_location: nodes.length,
    };
  } catch {
    return { geo_spread_km: 0, nodes_with_location: 0 };
  }
}

/**
 * Haversine formula to calculate distance between two lat/lon points in km
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate network health score (0-70) from 7 real components
 * Each component scores 0-10 based on actual network data.
 *
 * Components:
 * 1. Nodes Online - % of known nodes currently active (Turso)
 * 2. Signal (SNR) - Average signal-to-noise ratio (Turso)
 * 3. Packet Freshness - Time since last MQTT packet (Turso)
 * 4. Message Activity - Messages in 24h (Bot API)
 * 5. Network Reach - Max hop count seen (Bot API)
 * 6. Community - Unique human messengers in 30d (Bot API)
 * 7. Geo Coverage - Geographic spread in km (Turso)
 */
function calculateNetworkScore(
  health: NetworkHealth,
  botStats: BotStats | null,
  geoData: GeoData
): { score: number; breakdown: NonNullable<NetworkHealth['score_breakdown']> } {
  const breakdown = {
    status: 0,
    uptime: 0,
    signal: 0,
    activity: 0,
    responsiveness: 0,
    reach: 0,
    recency: 0,
    diversity: 0,
    geo_coverage: 0,
    latency: 0,
  };

  // 1. Nodes Online (status slot) - % of known nodes currently active
  // Calibrated for ~15 total nodes
  const onlinePct = health.total_nodes > 0
    ? (health.active_nodes / health.total_nodes) * 100
    : 0;
  if (onlinePct >= 70) breakdown.status = 10;
  else if (onlinePct >= 50) breakdown.status = 8;
  else if (onlinePct >= 30) breakdown.status = 6;
  else if (onlinePct >= 15) breakdown.status = 4;
  else if (onlinePct > 0) breakdown.status = 2;

  // 2. Signal Quality - SNR (signal slot)
  if (health.avg_snr !== null) {
    if (health.avg_snr >= 15) breakdown.signal = 10;
    else if (health.avg_snr >= 12) breakdown.signal = 8;
    else if (health.avg_snr >= 8) breakdown.signal = 6;
    else if (health.avg_snr >= 5) breakdown.signal = 4;
    else if (health.avg_snr >= 0) breakdown.signal = 2;
    else breakdown.signal = 1;
  }

  // 3. Packet Freshness (recency slot) - time since last MQTT packet
  if (health.last_packet_at) {
    const minutesSincePacket = (Date.now() - new Date(health.last_packet_at).getTime()) / 60000;
    if (minutesSincePacket < 5) breakdown.recency = 10;
    else if (minutesSincePacket < 15) breakdown.recency = 8;
    else if (minutesSincePacket < 30) breakdown.recency = 6;
    else if (minutesSincePacket < 60) breakdown.recency = 4;
    else if (minutesSincePacket < 120) breakdown.recency = 2;
    else breakdown.recency = 1;
  }

  // 4. Geographic Coverage (geo_coverage slot)
  // Goal: Fort Collins to Colorado Springs (~160km)
  if (geoData.geo_spread_km >= 150) breakdown.geo_coverage = 10;
  else if (geoData.geo_spread_km >= 100) breakdown.geo_coverage = 8;
  else if (geoData.geo_spread_km >= 60) breakdown.geo_coverage = 6;
  else if (geoData.geo_spread_km >= 30) breakdown.geo_coverage = 4;
  else if (geoData.geo_spread_km > 0) breakdown.geo_coverage = 2;

  if (botStats) {
    // 5. Message Activity (activity slot)
    // Calibrated for ~42 msgs/day: 40+ = 10, 20+ = 8, 10+ = 6, 5+ = 4, 1+ = 2
    if (botStats.messages_24h >= 40) breakdown.activity = 10;
    else if (botStats.messages_24h >= 20) breakdown.activity = 8;
    else if (botStats.messages_24h >= 10) breakdown.activity = 6;
    else if (botStats.messages_24h >= 5) breakdown.activity = 4;
    else if (botStats.messages_24h >= 1) breakdown.activity = 2;

    // 6. Network Reach (reach slot) - max hop count
    // Calibrated for current max 3-5 hops
    if (botStats.max_hop_count >= 6) breakdown.reach = 10;
    else if (botStats.max_hop_count >= 5) breakdown.reach = 8;
    else if (botStats.max_hop_count >= 4) breakdown.reach = 6;
    else if (botStats.max_hop_count >= 3) breakdown.reach = 4;
    else if (botStats.max_hop_count >= 2) breakdown.reach = 2;
    else if (botStats.max_hop_count >= 1) breakdown.reach = 1;

    // 7. Community / Diversity (diversity slot) - unique human messengers (30d)
    // Calibrated for ~11 human messengers
    const uniqueUsers = botStats.top_users.length;
    if (uniqueUsers >= 20) breakdown.diversity = 10;
    else if (uniqueUsers >= 15) breakdown.diversity = 8;
    else if (uniqueUsers >= 10) breakdown.diversity = 6;
    else if (uniqueUsers >= 5) breakdown.diversity = 4;
    else if (uniqueUsers >= 2) breakdown.diversity = 2;
    else if (uniqueUsers >= 1) breakdown.diversity = 1;
  } else {
    // Fallback scoring if bot is offline
    if (health.active_nodes > 0) {
      breakdown.activity = 1;
      breakdown.reach = 1;
    }
  }

  // Unused slots set to 0 for backward compatibility
  // uptime, responsiveness, latency are no longer scored

  // Calculate total score (max 70 from 7 active components), normalized to 0-100
  const totalScore = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

  return {
    score: Math.round(Math.min(100, Math.max(0, (totalScore / 70) * 100))),
    breakdown,
  };
}

/**
 * Determine network status from real signals.
 * Uses actual node availability, packet recency, and error count.
 */
function determineStatus(
  health: NetworkHealth,
  botStats: BotStats | null
): 'healthy' | 'degraded' | 'offline' {
  const hasRecentPacket = health.last_packet_at
    ? (Date.now() - new Date(health.last_packet_at).getTime()) < 60 * 60 * 1000 // within 1 hour
    : false;

  const hasActiveNodes = health.active_nodes > 0;
  const hasBotActivity = botStats !== null && botStats.messages_24h > 0;

  // Offline: no active nodes AND no recent packets AND no bot activity
  if (!hasActiveNodes && !hasRecentPacket && !hasBotActivity) {
    return 'offline';
  }

  // Healthy: multiple active nodes, recent data, low errors
  const onlinePct = health.total_nodes > 0
    ? (health.active_nodes / health.total_nodes) * 100
    : 0;

  if (hasActiveNodes && hasRecentPacket && onlinePct >= 30 && health.total_errors <= 5) {
    return 'healthy';
  }

  // Everything else is degraded
  return 'degraded';
}

export async function GET() {
  try {
    // Use in-memory cache to reduce function invocations (30 second TTL)
    const health = await getCachedOrFetch<NetworkHealth>('health', async () => {
      // Fetch DB health, bot stats, and geo data in parallel
      const [dbHealth, botStats, geoData] = await Promise.all([
        getNetworkHealth(),
        fetchBotStats(),
        calculateGeoSpread(),
      ]);

      // Merge all stats into health
      const result: NetworkHealth = {
        ...dbHealth,
        ...(botStats && {
          contacts_24h: botStats.contacts_24h,
          contacts_7d: botStats.contacts_7d,
          messages_24h: botStats.messages_24h,
          avg_hop_count: botStats.avg_hop_count,
          max_hop_count: botStats.max_hop_count,
          bot_reply_rate: botStats.bot_reply_rate_24h,
          unique_contributors: botStats.top_users.length,
          avg_response_time_ms: botStats.avg_response_time_ms,
        }),
        geo_spread_km: geoData.geo_spread_km,
        nodes_with_location: geoData.nodes_with_location,
      };

      // Ensure at least 1 active node if bot is receiving messages
      if (botStats && botStats.messages_24h > 0 && result.active_nodes === 0) {
        result.active_nodes = 1;
      }

      // Determine status from real network signals (no bot reply rate override)
      result.status = determineStatus(result, botStats);

      // Calculate comprehensive network score
      const { score, breakdown } = calculateNetworkScore(result, botStats, geoData);
      result.network_score = score;
      result.score_breakdown = breakdown;

      return result;
    }, 30);

    const response = NextResponse.json<ApiResponse<NetworkHealth>>({
      success: true,
      data: health,
    });

    // Allow short caching to reduce function invocations
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');

    return response;
  } catch (error) {
    console.error('Error fetching network health:', error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: 'Failed to fetch network health',
      },
      { status: 500 }
    );
  }
}
