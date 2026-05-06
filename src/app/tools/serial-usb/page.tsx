import type { Metadata } from 'next';

import JsonLd from '@/components/JsonLd';
import SerialUsbTool from '@/components/tools/SerialUsbTool';
import ToolShell from '@/components/tools/ToolShell';
import { BASE_URL, COMMUNITY_NAME, SITE_NAME } from '@/lib/constants';
import { generateBreadcrumbSchema } from '@/lib/schemas/breadcrumb';

const PAGE_TITLE = 'Serial USB Console';
const PAGE_DESCRIPTION = `Talk to a connected MeshCore node over USB right from the browser. Manual send, canned commands, and a live terminal log — built for ${COMMUNITY_NAME} field ops with a Web Serial fallback for unsupported browsers.`;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: '/tools/serial-usb',
  },
  openGraph: {
    title: `${PAGE_TITLE} | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    url: `${BASE_URL}/tools/serial-usb`,
    siteName: SITE_NAME,
  },
};

const breadcrumbData = generateBreadcrumbSchema([
  { name: 'Home', url: BASE_URL },
  { name: 'Tools', url: `${BASE_URL}/tools` },
  { name: PAGE_TITLE, url: `${BASE_URL}/tools/serial-usb` },
]);

export default function SerialUsbPage() {
  return (
    <>
      <JsonLd data={breadcrumbData} />

      <ToolShell
        eyebrow="Field Console"
        title={
          <>
            USB serial
            <span className="block text-mesh">console</span>
          </>
        }
        description={PAGE_DESCRIPTION}
        apiTag="navigator.serial"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Tools', href: '/tools' },
          { label: PAGE_TITLE },
        ]}
        asideEyebrow="Requirements"
        aside={
          <>
            <p>
              Web Serial works in recent Chromium browsers (Chrome, Edge, Opera,
              Brave, Arc) on desktop, over HTTPS or{' '}
              <code className="text-mesh">http://localhost</code>. Firefox and
              Safari do not currently expose <code className="text-mesh">navigator.serial</code>.
            </p>
            <p>
              Your browser will prompt you to choose a port. Nothing is sent
              until you click <strong className="text-foreground">Connect</strong>{' '}
              and the bytes never leave your device.
            </p>
            <p>
              Canned commands come from an in-repo default profile. The profile
              includes diagnostics plus state-changing actions such as reboot,
              GPS toggles, and factory reset; actions that change device state
              require browser confirmation before anything is sent.
            </p>
          </>
        }
      >
        <SerialUsbTool />
      </ToolShell>
    </>
  );
}
