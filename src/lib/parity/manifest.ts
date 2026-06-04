export type ParityDomain =
  | 'utilities'
  | 'repeater-config'
  | 'serial-usb'
  | 'prefix-matrix'
  | 'corescope-api'
  | 'corescope-ui'
  | 'docker'
  | 'ci';

export type ParityStatus = 'implemented' | 'partial' | 'planned' | 'deferred' | 'out-of-scope';

export interface ParitySourceRef {
  label: string;
  url?: string;
  path?: string;
}

export interface ParityCoverageRef {
  type: 'unit' | 'e2e' | 'manual' | 'ci' | 'review';
  ref: string;
}

export interface ParityItem {
  id: string;
  domain: ParityDomain;
  title: string;
  upstream: ParitySourceRef[];
  local: string[];
  status: ParityStatus;
  coverage: ParityCoverageRef[];
  notes: string;
}

export const PARITY_MANIFEST: ParityItem[] = [
  {
    id: 'utilities-repeater-settings-json',
    domain: 'repeater-config',
    title: 'Repeater settings JSON download parity',
    upstream: [
      {
        label: 'meshcore-utilities-site repeater template',
        url: 'https://github.com/Colorado-Mesh/meshcore-utilities-site',
        path: 'vendor/meshcore-utilities-site/templates/repeater-name-tool.html',
      },
      {
        label: 'meshcore-utilities-site recommended settings data',
        path: 'vendor/meshcore-utilities-site/static/data/recommended_settings.json',
      },
      {
        label: 'meshcore-utilities-site regions data',
        path: 'vendor/meshcore-utilities-site/static/data/regions.json',
      },
    ],
    local: [
      'src/components/NamingWizard.tsx',
      'src/lib/upstream-utilities/generated/recommended-settings.json',
      'src/lib/upstream-utilities/generated/airports.json',
      'src/lib/upstream-utilities/generated/counties.json',
      'src/lib/upstream-utilities/generated/mountains.json',
      'src/lib/upstream-utilities/generated/municipalities.json',
      'src/lib/upstream-utilities/generated/unincorporated_areas.json',
      'src/lib/meshcore-data/settings.ts',
      'src/lib/meshcore-data/regions.ts',
      'src/lib/meshcore-data/node-types.ts',
      'src/lib/meshcore-tools/naming.ts',
      'src/lib/meshcore-tools/config-export.ts',
    ],
    status: 'implemented',
    coverage: [
      { type: 'unit', ref: 'src/lib/meshcore-tools/__tests__/config-export.test.ts' },
    ],
    notes: 'Generates deterministic MeshCore repeater settings JSON from validated naming inputs, canonical radio defaults, region list, selected node type, and safe filenames without private keys.',
  },
  {
    id: 'utilities-companion-settings-json',
    domain: 'utilities',
    title: 'Companion settings JSON download parity',
    upstream: [
      {
        label: 'meshcore-utilities-site companion template',
        url: 'https://github.com/Colorado-Mesh/meshcore-utilities-site',
        path: 'vendor/meshcore-utilities-site/templates/companion-name-tool.html',
      },
    ],
    local: [
      'src/components/CompanionNamer.tsx',
      'src/lib/upstream-utilities/generated/recommended-settings.json',
      'src/lib/meshcore-data/settings.ts',
      'src/lib/meshcore-tools/naming.ts',
      'src/lib/meshcore-tools/config-export.ts',
    ],
    status: 'implemented',
    coverage: [
      { type: 'unit', ref: 'src/lib/meshcore-tools/__tests__/config-export.test.ts' },
    ],
    notes: 'Generates deterministic companion settings JSON from validated emoji/handle/suffix inputs while preserving the 23-character MeshCore name limit and safe filenames without private keys.',
  },
  {
    id: 'prefix-matrix-4-character-planning',
    domain: 'prefix-matrix',
    title: 'Four-character PrefixMatrix planning with reserved/collision logic',
    upstream: [
      {
        label: 'meshcore-utilities-site prefix matrix',
        url: 'https://github.com/Colorado-Mesh/meshcore-utilities-site',
        path: 'vendor/meshcore-utilities-site/static/js/prefix_matrix.js',
      },
    ],
    local: [
      'src/lib/meshcore-tools/prefixes.ts',
      'src/components/PrefixMatrix.tsx',
      'src/components/NamingWizard.tsx',
      'src/app/tools/prefix-matrix/page.tsx',
    ],
    status: 'implemented',
    coverage: [
      { type: 'unit', ref: 'src/lib/meshcore-tools/__tests__/prefixes.test.ts' },
      { type: 'e2e', ref: 'tests/e2e/smoke.spec.ts (/tools/prefix-matrix)' },
    ],
    notes: 'PrefixMatrix and NamingWizard share `buildPrefixAnalysis` over normalized CoreScope `/api/nodes?limit=1000` analyzer data, render a primary 16×16 first-byte grid plus a 4-character subgrid, surface reserved/duplicate/repeater-collision states, and offer a deterministic Suggest Free Prefix. The reserved-prefix list is intentionally small and typed locally; expand only with a documented upstream source.',
  },
  {
    id: 'serial-usb-settings-json-apply',
    domain: 'serial-usb',
    title: 'Guarded serial application of generated settings JSON',
    upstream: [
      {
        label: 'meshcore-utilities-site serial command profile',
        path: 'vendor/meshcore-utilities-site/static/data/default_serial_commands.json',
      },
      {
        label: 'meshcore-utilities-site serial command schema',
        path: 'vendor/meshcore-utilities-site/serial_commands.schema.json',
      },
    ],
    local: [
      'src/components/tools/SerialUsbTool.tsx',
      'src/lib/upstream-utilities/generated/serial-command-profile.json',
      'src/lib/upstream-utilities/generated/serial-command-schema.json',
      'src/lib/tools/serial-commands.ts',
      'src/lib/meshcore-tools/serial-settings.ts',
    ],
    status: 'implemented',
    coverage: [
      { type: 'unit', ref: 'src/lib/meshcore-tools/__tests__/serial-settings.test.ts' },
      { type: 'e2e', ref: 'tests/e2e/smoke.spec.ts (/tools/serial-usb)' },
    ],
    notes: 'Settings JSON can be pasted or uploaded for an explicit command preview and confirmation-gated apply flow. Only locally documented name/radio write commands are auto-applied; node type, role, region, owner info, companion metadata, and other unverified keys remain visible as unsupported manual-review fields.',
  },
  {
    id: 'corescope-analyzer-api-consumer',
    domain: 'corescope-api',
    title: 'CoreScope analyzer API consumer',
    upstream: [
      {
        label: 'CoreScope API server',
        url: 'https://github.com/Kpa-clawbot/CoreScope',
        path: 'cmd/server',
      },
    ],
    local: [
      'src/hooks/useMapSnapshot.ts',
      'src/lib/map/normalize.ts',
      'src/lib/constants.ts',
      'src/components/StatsSection.tsx',
    ],
    status: 'implemented',
    coverage: [
      { type: 'unit', ref: 'src/lib/map/__tests__/normalize.test.ts' },
      { type: 'e2e', ref: 'tests/e2e/smoke.spec.ts (/tools/prefix-matrix, /tools/repeater-name)' },
    ],
    notes: 'Site tools consume CoreScope `/api/nodes?limit=1000` and `/api/stats` directly, normalize analyzer nodes into local MapNode types, and no longer expose or depend on Next `/api/map/*` or `/api/live-map/*` compatibility routes.',
  },
  {
    id: 'corescope-full-analyzer-ui',
    domain: 'corescope-ui',
    title: 'Same-container CoreScope map and analyzer UI',
    upstream: [
      {
        label: 'CoreScope public app',
        url: 'https://github.com/Kpa-clawbot/CoreScope',
        path: 'public',
      },
    ],
    local: ['vendor/CoreScope', 'corescope-overlay/*', 'docker/nginx.conf'],
    status: 'implemented',
    coverage: [
      { type: 'e2e', ref: 'tests/e2e/smoke.spec.ts (/map)' },
      { type: 'review', ref: '.forge/reviews/claude-step-4.json' },
    ],
    notes: 'Docker serves CoreScope directly at `/map`, defaults to the polished Colorado Mesh live-map shell, and keeps full analyzer routes such as `#/nodes`, `#/packets`, `#/channels`, and `#/perf` available without a redirect.',
  },
  {
    id: 'docker-corescope-single-container-topology',
    domain: 'docker',
    title: 'Docker topology for Next site plus same-container CoreScope',
    upstream: [
      {
        label: 'CoreScope runtime',
        url: 'https://github.com/Kpa-clawbot/CoreScope',
      },
    ],
    local: ['Dockerfile', 'compose.yaml', '.env.example', 'scripts/docker-smoke.mjs'],
    status: 'implemented',
    coverage: [
      { type: 'ci', ref: '.github/workflows/ci.yml docker-smoke' },
      { type: 'manual', ref: 'docker compose config' },
    ],
    notes: 'Docker build/run smoke validates one image with nginx, Next, CoreScope server, optional CoreScope ingestor, overlay assets, sound assets, CoreScope API routes, and 404s for removed Next map compatibility APIs.',
  },
  {
    id: 'ci-pr-quality-gates',
    domain: 'ci',
    title: 'PR CI quality gates for parity, accessibility, Lighthouse, build, and Docker smoke',
    upstream: [],
    local: ['.github/workflows/ci.yml', '.github/workflows/security.yml', 'package.json', 'scripts/docker-smoke.mjs'],
    status: 'implemented',
    coverage: [
      { type: 'ci', ref: '.github/workflows/ci.yml quality' },
      { type: 'ci', ref: '.github/workflows/ci.yml browser-smoke' },
      { type: 'ci', ref: '.github/workflows/ci.yml accessibility' },
      { type: 'ci', ref: '.github/workflows/ci.yml lighthouse' },
      { type: 'ci', ref: '.github/workflows/ci.yml docker-smoke' },
      { type: 'ci', ref: '.github/workflows/security.yml dependency-review' },
    ],
    notes: 'PR CI now blocks on utilities submodule health, generated utility artifact freshness, lint, typecheck, unit tests, production build, Chromium critical smoke, axe accessibility, Lighthouse budgets, dependency review, Docker image build, and Docker runtime smoke without publishing images.',
  },
  {
    id: 'utilities-route-compatibility',
    domain: 'utilities',
    title: 'Upstream utility route compatibility redirects',
    upstream: [
      {
        label: 'meshcore-utilities-site app and blueprints',
        url: 'https://github.com/Colorado-Mesh/meshcore-utilities-site',
        path: 'vendor/meshcore-utilities-site/app.py',
      },
      {
        label: 'meshcore-utilities-site repeater route',
        path: 'vendor/meshcore-utilities-site/backend/api/routes/repeater_name_tool/index.py',
      },
      {
        label: 'meshcore-utilities-site companion route',
        path: 'vendor/meshcore-utilities-site/backend/api/routes/companion_name_tool/index.py',
      },
      {
        label: 'meshcore-utilities-site prefix matrix route',
        path: 'vendor/meshcore-utilities-site/backend/api/routes/prefix_matrix/index.py',
      },
      {
        label: 'meshcore-utilities-site serial USB route',
        path: 'vendor/meshcore-utilities-site/backend/api/routes/serial_usb_tool/index.py',
      },
    ],
    local: ['next.config.js', 'src/app/tools/page.tsx', 'tests/e2e/smoke.spec.ts'],
    status: 'implemented',
    coverage: [
      { type: 'e2e', ref: 'tests/e2e/smoke.spec.ts (upstream utility route compatibility)' },
    ],
    notes: 'Known upstream public GET utility page paths permanently redirect to canonical local `/tools/*` routes while POST submit endpoints, contacts export, static files, and upstream internals remain out of scope.',
  },
  {
    id: 'contacts-export',
    domain: 'utilities',
    title: 'Contacts export endpoint',
    upstream: [
      {
        label: 'meshcore-utilities-site contacts export',
        url: 'https://github.com/Colorado-Mesh/meshcore-utilities-site',
        path: 'backend/api/services/contacts.py',
      },
    ],
    local: [],
    status: 'out-of-scope',
    coverage: [{ type: 'review', ref: '.forge/PROJECT.md Follow-up Q&A #9' }],
    notes: 'User explicitly chose to leave public contacts export out for this pass.',
  },
];
