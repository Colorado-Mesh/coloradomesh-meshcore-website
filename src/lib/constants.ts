const DEFAULT_BASE_URL = 'https://meshcore.coloradomesh.org';

const trimTrailingSlash = (url: string) => url.replace(/\/+$/, '');

export const BRAND = {
  communityName: 'Colorado Mesh',
  siteName: 'Colorado MeshCore',
  siteTitle: 'Colorado MeshCore Community Platform',
  tagline: "Colorado's decentralized MeshCore network community",
  description:
    "Join Colorado MeshCore's growing mesh network community. Connect with fellow MeshCore operators, share knowledge, and help build resilient off-grid communication infrastructure across Colorado.",
  baseUrl: trimTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_BASE_URL),
  discordInviteUrl: 'https://discord.gg/Tuuv9hGPnX',
  meshcoreDocsUrl: 'https://meshcore.io',
  letsMeshUrl: 'https://letsmesh.net',
  githubOrgUrl: 'https://github.com/Colorado-Mesh',
  logoPath: '/brand/color/mesh-color.png',
  logoMarkPath: '/brand/color/mesh-color-256.png',
  iconPath: '/favicon.ico',
} as const;

// =============================================================================
// Site Information
// =============================================================================

export const BASE_URL = BRAND.baseUrl;
export const SITE_NAME = BRAND.siteName;
export const SITE_TITLE = BRAND.siteTitle;
export const COMMUNITY_NAME = BRAND.communityName;
export const SITE_TAGLINE = BRAND.tagline;
export const SITE_DESCRIPTION = BRAND.description;
export const SITE_LOGO_PATH = BRAND.logoPath;
export const SITE_LOGO_MARK_PATH = BRAND.logoMarkPath;

// =============================================================================
// External Links
// =============================================================================

export const DISCORD_INVITE_URL = BRAND.discordInviteUrl;
export const MESHCORE_DOCS_URL = BRAND.meshcoreDocsUrl;
export const LETSMESH_URL = BRAND.letsMeshUrl;
export const GITHUB_ORG_URL = BRAND.githubOrgUrl;

// =============================================================================
// CoreScope Analyzer API Configuration
// =============================================================================

export const CORESCOPE_API_ROUTES = {
  NODES: '/api/nodes?limit=1000',
  STATS: '/api/stats',
  PACKETS: '/api/packets',
  CHANNELS: '/api/channels',
} as const;

// =============================================================================
// Network Configuration
// =============================================================================

export const ONLINE_THRESHOLD_MS = 15 * 60 * 1000;
export const REPEATER_ONLINE_THRESHOLD_MS = 12 * 60 * 60 * 1000;
export const MAP_VISIBILITY_THRESHOLD_MS = 24 * 60 * 60 * 1000;
export const DEFAULT_REFRESH_INTERVAL = 60000;

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
// Validation
// =============================================================================

export const PUBLIC_KEY_LENGTH = 64;
export const MIN_NODE_NAME_LENGTH = 1;
export const MAX_NODE_NAME_LENGTH = 50;
