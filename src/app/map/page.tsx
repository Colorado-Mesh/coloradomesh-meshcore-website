import type { Metadata } from 'next';
import Link from 'next/link';
import { NetworkMapWrapper } from '@/components';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import { generateBreadcrumbSchema } from '@/lib/schemas/breadcrumb';
import { generateWebApplicationSchema } from '@/lib/schemas/webapp';
import { BASE_URL } from '@/lib/constants';

// Force dynamic rendering to prevent stale cache issues on Netlify
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Network Map',
  description:
    'Interactive map of Denver MeshCore network nodes across the Colorado Front Range. View live node locations, coverage areas, and network topology for the decentralized mesh network.',
  keywords: [
    'mesh network',
    'map',
    'Denver',
    'MeshCore',
    'LoRa',
    'node locations',
    'coverage',
    'Colorado',
    'Front Range',
  ],
  alternates: {
    canonical: '/map',
  },
  openGraph: {
    title: 'Network Map | Denver MeshCore',
    description:
      'Interactive map of Denver MeshCore network nodes. View node locations and coverage areas across Colorado.',
    url: `${BASE_URL}/map`,
  },
};

const breadcrumbData = generateBreadcrumbSchema([
  { name: 'Home', url: BASE_URL },
  { name: 'Network Map', url: `${BASE_URL}/map` },
]);

const webAppData = generateWebApplicationSchema({
  name: 'Denver MeshCore Network Map',
  description:
    'Interactive map of Denver MeshCore network nodes across the Colorado Front Range. View live node locations, coverage areas, and network topology.',
  url: `${BASE_URL}/map`,
});

export default function MapPage() {
  return (
    <>
      <JsonLd data={breadcrumbData} />
      <JsonLd data={webAppData} />
      <div className="min-h-screen bg-mesh">
        {/* Header */}
        <section className="px-6 py-12 md:py-16">
          <div className="mx-auto max-w-7xl">
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Network Map' }]} />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Network <span className="text-mesh">Map</span>
                </h1>
                <p className="text-foreground-muted">
                  Explore Denver MeshCore node locations and coverage areas
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  href="/observer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-night-800 hover:bg-night-700 text-foreground rounded-lg transition-colors text-sm"
                >
                  <svg
                    className="h-4 w-4 text-mesh"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Observer Stats
                </Link>
              </div>
            </div>

            {/* Map Container */}
            <div className="relative">
              <NetworkMapWrapper className="shadow-xl" />
            </div>

            {/* Info Section */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Node Types */}
              <div className="card-mesh p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-forest-500/20 flex items-center justify-center">
                    <svg
                      className="h-5 w-5 text-forest-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-foreground">Node Types</h3>
                </div>
                <p className="text-sm text-foreground-muted">
                  Different colors represent node types: Repeaters extend coverage, Room Servers
                  host chat rooms, and standard Nodes provide basic connectivity.
                </p>
              </div>

              {/* Add Your Node */}
              <div className="card-mesh p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-sunset-500/20 flex items-center justify-center">
                    <svg
                      className="h-5 w-5 text-sunset-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-foreground">Add Your Node</h3>
                </div>
                <p className="text-sm text-foreground-muted mb-3">
                  Want to see your node on the map? Join our Discord and share your node&apos;s location
                  to help expand the network.
                </p>
                <Link
                  href="/start"
                  className="inline-flex items-center text-sm text-mesh hover:text-mesh-light transition-colors"
                >
                  Get Started
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
