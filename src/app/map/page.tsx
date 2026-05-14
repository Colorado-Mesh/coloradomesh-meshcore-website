import type { Metadata } from 'next';
import Link from 'next/link';

import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import { HeroPanel, NetworkPanel, SectionEyebrow, ToolCard } from '@/components';
import {
  BASE_URL,
  COMMUNITY_NAME,
  DISCORD_INVITE_URL,
  GITHUB_ORG_URL,
  SITE_NAME,
} from '@/lib/constants';
import { generateBreadcrumbSchema } from '@/lib/schemas/breadcrumb';
import { generateWebApplicationSchema } from '@/lib/schemas/webapp';

const PAGE_TITLE = 'Live Map';
const PAGE_DESCRIPTION = `Same-origin CoreScope live map for ${SITE_NAME} nodes, repeaters, packets, and operator telemetry across Colorado.`;
const CORESCOPE_UPSTREAM_URL = 'https://github.com/Kpa-clawbot/CoreScope';
const GPL_LICENSE_URL = 'https://www.gnu.org/licenses/gpl-3.0.html';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    'mesh network',
    'live map',
    'CoreScope',
    'Colorado',
    'Colorado Mesh',
    'Colorado MeshCore',
    'MeshCore',
    'LoRa',
    'node locations',
    'coverage',
    'Front Range',
  ],
  alternates: {
    canonical: '/map',
  },
  openGraph: {
    title: `${PAGE_TITLE} | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    url: `${BASE_URL}/map`,
    siteName: SITE_NAME,
  },
  twitter: {
    title: `${PAGE_TITLE} | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
  },
};

const breadcrumbData = generateBreadcrumbSchema([
  { name: 'Home', url: BASE_URL },
  { name: PAGE_TITLE, url: `${BASE_URL}/map` },
]);

const webAppData = generateWebApplicationSchema({
  name: `${SITE_NAME} CoreScope Live Map`,
  description: PAGE_DESCRIPTION,
  url: `${BASE_URL}/map`,
  license: GPL_LICENSE_URL,
  isBasedOn: {
    name: 'CoreScope',
    url: CORESCOPE_UPSTREAM_URL,
    license: GPL_LICENSE_URL,
  },
});

export default function MapPage() {
  return (
    <>
      <JsonLd data={breadcrumbData} />
      <JsonLd data={webAppData} />

      <div className="min-h-screen">
        <HeroPanel
          background="topo-grid"
          showMountains
          eyebrow="Live Operations · CoreScope"
          title={
            <>
              {COMMUNITY_NAME}
              <span className="block text-mesh">live map</span>
            </>
          }
          description={`${SITE_NAME} serves CoreScope directly at /map in the Docker runtime. Start the Docker container to load the live analyzer, map, packets, nodes, and telemetry from this same public origin.`}
          actions={
            <>
              <Link href="/start" className="btn-primary">
                Get Started
              </Link>
              <Link href="/tools" className="btn-secondary">
                Operator tools
              </Link>
              <Link href="/guides/getting-started" className="btn-secondary">
                Getting started guide
              </Link>
              <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                Join Discord
              </a>
            </>
          }
          meta={
            <div className="panel px-5 sm:px-6 py-4 backdrop-blur-md bg-card/85">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: PAGE_TITLE }]} />
                <span className="text-foreground-dim mono uppercase tracking-[0.18em]">
                  Docker runtime · CoreScope · /map#/live
                </span>
              </div>
            </div>
          }
        />

        <section className="relative z-10 px-4 sm:px-6 lg:px-8 pb-16 mt-4 sm:mt-6">
          <div className="mx-auto max-w-5xl">
            <NetworkPanel
              eyebrow="Local development fallback"
              title="Run Docker to use the production map"
              headingLevel="h2"
            >
              <div className="space-y-4 text-sm text-foreground-muted">
                <p>
                  The production map is no longer the old in-app Leaflet view. It is the bundled
                  CoreScope runtime served by nginx inside the site container, with Next.js kept
                  behind the same public port for the rest of the site.
                </p>
                <p>
                  In a plain Next.js dev server this fallback page is shown because CoreScope,
                  nginx, supervisor, and the generated runtime config are Docker-only.
                </p>
                <div className="rounded-2xl border border-border bg-surface-1 px-4 py-3 mono text-xs text-foreground-dim">
                  docker compose up --build
                </div>
              </div>
            </NetworkPanel>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 pb-24">
          <div className="mx-auto max-w-5xl">
            <SectionEyebrow tone="sky" className="mb-4">
              Operator next steps
            </SectionEyebrow>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <ToolCard
                tone="mesh"
                glyph="◈"
                tag="GUIDES"
                title="Getting Started"
                description="Pick a radio, flash MeshCore, name your node, and join the Front Range mesh."
                href="/guides/getting-started"
                headingLevel="h2"
              />
              <ToolCard
                tone="sunset"
                glyph="◇"
                tag="OPERATORS"
                title="Operator tools"
                description="Naming wizard, prefix matrix, and other operator utilities for the Colorado mesh."
                href="/tools"
                headingLevel="h2"
              />
              <ToolCard
                tone="forest"
                glyph="◆"
                tag="SOURCE"
                title="Project source"
                description="Review Colorado Mesh source, submodules, and update workflow on GitHub."
                href={GITHUB_ORG_URL}
                external
                headingLevel="h2"
              />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
