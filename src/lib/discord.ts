/**
 * Discord webhook integration for Colorado MeshCore
 * Handles message formatting and delivery to Discord channels
 */

import type {
  NetworkHealth,
  DiscordEmbed,
  DiscordWebhookPayload,
  DiscordNotificationType,
  HealthStatus,
} from './types';
import { SITE_NAME } from './constants';

// =============================================================================
// Constants
// =============================================================================

/** Discord embed color codes */
export const DISCORD_COLORS = {
  healthy: 0x57f287, // Green
  degraded: 0xfee75c, // Yellow
  offline: 0xed4245, // Red
  info: 0x5865f2, // Blurple
} as const;

/** Status emoji mapping */
const STATUS_EMOJI: Record<HealthStatus, string> = {
  healthy: ':green_circle:',
  degraded: ':yellow_circle:',
  offline: ':red_circle:',
};

/** Alert cooldown in milliseconds (5 minutes) */
export const DISCORD_ALERT_COOLDOWN_MS = 5 * 60 * 1000;

/** Score change threshold to trigger alert */
export const DISCORD_SCORE_CHANGE_THRESHOLD = 15;

/** Node count drop threshold to trigger alert */
export const DISCORD_NODE_DROP_THRESHOLD = 2;

// =============================================================================
// Embed Builders
// =============================================================================

/**
 * Build a scheduled health summary embed
 */
