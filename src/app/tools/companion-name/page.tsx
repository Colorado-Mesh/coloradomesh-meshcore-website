import type { Metadata } from 'next';

import JsonLd from '@/components/JsonLd';
import CompanionNamer from '@/components/CompanionNamer';
import ToolShell from '@/components/tools/ToolShell';
import { BASE_URL, COMMUNITY_NAME, SITE_NAME } from '@/lib/constants';
import { generateBreadcrumbSchema } from '@/lib/schemas/breadcrumb';

const PAGE_TITLE = 'Companion Naming';
const PAGE_DESCRIPTION = `Compose a personal companion identity for ${COMMUNITY_NAME}: emoji, handle, and a public-key, role, or numeric suffix — all under MeshCore's 23-character name limit.`;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: '/tools/companion-name',
  },
  openGraph: {
    title: `${PAGE_TITLE} | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    url: `${BASE_URL}/tools/companion-name`,
    siteName: SITE_NAME,
  },
};

const breadcrumbData = generateBreadcrumbSchema([
  { name: 'Home', url: BASE_URL },
  { name: 'Tools', url: `${BASE_URL}/tools` },
  { name: PAGE_TITLE, url: `${BASE_URL}/tools/companion-name` },
]);

export default function CompanionNamePage() {
  return (
    <>
      <JsonLd data={breadcrumbData} />

      <ToolShell
        eyebrow="Naming Standard"
        title={
          <>
            Companion
            <span className="block text-mesh">name builder</span>
          </>
        }
        description={PAGE_DESCRIPTION}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Tools', href: '/tools' },
          { label: PAGE_TITLE },
        ]}
        asideEyebrow="Format"
        aside={
          <>
            <p className="font-mono text-xs text-foreground">
              [EMOJI] [HANDLE] [SUFFIX]
            </p>
            <p>
              Companions are personal carry nodes. Pick one emoji per person
              (claim it in Discord first), a handle that is not your real name,
              and a suffix that helps you tell your own devices apart.
            </p>
            <p>
              The whole name must stay under{' '}
              <strong className="text-foreground">23 characters</strong>.
            </p>
          </>
        }
      >
        <CompanionNamer />
      </ToolShell>
    </>
  );
}
