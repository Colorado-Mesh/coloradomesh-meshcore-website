import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import { generateBreadcrumbSchema } from '@/lib/schemas/breadcrumb';
import { BASE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Community Mesh Networks | Build Your Neighborhood Network',
  description:
    'Learn how to build a community mesh network for your neighborhood. Create resilient, decentralized communication infrastructure that works without internet or cell towers. Perfect for neighborhood networks, HOAs, and local communities.',
  keywords: [
    'community mesh network',
    'neighborhood network',
    'community network',
    'local mesh network',
    'neighborhood mesh',
    'community wireless network',
    'decentralized neighborhood network',
    'off-grid community network',
    'HOA mesh network',
    'residential mesh network',
    'Denver community network',
    'Colorado neighborhood network',
  ],
  alternates: {
    canonical: '/use-cases/community-networks',
  },
  openGraph: {
    title: 'Community Mesh Networks | Colorado MeshCore',
    description:
      'Build a resilient community mesh network for your neighborhood. Connect with neighbors, stay prepared for emergencies, and create lasting local communication infrastructure.',
    url: `${BASE_URL}/use-cases/community-networks`,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Community Mesh Networks | Colorado MeshCore',
    description:
      'Build a resilient community mesh network for your neighborhood. Connect with neighbors and create lasting local communication infrastructure.',
  },
};

const breadcrumbData = generateBreadcrumbSchema([
  { name: 'Home', url: BASE_URL },
  { name: 'Use Cases', url: `${BASE_URL}/use-cases` },
  { name: 'Community Networks', url: `${BASE_URL}/use-cases/community-networks` },
]);

const communityBenefits = [
  {
    title: 'Emergency Resilience',
    description:
      'When power outages hit or cell towers fail, your community mesh network keeps neighbors connected. Coordinate emergency response, check on vulnerable residents, and share critical information.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    color: 'sunset-500',
  },
  {
    title: 'Zero Monthly Costs',
    description:
      'Unlike traditional internet or cellular networks, a community mesh network has no monthly fees. After the initial hardware investment, your neighborhood network runs for free.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    color: 'forest-500',
  },
  {
    title: 'Community Building',
    description:
      'A neighborhood network brings people together. Share local updates, organize events, coordinate neighborhood watch, and build stronger community bonds through better communication.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    color: 'mesh',
  },
  {
    title: 'Privacy & Independence',
    description:
      'Your community mesh network operates independently of corporate infrastructure. No data harvesting, no surveillance, no third-party control over your neighborhood communications.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
    color: 'mountain-500',
  },
];

const implementationSteps = [
  {
    step: 1,
    title: 'Survey Your Neighborhood',
    description:
      'Identify interested neighbors and map out your community. Look for high points like rooftops, hills, or tall buildings that could host repeater nodes for maximum coverage.',
    tips: [
      'Talk to neighbors about the benefits of a community mesh network',
      'Identify homes with good line-of-sight to other areas',
      'Consider solar power options for outdoor installations',
    ],
  },
  {
    step: 2,
    title: 'Plan Your Network Architecture',
    description:
      'Design your neighborhood network with a mix of repeaters and client devices. Strategic placement of repeaters ensures all homes can connect reliably.',
    tips: [
      'Place repeaters on the highest available points',
      'Plan for redundancy with multiple coverage paths',
      'Consider weather protection for outdoor nodes',
    ],
  },
  {
    step: 3,
    title: 'Deploy Initial Nodes',
    description:
      'Start with a core group of enthusiastic neighbors. Install repeaters at key locations and distribute companion devices to early adopters.',
    tips: [
      'Test coverage as you deploy each node',
      'Document node locations and configurations',
      'Create a maintenance schedule for outdoor installations',
    ],
  },
  {
    step: 4,
    title: 'Expand & Onboard Neighbors',
    description:
      'Grow your community mesh network organically. Help new neighbors set up their devices and integrate with the existing infrastructure.',
    tips: [
      'Host setup sessions for new members',
      'Create local documentation and guides',
      'Establish communication protocols and etiquette',
    ],
  },
];

const useCaseScenarios = [
  {
    title: 'HOA & Gated Communities',
    description:
      'Perfect for homeowner associations seeking secure, private community communication. Coordinate maintenance, share announcements, and build community without monthly service fees.',
    icon: '🏘️',
  },
  {
    title: 'Rural Neighborhoods',
    description:
      'Ideal for rural and semi-rural areas where cellular coverage is weak or nonexistent. A neighborhood network provides reliable communication across large properties.',
    icon: '🌄',
  },
  {
    title: 'Mountain Communities',
    description:
      'Colorado mountain towns face unique communication challenges. Community mesh networks provide resilient coverage even when winter storms knock out traditional infrastructure.',
    icon: '🏔️',
  },
  {
    title: 'Apartment & Condo Buildings',
    description:
      'Connect residents across multi-unit buildings. Share building updates, coordinate package deliveries, and create a true community network within your complex.',
    icon: '🏢',
  },
];

