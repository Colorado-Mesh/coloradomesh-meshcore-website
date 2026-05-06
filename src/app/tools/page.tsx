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
              <Breadcrumbs
                items={[{ label: 'Home', href: '/' }, { label: PAGE_TITLE }]}
              />
            </div>
          }
        />

        <section className="px-4 sm:px-6 lg:px-8 pb-16 -mt-10">
          <div className="mx-auto max-w-7xl">
            <SectionEyebrow tone="mesh" className="mb-4">
              Naming &amp; Identity
            </SectionEyebrow>
            <div className="grid gap-5 sm:grid-cols-2">
              <ToolCard
                tone="mesh"
                glyph="◈"
                tag="REPEATER NAMING"
                title="Repeater name wizard"
                description="Build a standards-aligned repeater name from region, city, landmark, and node type. Includes live conflict checks against the live network map."
                href="/tools/repeater-name"
              />
              <ToolCard
                tone="sky"
                glyph="◇"
                tag="COMPANION NAMING"
                title="Companion name builder"
                description="Compose your personal companion identity with emoji, handle, and an identification suffix. Stays under the 23-character MeshCore limit."
                href="/tools/companion-name"
              />
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 pb-16">
          <div className="mx-auto max-w-7xl">
            <SectionEyebrow tone="sunset" className="mb-4">
              Network &amp; Field Ops
            </SectionEyebrow>
            <div className="grid gap-5 sm:grid-cols-2">
              <ToolCard
                tone="sunset"
                glyph="◊"
                tag="PREFIX PLANNING"
                title="Public-key prefix matrix"
                description={`Visualize the 256-cell first-byte prefix space across ${COMMUNITY_NAME}. Find free prefixes before generating a new key.`}
                href="/tools/prefix-matrix"
              />
              <ToolCard
                tone="forest"
                glyph="◉"
                tag="USB SERIAL"
                title="Web Serial console"
                description="Talk to a connected MeshCore node over USB directly from the browser. Manual send, canned commands, and a live terminal log."
                href="/tools/serial-usb"
              />
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 pb-24">
          <div className="mx-auto max-w-7xl">
            <div className="panel p-6 sm:p-8 text-sm text-foreground-muted leading-relaxed">
              <SectionEyebrow tone="sky" className="mb-3">
                Coming from somewhere else?
              </SectionEyebrow>
              <p>
                These tools live inside the {SITE_NAME} site so they share the
                same live data as the{' '}
                <Link href="/map" className="text-mesh hover:text-mesh-light">
                  network map
                </Link>
                . Suggest more utilities or report issues in the{' '}
                <a
                  href={DISCORD_INVITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mesh hover:text-mesh-light"
                >
                  {COMMUNITY_NAME} Discord
                </a>
                .
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
