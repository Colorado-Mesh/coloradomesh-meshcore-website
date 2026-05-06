import type { Metadata } from 'next';

import JsonLd from '@/components/JsonLd';
import PrefixMatrix from '@/components/PrefixMatrix';
import ToolShell from '@/components/tools/ToolShell';
import { BASE_URL, COMMUNITY_NAME, SITE_NAME } from '@/lib/constants';
import { generateBreadcrumbSchema } from '@/lib/schemas/breadcrumb';

const PAGE_TITLE = 'Prefix Matrix';
const PAGE_DESCRIPTION = `See how the 256 first-byte public-key prefixes are distributed across ${COMMUNITY_NAME} nodes. Pick a free prefix before generating a new MeshCore identity key.`;

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
        apiTag="GET /api/map/nodes"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Tools', href: '/tools' },
          { label: PAGE_TITLE },
        ]}
        asideEyebrow="How it works"
        aside={
          <>
            <p>
              Each cell is a possible first byte of a MeshCore public key
              (<code className="text-mesh">0x00</code>–
              <code className="text-mesh">0xFF</code>). The matrix counts how many
              currently visible {SITE_NAME} nodes occupy each prefix, sourced from{' '}
              <code className="text-mesh">/api/map/nodes</code>.
            </p>
            <p>
              Click an empty cell to inspect it, or use{' '}
              <em>Suggest Free Prefix</em> for a random unused byte.
            </p>
          </>
        }
      >
        <PrefixMatrix />
      </ToolShell>
    </>
  );
}