export function buildHealthSummaryEmbed(health: NetworkHealth): DiscordEmbed {
  const status = health.status;
  const score = health.network_score ?? 0;

  return {
    title: `${STATUS_EMOJI[status]} Colorado MeshCore Network Status`,
    description: getStatusDescription(status, score),
    color: DISCORD_COLORS[status],
    fields: [
      {
        name: ':bar_chart: Network Score',
        value: `**${score}/100**`,
        inline: true,
      },
      {
        name: ':satellite: Active Nodes',
        value: `**${health.active_nodes}** / ${health.total_nodes}`,
        inline: true,
      },
      {
        name: ':chart_with_upwards_trend: Uptime',
        value: `**${health.uptime_pct}%**`,
        inline: true,
      },
      {
        name: ':signal_strength: Signal Quality',
        value: formatSignalQuality(health.avg_snr, health.avg_rssi),
        inline: true,
      },
      {
        name: ':earth_americas: Coverage',
        value: formatCoverage(health.geo_spread_km, health.nodes_with_location),
        inline: true,
      },
      {
        name: ':incoming_envelope: Activity (24h)',
        value: formatActivity(health.messages_24h, health.contacts_24h),
        inline: true,
      },
      ...(health.score_breakdown ? [buildScoreBreakdownField(health.score_breakdown)] : []),
    ],
    footer: {
      text: `${SITE_NAME} | meshcore.coloradomesh.org`,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Build a status change alert embed
 */
export function buildStatusChangeEmbed(
  previousStatus: HealthStatus,
  currentHealth: NetworkHealth,
  notificationType: DiscordNotificationType
): DiscordEmbed {
  const current = currentHealth.status;
  const isImprovement = getStatusPriority(current) < getStatusPriority(previousStatus);

  let title: string;
  let description: string;

  switch (notificationType) {
    case 'recovery':
      title = ':tada: Network Recovery';
      description = `Network has recovered from **${previousStatus}** to **${current}**`;
      break;
    case 'node_offline':
      title = ':warning: Node Activity Alert';
      description = `Active node count dropped. Network status: **${current}**`;
      break;
    default:
      title = isImprovement
        ? ':arrow_up: Network Status Improved'
        : ':arrow_down: Network Status Degraded';
      description = `Status changed from **${previousStatus}** to **${current}**`;
  }

  return {
    title,
    description,
    color: DISCORD_COLORS[current],
    fields: [
      {
        name: 'Current Status',
        value: `${STATUS_EMOJI[current]} **${current.toUpperCase()}**`,
        inline: true,
      },
      {
        name: 'Network Score',
        value: `**${currentHealth.network_score ?? 0}/100**`,
        inline: true,
      },
      {
        name: 'Active Nodes',
        value: `**${currentHealth.active_nodes}**`,
        inline: true,
      },
    ],
    footer: {
      text: `${SITE_NAME} | View details at meshcore.coloradomesh.org`,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Build the full webhook payload
 */
export function buildWebhookPayload(
  embed: DiscordEmbed,
  mentionEveryone: boolean = false
): DiscordWebhookPayload {
  return {
    username: 'MeshCore Monitor',
    content: mentionEveryone ? '@everyone' : undefined,
    embeds: [embed],
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

function getStatusDescription(status: HealthStatus, score: number): string {
  if (status === 'healthy' && score >= 70) {
    return 'The Colorado MeshCore network is operating optimally.';
  }
  if (status === 'healthy') {
    return 'The network is healthy but could be performing better.';
  }
  if (status === 'degraded') {
    return 'The network is experiencing degraded performance. Some services may be affected.';
  }
  return 'The network is currently offline or unreachable.';
}

function getStatusPriority(status: HealthStatus): number {
  const priorities: Record<HealthStatus, number> = {
    healthy: 0,
    degraded: 1,
    offline: 2,
  };
  return priorities[status];
}

function formatSignalQuality(snr: number | null, rssi: number | null): string {
  if (snr === null && rssi === null) return 'No data';
  const parts: string[] = [];
  if (snr !== null) parts.push(`SNR: ${snr.toFixed(1)} dB`);
  if (rssi !== null) parts.push(`RSSI: ${rssi.toFixed(0)} dBm`);
  return parts.join('\n');
}

function formatCoverage(geoSpread: number | undefined, nodesWithLocation: number | undefined): string {
  if (!geoSpread) return 'No location data';
  return `${geoSpread.toFixed(1)} km\n${nodesWithLocation ?? 0} nodes mapped`;
}

function formatActivity(messages: number | undefined, contacts: number | undefined): string {
  const msgStr = messages !== undefined ? `${messages} messages` : 'N/A';
  const contactStr = contacts !== undefined ? `${contacts} nodes heard` : 'N/A';
  return `${msgStr}\n${contactStr}`;
}

function buildScoreBreakdownField(
  breakdown: NonNullable<NetworkHealth['score_breakdown']>
): { name: string; value: string; inline: boolean } {
  const components = [
    `Nodes: ${breakdown.status}/10`,
    `Signal: ${breakdown.signal}/10`,
    `Freshness: ${breakdown.recency}/10`,
    `Activity: ${breakdown.activity}/10`,
    `Reach: ${breakdown.reach}/10`,
    `Community: ${breakdown.diversity}/10`,
    `Coverage: ${breakdown.geo_coverage}/10`,
  ];
  return {
    name: ':clipboard: Score Breakdown',
    value: components.join(' | '),
    inline: false,
  };
}

// =============================================================================
// Webhook Delivery
// =============================================================================

/**
 * Send a message to the Discord webhook
 */
export async function sendDiscordWebhook(
  webhookUrl: string,
  payload: DiscordWebhookPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Discord returns 429 for rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        return {
          success: false,
          error: `Rate limited. Retry after ${retryAfter ?? 'unknown'} seconds`,
        };
      }

      const errorText = await response.text();
      return {
        success: false,
        error: `Discord API error: ${response.status} - ${errorText}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if enough time has passed since the last alert
 */
export function canSendAlert(lastAlertSent: string | null): boolean {
  if (!lastAlertSent) return true;
  const lastAlertTime = new Date(lastAlertSent).getTime();
  return Date.now() - lastAlertTime >= DISCORD_ALERT_COOLDOWN_MS;
}

/**
 * Determine if a status change warrants an alert
 */
export function shouldAlert(
  previousStatus: HealthStatus,
  previousScore: number,
  previousNodes: number,
  currentHealth: NetworkHealth
): { shouldAlert: boolean; type: DiscordNotificationType } {
  const currentScore = currentHealth.network_score ?? 0;

  // Status changed
  if (previousStatus !== currentHealth.status) {
    if (currentHealth.status === 'healthy' && previousStatus !== 'healthy') {
      return { shouldAlert: true, type: 'recovery' };
    }
    return { shouldAlert: true, type: 'status_change' };
  }

  // Significant score drop
  if (previousScore - currentScore >= DISCORD_SCORE_CHANGE_THRESHOLD) {
    return { shouldAlert: true, type: 'status_change' };
  }

  // Significant node count drop
  if (previousNodes - currentHealth.active_nodes >= DISCORD_NODE_DROP_THRESHOLD) {
    return { shouldAlert: true, type: 'node_offline' };
  }

  return { shouldAlert: false, type: 'scheduled' };
}
