/**
 * Application-wide constants for Denver MeshCore
 */

// =============================================================================
// Site Information
// =============================================================================

export const BASE_URL = 'https://denvermc.com';
export const SITE_NAME = 'Denver MeshCore';
export const SITE_TAGLINE = 'Colorado\'s decentralized mesh network community';
export const SITE_DESCRIPTION = 'Join Colorado\'s growing mesh network community. Connect with fellow mesh enthusiasts, share knowledge, and help build resilient off-grid communication infrastructure.';

// =============================================================================
// External Links
// =============================================================================

export const DISCORD_INVITE_URL = 'https://discord.gg/QpaW8FTTCE';
export const MESHCORE_DOCS_URL = 'https://meshcore.co';
export const LETSMESH_URL = 'https://letsmesh.net';
export const GITHUB_ORG_URL = 'https://github.com/ryandonovan93';

// =============================================================================
// API Configuration
// =============================================================================

export const API_ROUTES = {
  NODES: '/api/nodes',
  STATS: '/api/stats',
  HEALTH: '/api/health',
  PACKETS: '/api/packets',
  DISCORD_WEBHOOK: '/api/discord-webhook',
} as const;

export const API_CACHE_TIMES = {
  STATS: 60, // seconds
  HEALTH: 30,
  NODES: 30,
} as const;

// =============================================================================
// Network Configuration
// =============================================================================

/** Online threshold in milliseconds (15 minutes) */
export const ONLINE_THRESHOLD_MS = 15 * 60 * 1000;

/** Repeater online threshold in milliseconds (12 hours) - matches default advert interval */
export const REPEATER_ONLINE_THRESHOLD_MS = 12 * 60 * 60 * 1000;

/** Map visibility threshold in milliseconds (24 hours) - nodes not seen within this time are hidden from map */
export const MAP_VISIBILITY_THRESHOLD_MS = 24 * 60 * 60 * 1000;

/** Default refresh interval for live data (1 minute) */
export const DEFAULT_REFRESH_INTERVAL = 60000;

/** Observer refresh interval (120 seconds) */
export const OBSERVER_REFRESH_INTERVAL = 120000;

// =============================================================================
// UI Constants
// =============================================================================

export const NODE_TYPES = ['node', 'companion', 'repeater', 'room_server', 'router', 'gateway'] as const;
export type NodeType = (typeof NODE_TYPES)[number];

export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  node: 'Node',
  companion: 'Companion',
  repeater: 'Repeater',
  room_server: 'Room Server',
  router: 'Router',
  gateway: 'Gateway',
};

export const NODE_TYPE_COLORS: Record<NodeType, string> = {
  node: 'text-sunset-500 bg-sunset-500/20',
  companion: 'text-mountain-500 bg-mountain-500/20',
  repeater: 'text-forest-500 bg-forest-500/20',
  room_server: 'text-mesh bg-mesh/20',
  router: 'text-mountain-500 bg-mountain-500/20',
  gateway: 'text-mesh bg-mesh/20',
};

// =============================================================================
// Pagination
// =============================================================================

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// =============================================================================
// Bot Configuration
// =============================================================================

/** Bot node name filtered from top_users leaderboard (automated, not a human messenger) */
export const BOT_NODE_NAME = 'denvermc.com BOT';

// =============================================================================
// Validation
// =============================================================================

export const PUBLIC_KEY_LENGTH = 64;
export const MIN_NODE_NAME_LENGTH = 1;
export const MAX_NODE_NAME_LENGTH = 50;
