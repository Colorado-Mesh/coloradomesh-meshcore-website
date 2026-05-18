import type { Metadata } from 'next';
import Link from 'next/link';

import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import { HeroPanel, SectionEyebrow, ToolCard } from '@/components/brand';
import {
  BASE_URL,
  COMMUNITY_NAME,
  DISCORD_INVITE_URL,
  SITE_NAME,
} from '@/lib/constants';
import { generateBreadcrumbSchema } from '@/lib/schemas/breadcrumb';
import { UPSTREAM_UTILITIES_PROVENANCE } from '@/lib/upstream-utilities';

const PAGE_TITLE = 'Operator Tools';
const PAGE_DESCRIPTION = `Naming, prefix planning, and field utilities for ${SITE_NAME} operators. Plan names, find a free public-key prefix, and talk to a node over USB serial directly from the browser.`;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: '/tools',
  },
  openGraph: {
    title: `${PAGE_TITLE} | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    url: `${BASE_URL}/tools`,
    siteName: SITE_NAME,
  },
  twitter: {
    title: `${PAGE_TITLE} | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
  },
};

const breadcrumbData = generateBreadcrumbSchema([
  { name: 'Home', url: BASE_URL },
  { name: PAGE_TITLE, url: `${BASE_URL}/tools` },
]);
const upstreamUtilitiesCommit = UPSTREAM_UTILITIES_PROVENANCE.upstreamCommit.slice(0, 7);

const guideHandoffs = [
  {
    href: '/guides/naming-standard',
    label: 'Naming standard',
    description: 'Reference guide behind the repeater and companion name builders.',
  },
  {
    href: '/guides/repeater-setup',
    label: 'Repeater setup',
    description: 'Profiles, TX/RX delays, and serial preflight before deploying a repeater.',
  },
  {
    href: '/guides/radio-settings',
    label: 'Radio settings',
    description: 'Frequencies, presets, and channels used by every Front Range node.',
  },
] as const;

