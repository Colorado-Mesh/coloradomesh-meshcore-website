import type { Metadata } from 'next';

import JsonLd from '@/components/JsonLd';
import PrefixMatrix from '@/components/PrefixMatrix';
import ToolShell from '@/components/tools/ToolShell';
import { BASE_URL, COMMUNITY_NAME, SITE_NAME } from '@/lib/constants';
import { generateBreadcrumbSchema } from '@/lib/schemas/breadcrumb';

const PAGE_TITLE = 'Prefix Matrix';
const PAGE_DESCRIPTION = `Plan a unique 4-character public-key prefix across ${COMMUNITY_NAME} nodes. Drill in from the 256 first-byte tiles to a 16×16 subgrid of full 4-character prefixes, with reserved IDs, duplicates, and repeater collisions surfaced from CoreScope analyzer nodes.`;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: '/tools/prefix-matrix',
  },
  openGraph: {
    title: `${PAGE_TITLE} | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    url: `${BASE_URL}/tools/prefix-matrix`,
    siteName: SITE_NAME,
  },
};

const breadcrumbData = generateBreadcrumbSchema([
  { name: 'Home', url: BASE_URL },
  { name: 'Tools', url: `${BASE_URL}/tools` },
  { name: PAGE_TITLE, url: `${BASE_URL}/tools/prefix-matrix` },
]);

export default function PrefixMatrixPage() {
  return (
    <>
      <JsonLd data={breadcrumbData} />

      <ToolShell
        eyebrow="Identity Planning"
        title={
          <>
            Public-key
            <span className="block text-mesh">prefix matrix</span>
          </>
        }
        description={PAGE_DESCRIPTION}
        apiTag="GET /api/nodes?limit=1000"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Tools', href: '/tools' },
          { label: PAGE_TITLE },
        ]}
        asideEyebrow="How it works"
        aside={
          <>
            <p>
              The first grid is the 256 possible first-byte prefixes
              (<code className="text-mesh">0x00</code>–
              <code className="text-mesh">0xFF</code>) of a MeshCore public key.
              Counts come from CoreScope analyzer nodes at{' '}
              <code className="text-mesh">/api/nodes?limit=1000</code> shared by the
              {' '}{SITE_NAME} map.
            </p>
            <p>
              Click any tile to drill into a 16×16 subgrid of full 4-character
              prefixes. Tiles flag duplicates, repeater/room-server collisions,
              and reserved IDs.
            </p>
            <p>
              Use <em>Suggest Free Prefix</em> for a deterministic unoccupied
              4-character prefix you can paste into the key generator.
            </p>
          </>
        }
      >
        <PrefixMatrix />
      </ToolShell>
    </>
  );
}
