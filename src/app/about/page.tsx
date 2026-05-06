import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import { generateBreadcrumbSchema } from '@/lib/schemas/breadcrumb';
import { BASE_URL, SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'About',
  description:
    `Learn about MeshCore technology and the ${SITE_NAME} community. MeshCore is an open-source mesh networking firmware using LoRa radios for decentralized, off-grid communication across Colorado's Front Range and beyond.`,
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: `About ${SITE_NAME}`,
    description:
      `Learn about MeshCore technology and the ${SITE_NAME} community building Colorado's decentralized communication network.`,
    url: `${BASE_URL}/about`,
  },
};

const breadcrumbData = generateBreadcrumbSchema([
  { name: 'Home', url: BASE_URL },
  { name: 'About', url: `${BASE_URL}/about` },
]);

export default function AboutPage() {
  return (
    <>
      <JsonLd data={breadcrumbData} />
      <div className="min-h-screen bg-mesh">
        {/* Hero Section */}
        <section className="px-6 py-16 md:py-24 text-center">
          <div className="max-w-4xl mx-auto">
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About' }]} />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              About Colorado MeshCore
            </h1>
            <p className="text-lg md:text-xl text-foreground-muted max-w-2xl mx-auto">
              Building a resilient, decentralized communication network across the Front Range
              and beyond. Connecting Colorado communities through innovative mesh technology.
            </p>
          </div>
        </section>

        {/* What is MeshCore Section */}
        <section className="px-6 py-16 bg-background-secondary">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                  What is MeshCore?
                </h2>
                <div className="space-y-4 text-foreground-muted">
                  <p>
                    MeshCore is an open-source mesh networking firmware with dedicated infrastructure
                    roles. Unlike simple flood-routing protocols, MeshCore uses Repeaters and Room
                    Servers to intelligently route messages through the network.
                  </p>
                  <p>
                    Using LoRa (Long Range) radio technology, MeshCore nodes can communicate
                    over several miles, even in challenging terrain like Colorado&apos;s mountains.
                    Strategically placed Repeaters extend coverage while Companion devices
                    connect users via Bluetooth to their phones.
                  </p>
                  <p>
                    Whether you&apos;re hiking in the backcountry, preparing for emergencies, or
                    simply interested in decentralized technology, MeshCore provides a robust
                    communication backbone that&apos;s owned by the community.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="card-mesh p-6 text-center">
                  <div className="text-3xl font-bold text-mesh mb-2">10+ mi</div>
                  <div className="text-sm text-foreground-muted">Range per node</div>
                </div>
                <div className="card-mesh p-6 text-center">
                  <div className="text-3xl font-bold text-mountain-500 mb-2">915 MHz</div>
                  <div className="text-sm text-foreground-muted">LoRa frequency</div>
                </div>
                <div className="card-mesh p-6 text-center">
                  <div className="text-3xl font-bold text-forest-500 mb-2">Low Power</div>
                  <div className="text-sm text-foreground-muted">Solar compatible</div>
                </div>
                <div className="card-mesh p-6 text-center">
                  <div className="text-3xl font-bold text-sunset-500 mb-2">Open</div>
                  <div className="text-sm text-foreground-muted">Open source</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How Mesh Networking Works */}
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-foreground">
              How Mesh Networking Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card-mesh p-8">
                <div className="w-16 h-16 bg-mountain-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <svg className="w-8 h-8 text-mountain-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-center text-foreground">Direct Communication</h3>
                <p className="text-foreground-muted text-center">
                  Nodes communicate directly with each other using radio waves, no internet
                  or cell towers required.
                </p>
              </div>
              <div className="card-mesh p-8">
                <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <svg className="w-8 h-8 text-forest-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-center text-foreground">Dedicated Repeaters</h3>
                <p className="text-foreground-muted text-center">
                  Repeaters are solar-powered nodes placed at high points that relay
                  messages across the network efficiently.
                </p>
              </div>
              <div className="card-mesh p-8">
                <div className="w-16 h-16 bg-sunset-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <svg className="w-8 h-8 text-sunset-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-center text-foreground">Resilient by Design</h3>
                <p className="text-foreground-muted text-center">
                  No single point of failure. The network automatically routes around
                  problems and adapts to changes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The Colorado Mesh Community Section */}
        <section className="px-6 py-16 bg-mountain-gradient text-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              The Colorado Mesh Community
            </h2>
            <div className="max-w-3xl mx-auto space-y-6 text-mountain-100">
              <p className="text-lg">
                Colorado MeshCore is a grassroots community of radio enthusiasts, technology advocates,
                and emergency preparedness minded individuals working together to build a resilient
                communication network across Colorado.
              </p>
              <p className="text-lg">
                Our coverage area extends across the Denver metro area, the Front Range corridor from
                Fort Collins to Colorado Springs, and into the mountain communities. With nodes placed
                at strategic high points, we&apos;re creating a network that can reach hikers in the
                backcountry, connect mountain towns, and provide backup communication when traditional
                infrastructure fails.
              </p>
            </div>
            <div className="mt-12 grid md:grid-cols-3 gap-8 text-center">
              <div>
                <h3 className="text-xl font-bold mb-3">Our Mission</h3>
                <p className="text-mountain-100">
                  Build and maintain a community-owned mesh network that provides free,
                  open communication infrastructure for all Coloradans.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Our Values</h3>
                <p className="text-mountain-100">
                  Open source, community-driven, accessible to all. We believe communication
                  infrastructure should be a public good.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Our Goal</h3>
                <p className="text-mountain-100">
                  Create seamless mesh coverage from the plains to the peaks, ensuring
                  Coloradans stay connected no matter what.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How to Get Involved Section */}
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-foreground">
              How to Get Involved
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Join Discord */}
              <div className="card-mesh p-6 hover:border-mesh transition-colors">
                <div className="w-12 h-12 bg-[#5865F2] rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">Join Discord</h3>
                <p className="text-sm text-foreground-muted mb-4">
                  Connect with the community, ask questions, and stay updated on network developments.
                </p>
                <a href="https://discord.gg/QpaW8FTTCE" target="_blank" rel="noopener noreferrer" className="text-mesh hover:text-mesh-light font-medium text-sm inline-flex items-center gap-1">
                  Join Server
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>

              {/* Set Up a Node */}
              <div className="card-mesh p-6 hover:border-mesh transition-colors">
                <div className="w-12 h-12 bg-forest-500 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">Set Up a Node</h3>
                <p className="text-sm text-foreground-muted mb-4">
                  Add your own node to the network. Every node expands our coverage and strengthens the mesh.
                </p>
                <Link href="/start" className="text-mesh hover:text-mesh-light font-medium text-sm inline-flex items-center gap-1">
                  Get Started
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>

              {/* Contribute */}
              <div className="card-mesh p-6 hover:border-mesh transition-colors">
                <div className="w-12 h-12 bg-mountain-500 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">Contribute</h3>
                <p className="text-sm text-foreground-muted mb-4">
                  Help develop software, create documentation, or contribute to infrastructure improvements.
                </p>
                <a href="https://github.com/meshcore-dev/MeshCore" target="_blank" rel="noopener noreferrer" className="text-mesh hover:text-mesh-light font-medium text-sm inline-flex items-center gap-1">
                  View GitHub
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              {/* Help Others */}
              <div className="card-mesh p-6 hover:border-mesh transition-colors">
                <div className="w-12 h-12 bg-sunset-500 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">Help Others</h3>
                <p className="text-sm text-foreground-muted mb-4">
                  Share your knowledge, help newcomers set up their first node, and grow the community.
                </p>
                <a href="https://discord.gg/QpaW8FTTCE" target="_blank" rel="noopener noreferrer" className="text-mesh hover:text-mesh-light font-medium text-sm inline-flex items-center gap-1">
                  Get Involved
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Community Driven Section */}
        <section className="px-6 py-16 bg-background-secondary">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              Community Driven
            </h2>
            <p className="text-lg text-foreground-muted mb-8 max-w-2xl mx-auto">
              Colorado MeshCore is built entirely by volunteers who believe in the power of
              decentralized communication. There are no corporations, no subscriptions,
              no data harvesting &mdash; just a community working together for the common good.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-card-border">
                <svg className="w-5 h-5 text-mesh" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-foreground">100% Open Source</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-card-border">
                <svg className="w-5 h-5 text-mesh" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-foreground">Community Owned</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-card-border">
                <svg className="w-5 h-5 text-mesh" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-foreground">Contributors Welcome</span>
              </div>
            </div>
          </div>
        </section>

        {/* Links Section */}
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-foreground">
              Resources & Links
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Live network map */}
              <Link
                href="/map"
                className="card-mesh p-6 hover:border-mesh transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-mesh/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-mesh/20 transition-colors">
                    <svg className="w-6 h-6 text-mesh" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.553 2.776A1 1 0 0021 18.882V8.118a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 text-foreground group-hover:text-mesh transition-colors">
                      Live Network Map
                    </h3>
                    <p className="text-sm text-foreground-muted mb-2">
                      Real-time map of operator-run nodes across Colorado, with live position and link data.
                    </p>
                    <span className="text-mesh text-sm inline-flex items-center gap-1">
                      Open Map
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>

              {/* LetsMesh Link */}
              <a
                href="https://letsmesh.net"
                target="_blank"
                rel="noopener noreferrer"
                className="card-mesh p-6 hover:border-mesh transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-mountain-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-mountain-200 transition-colors">
                    <svg className="w-6 h-6 text-mountain-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 text-foreground group-hover:text-mesh transition-colors">
                      LetsMesh
                    </h3>
                    <p className="text-sm text-foreground-muted mb-2">
                      The global mesh network platform. Explore the worldwide MeshCore community.
                    </p>
                    <span className="text-mesh text-sm inline-flex items-center gap-1">
                      Visit LetsMesh
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </span>
                  </div>
                </div>
              </a>

              {/* MeshCore Resources */}
              <a
                href="https://meshcore.co.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="card-mesh p-6 hover:border-mesh transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-forest-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-forest-200 transition-colors">
                    <svg className="w-6 h-6 text-forest-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 text-foreground group-hover:text-mesh transition-colors">
                      MeshCore Docs
                    </h3>
                    <p className="text-sm text-foreground-muted mb-2">
                      Official documentation, firmware downloads, and technical resources.
                    </p>
                    <span className="text-mesh text-sm inline-flex items-center gap-1">
                      Read Docs
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </span>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-16 bg-night-stars text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Join the Mesh?
            </h2>
            <p className="text-lg text-mountain-100 mb-8">
              Whether you&apos;re a radio enthusiast, a prepper, a developer, or just someone
              who believes in community-owned infrastructure, there&apos;s a place for you in
              Colorado MeshCore.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/start" className="btn-accent">
                Get Started
              </Link>
              <a href="https://discord.gg/QpaW8FTTCE" target="_blank" rel="noopener noreferrer" className="btn-outline border-white text-white hover:bg-white hover:text-night-950">
                Join Discord
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