export default function ToolsPage() {
  return (
    <>
      <JsonLd data={breadcrumbData} />

      <div className="min-h-screen">
        <HeroPanel
          background="topo-grid"
          showMountains={false}
          eyebrow="Operator Console"
          title={
            <>
              {COMMUNITY_NAME}
              <span className="block text-mesh">operator tools</span>
            </>
          }
          description={PAGE_DESCRIPTION}
          actions={
            <>
              <Link href="/tools/repeater-name" className="btn-primary">
                Name a repeater
              </Link>
              <Link href="/tools/prefix-matrix" className="btn-secondary">
                Check a prefix
              </Link>
              <Link href="/tools/serial-usb" className="btn-outline">
                Serial console
              </Link>
            </>
          }
          meta={
            <div className="panel px-5 sm:px-6 py-4 backdrop-blur-md bg-card/85">
              <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                <Breadcrumbs
                  items={[{ label: 'Home', href: '/' }, { label: PAGE_TITLE }]}
                />
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.7rem] mono uppercase tracking-[0.18em] text-foreground-dim">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="status-dot status-dot-pulse" aria-hidden />
                    Live data
                  </span>
                  <span className="hidden sm:inline-block w-px h-3 bg-card-border" aria-hidden />
                  <span>4 first-class tools</span>
                  <span className="hidden sm:inline-block w-px h-3 bg-card-border" aria-hidden />
                  <span>
                    Upstream <span className="text-mesh normal-case tracking-normal">{upstreamUtilitiesCommit}</span>
                  </span>
                </div>
              </div>
            </div>
          }
        />

        <section className="relative z-10 px-4 sm:px-6 lg:px-8 pb-14 -mt-10">
          <div className="mx-auto max-w-7xl">
            <SectionHeader
              tone="mesh"
              eyebrow="Naming & Identity"
              title="Name your nodes."
              description={`Compose standards-aligned identifiers for repeaters and companion devices that fit MeshCore’s 23-character limit and the ${COMMUNITY_NAME} naming convention.`}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <ToolCard
                tone="mesh"
                glyph="◈"
                tag="REPEATER NAMING"
                title="Repeater name wizard"
                description="Build a standards-aligned repeater name from region, city, landmark, and node type. Includes live conflict checks against the live network map."
                href="/tools/repeater-name"
                headingLevel="h3"
              />
              <ToolCard
                tone="sky"
                glyph="◇"
                tag="COMPANION NAMING"
                title="Companion name builder"
                description="Compose your personal companion identity with emoji, handle, and an identification suffix. Stays under the 23-character MeshCore limit."
                href="/tools/companion-name"
                headingLevel="h3"
              />
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 pb-14">
          <div className="mx-auto max-w-7xl">
            <SectionHeader
              tone="sunset"
              eyebrow="Network Planning"
              title="Plan keys and coverage."
              description={
                <>
                  Coordinate keys and coverage before you flash a new node. Inspect occupied address
                  space and pair planning with the{' '}
                  <Link
                    href="/map"
                    className="text-mesh hover:text-mesh-light underline underline-offset-2"
                  >
                    Live Map
                  </Link>
                  .
                </>
              }
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <ToolCard
                tone="sunset"
                glyph="◊"
                tag="PREFIX PLANNING"
                title="Public-key prefix matrix"
                description={`Visualize the 256-cell first-byte prefix space across ${COMMUNITY_NAME}. Find free prefixes before generating a new key.`}
                href="/tools/prefix-matrix"
                headingLevel="h3"
              />
              <ToolCard
                tone="sky"
                glyph="◎"
                tag="LIVE STATUS"
                title="Network status map"
                description="Open the CoreScope-backed live map for current node freshness, packet flow, coverage, and conflicts before you generate keys or pick a site."
                href="/map"
                headingLevel="h3"
              />
              <ToolCard
                tone="mesh"
                glyph="◉"
                tag="FULL ANALYZER"
                title="CoreScope analyzer"
                description={`Use the full analyzer views for per-node link quality, neighbors, packets, channels, and routing across ${COMMUNITY_NAME}.`}
                href="/map#/nodes"
                headingLevel="h3"
              />
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 pb-14">
          <div className="mx-auto max-w-7xl">
            <SectionHeader
              tone="sky"
              eyebrow="Field & USB Operations"
              title="Bench and field tools."
              description={
                <>
                  Browser-side serial tooling for bench installs and field service. Pairs with the{' '}
                  <Link
                    href="/guides/repeater-setup"
                    className="text-mesh hover:text-mesh-light underline underline-offset-2"
                  >
                    repeater setup guide
                  </Link>{' '}
                  for the standard preflight command set.
                </>
              }
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <ToolCard
                tone="forest"
                glyph="◉"
                tag="USB SERIAL"
                title="Serial USB console"
                description="Talk to a connected MeshCore node over USB directly from the browser. Manual send, canned commands, and a live terminal log."
                href="/tools/serial-usb"
                headingLevel="h3"
              />
              <ToolCard
                tone="forest"
                glyph="◌"
                tag="FIELD SUPPORT"
                title="Troubleshooting reference"
                description="Common flashing, BLE, GPS, and range issues operators see in the field — and how to recover before reaching for Discord."
                href="/guides/troubleshooting"
                headingLevel="h3"
              />
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 pb-16">
          <div className="mx-auto max-w-7xl">
            <SectionHeader
              tone="mesh"
              eyebrow="Need the reference?"
              title="Hand off to the guides."
              description="Tools do — guides teach. Jump to the matching reference page when you want the theory or the manual workflow behind any tool."
            />
            <div className="grid gap-4 sm:grid-cols-3">
              {guideHandoffs.map((guide) => (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className="group panel p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-mesh/40 focus-ring"
                >
                  <div className="flex items-center justify-between">
                    <span className="mono text-[0.65rem] uppercase tracking-[0.18em] text-foreground-dim">
                      <span aria-hidden>◊ </span>Guide
                    </span>
                    <span
                      aria-hidden
                      className="text-mesh/60 group-hover:text-mesh transition-colors"
                    >
                      →
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-foreground tracking-tight group-hover:text-mesh transition-colors">
                    {guide.label}
                  </h3>
                  <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
                    {guide.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 pb-24">
          <div className="mx-auto max-w-7xl">
            <div className="panel p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-2xl">
                  <SectionEyebrow tone="sky" className="mb-3">
                    Coming from somewhere else?
                  </SectionEyebrow>
                  <p className="text-sm text-foreground-muted leading-relaxed">
                    These tools live inside the {SITE_NAME} site so they share the same live data
                    as the{' '}
                    <Link
                      href="/map"
                      className="text-mesh hover:text-mesh-light underline underline-offset-2"
                    >
                      network map
                    </Link>
                    . Utility defaults are generated from{' '}
                    <a
                      href={UPSTREAM_UTILITIES_PROVENANCE.upstreamUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-mesh hover:text-mesh-light underline underline-offset-2"
                    >
                      {UPSTREAM_UTILITIES_PROVENANCE.upstreamRepository}
                    </a>{' '}
                    at commit <code className="text-mesh">{upstreamUtilitiesCommit}</code>. Suggest
                    more utilities or report issues in the{' '}
                    <a
                      href={DISCORD_INVITE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-mesh hover:text-mesh-light underline underline-offset-2"
                    >
                      {COMMUNITY_NAME} Discord
                    </a>
                    .
                  </p>
                </div>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:flex sm:flex-col sm:gap-2 sm:text-right shrink-0">
                  <div>
                    <dt className="metric-label">Upstream</dt>
                    <dd className="mono text-xs text-foreground mt-1">
                      Colorado-Mesh
                    </dd>
                  </div>
                  <div>
                    <dt className="metric-label">Pinned commit</dt>
                    <dd className="mono text-xs text-mesh mt-1">{upstreamUtilitiesCommit}</dd>
                  </div>
                  <div>
                    <dt className="metric-label">Runtime</dt>
                    <dd className="mono text-xs text-foreground mt-1">Local · No proxy</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  tone,
}: {
  eyebrow: React.ReactNode;
  title: string;
  description: React.ReactNode;
  tone: 'mesh' | 'sunset' | 'sky';
}) {
  return (
    <div className="mb-7 max-w-2xl">
      <SectionEyebrow tone={tone} className="mb-3">
        {eyebrow}
      </SectionEyebrow>
      <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
        {title}
      </h2>
      <p className="mt-3 text-sm text-foreground-muted leading-relaxed">{description}</p>
    </div>
  );
}
