import type { Metadata } from 'next';

import JsonLd from '@/components/JsonLd';
import NamingWizard from '@/components/NamingWizard';
import ToolShell from '@/components/tools/ToolShell';
import { BASE_URL, COMMUNITY_NAME, SITE_NAME } from '@/lib/constants';
import { generateBreadcrumbSchema } from '@/lib/schemas/breadcrumb';

const PAGE_TITLE = 'Repeater Naming';
const PAGE_DESCRIPTION = `Build a ${COMMUNITY_NAME}-aligned repeater name with region, city, landmark, node type, and a unique public-key prefix. Live conflict checks pull from the ${SITE_NAME} network map.`;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: '/tools/repeater-name',
  },
  openGraph: {
    title: `${PAGE_TITLE} | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    url: `${BASE_URL}/tools/repeater-name`,
    siteName: SITE_NAME,
  },
};

const breadcrumbData = generateBreadcrumbSchema([
  { name: 'Home', url: BASE_URL },
  { name: 'Tools', url: `${BASE_URL}/tools` },
  { name: PAGE_TITLE, url: `${BASE_URL}/tools/repeater-name` },
]);

export default function RepeaterNamePage() {
  return (
    <>
      <JsonLd data={breadcrumbData} />

      <ToolShell
        eyebrow="Naming Standard"
        title={
          <>
            Repeater
            <span className="block text-mesh">name wizard</span>
          </>
        }
        description={PAGE_DESCRIPTION}
        apiTag="GET /api/map/nodes"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Tools', href: '/tools' },
          { label: PAGE_TITLE },
        ]}
        asideEyebrow="Format"
        aside={
          <>
            <p className="font-mono text-xs text-foreground">
              [REGION]-[CITY]-[LANDMARK]-[TYPE]-[PUBKEY]
            </p>
            <p>
              Stay under <strong className="text-foreground">23 characters</strong>{' '}
              total — the MeshCore name limit. Use IATA airport codes for region
              and a free 4-hex-char prefix for the key suffix.
            </p>
            <p>
              The prefix conflict check below pulls live data from{' '}
              <code className="text-mesh">/api/map/nodes</code>, so freshly heard
              nodes will appear within the map snapshot interval.
            </p>
          </>
        }
      >
        <NamingWizard />
      </ToolShell>
    </>
  );
}