const faqItems = [
  {
    question: 'How far can a community mesh network reach?',
    answer:
      'Individual nodes can communicate over several miles with good line-of-sight. By strategically placing repeaters, a neighborhood network can cover entire communities, from small subdivisions to multi-mile areas.',
  },
  {
    question: 'What equipment do neighbors need?',
    answer:
      'Each participant needs a MeshCore-compatible device (around $30-50 for basic units). Community repeaters require slightly more investment ($50-100) but serve the entire neighborhood.',
  },
  {
    question: 'Is a community mesh network legal?',
    answer:
      'Yes! MeshCore uses license-free LoRa frequencies (915 MHz in the US). No radio license is required, making it accessible to everyone in your community.',
  },
  {
    question: 'What happens during a power outage?',
    answer:
      'Battery-powered and solar-powered nodes continue operating during outages. This is one of the key advantages of a community mesh network for emergency preparedness.',
  },
  {
    question: 'Can our HOA manage the network?',
    answer:
      'Absolutely! Many HOAs and community groups successfully operate neighborhood networks. The decentralized nature means shared responsibility, and MeshCore provides tools for network management.',
  },
];

const pageSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Community Mesh Networks: Build Your Neighborhood Network',
  description:
    'Learn how to build a community mesh network for your neighborhood using MeshCore technology.',
  author: {
    '@type': 'Organization',
    name: 'Colorado MeshCore',
    url: BASE_URL,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Colorado MeshCore',
    url: BASE_URL,
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${BASE_URL}/use-cases/community-networks`,
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

export default function CommunityNetworksPage() {
  return (
    <>
      <JsonLd data={breadcrumbData} />
      <JsonLd data={pageSchema} />
      <JsonLd data={faqSchema} />
      <div className="min-h-screen bg-mesh">
        {/* Hero Section */}
        <section className="px-6 py-16 md:py-24 text-center">
          <div className="max-w-4xl mx-auto">
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Use Cases', href: '/use-cases' }, { label: 'Community Networks' }]} />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              Community <span className="text-mesh">Mesh Networks</span>
            </h1>
            <p className="text-xl md:text-2xl text-foreground-muted mb-4 max-w-3xl mx-auto">
              Build a resilient neighborhood network that connects your community
              &mdash; no internet or cell service required.
            </p>
            <p className="text-lg text-foreground-muted mb-8 max-w-2xl mx-auto">
              A community mesh network provides decentralized, free communication infrastructure
              for neighborhoods, HOAs, and local communities across Colorado.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/start" className="btn-primary">
                Start Your Network
              </Link>
              <a href="#how-it-works" className="btn-outline">
                How It Works
              </a>
            </div>
          </div>
        </section>

        {/* What is a Community Mesh Network */}
        <section className="px-6 py-16 bg-background-secondary">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                  What is a Community Mesh Network?
                </h2>
                <div className="space-y-4 text-foreground-muted">
                  <p>
                    A <strong>community mesh network</strong> is a decentralized communication
                    infrastructure built and owned by neighborhood residents. Unlike traditional
                    networks that rely on cell towers and internet providers, a mesh network
                    operates independently using radio waves.
                  </p>
                  <p>
                    Each node in your <strong>neighborhood network</strong> can communicate directly
                    with other nodes and relay messages across the community. This creates a resilient
                    web of connections that works even when power grids and commercial networks fail.
                  </p>
                  <p>
                    Using MeshCore technology and LoRa radios, communities across Denver and Colorado
                    are building lasting communication infrastructure that serves their neighbors
                    in everyday life and during emergencies.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="card-mesh p-6 text-center">
                  <div className="text-3xl font-bold text-mesh mb-2">10+ mi</div>
                  <div className="text-sm text-foreground-muted">Node range</div>
                </div>
                <div className="card-mesh p-6 text-center">
                  <div className="text-3xl font-bold text-forest-500 mb-2">$0</div>
                  <div className="text-sm text-foreground-muted">Monthly fees</div>
                </div>
                <div className="card-mesh p-6 text-center">
                  <div className="text-3xl font-bold text-mountain-500 mb-2">24/7</div>
                  <div className="text-sm text-foreground-muted">Always on</div>
                </div>
                <div className="card-mesh p-6 text-center">
                  <div className="text-3xl font-bold text-sunset-500 mb-2">100%</div>
                  <div className="text-sm text-foreground-muted">Community owned</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground text-center">
              Why Build a Neighborhood Network?
            </h2>
            <p className="text-foreground-muted text-center mb-12 max-w-2xl mx-auto">
              A community mesh network provides lasting value for your entire neighborhood.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {communityBenefits.map((benefit) => (
                <div key={benefit.title} className="card-mesh p-6">
                  <div
                    className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4`}
                    style={{
                      backgroundColor:
                        benefit.color === 'mesh'
                          ? 'rgba(14, 165, 233, 0.1)'
                          : benefit.color === 'forest-500'
                            ? 'rgba(34, 197, 94, 0.1)'
                            : benefit.color === 'mountain-500'
                              ? 'rgba(59, 130, 246, 0.1)'
                              : 'rgba(249, 115, 22, 0.1)',
                      color:
                        benefit.color === 'mesh'
                          ? '#0ea5e9'
                          : benefit.color === 'forest-500'
                            ? '#22c55e'
                            : benefit.color === 'mountain-500'
                              ? '#3b82f6'
                              : '#f97316',
                    }}
                  >
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">{benefit.title}</h3>
                  <p className="text-foreground-muted">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Case Scenarios */}
        <section className="px-6 py-16 bg-background-secondary">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground text-center">
              Perfect For Your Community
            </h2>
            <p className="text-foreground-muted text-center mb-12 max-w-2xl mx-auto">
              Community mesh networks adapt to any neighborhood type across Colorado.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {useCaseScenarios.map((scenario) => (
                <div key={scenario.title} className="card-mesh p-6 text-center">
                  <div className="text-4xl mb-4">{scenario.icon}</div>
                  <h3 className="text-lg font-bold mb-2 text-foreground">{scenario.title}</h3>
                  <p className="text-sm text-foreground-muted">{scenario.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground text-center">
              Building Your Community Mesh Network
            </h2>
            <p className="text-foreground-muted text-center mb-12 max-w-2xl mx-auto">
              Four steps to create a resilient neighborhood network for your community.
            </p>

            <div className="space-y-8">
              {implementationSteps.map((step) => (
                <div key={step.step} className="card-mesh p-6 md:p-8">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-mesh/10 flex items-center justify-center">
                        <span className="text-2xl font-bold text-mesh">{step.step}</span>
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold mb-3 text-foreground">{step.title}</h3>
                      <p className="text-foreground-muted mb-4">{step.description}</p>
                      <ul className="space-y-2">
                        {step.tips.map((tip, index) => (
                          <li
                            key={index}
                            className="text-sm text-foreground-muted flex items-start gap-2"
                          >
                            <span className="text-mesh mt-0.5">&#10003;</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Colorado MeshCore Advantage */}
        <section className="px-6 py-16 bg-mountain-gradient text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Join the Colorado MeshCore Community
            </h2>
            <div className="space-y-6 text-mountain-100 text-left max-w-3xl mx-auto">
              <p className="text-lg">
                When you build a neighborhood network with MeshCore, you&apos;re not starting from
                scratch. You&apos;re joining a growing community mesh network that spans Denver and
                the Colorado Front Range.
              </p>
              <p className="text-lg">
                Your local network can connect to the broader Colorado MeshCore infrastructure,
                extending your reach and providing access to repeaters across the region. This
                means your community benefits from the collective effort of mesh enthusiasts
                throughout Colorado.
              </p>
              <p className="text-lg">
                Our Discord community provides support, guidance, and shared knowledge to help your
                neighborhood network succeed. From hardware recommendations to installation tips,
                experienced community members are ready to help.
              </p>
            </div>
            <div className="mt-8">
              <Link
                href="/map"
                className="text-white underline hover:text-mountain-100 transition-colors inline-flex items-center gap-2"
              >
                View Our Network Map
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="px-6 py-16 bg-background-secondary">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground text-center">
              Community Network FAQ
            </h2>
            <p className="text-foreground-muted text-center mb-12 max-w-2xl mx-auto">
              Common questions about building a neighborhood mesh network.
            </p>

            <div className="space-y-6">
              {faqItems.map((item, index) => (
                <div key={index} className="card-mesh p-6">
                  <h3 className="text-lg font-bold mb-3 text-foreground">{item.question}</h3>
                  <p className="text-foreground-muted">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-16 bg-night-stars text-white text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Build Your Neighborhood Network?
            </h2>
            <p className="text-mountain-100 mb-8 text-lg">
              Start small, grow organically, and create lasting communication infrastructure for
              your community. The Colorado MeshCore community is here to help you succeed.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/start" className="btn-accent">
                Get Started
              </Link>
              <a
                href="https://discord.gg/Tuuv9hGPnX"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline border-white text-white hover:bg-white hover:text-night-950"
              >
                Join Discord
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
