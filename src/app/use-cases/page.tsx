import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import { generateBreadcrumbSchema } from '@/lib/schemas/breadcrumb';
import { BASE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'MeshCore Use Cases | Emergency, Off-Grid & Community Networks',
  description:
    'Discover how MeshCore mesh networks are used for emergency communication, off-grid adventures, and community networks in Colorado. Learn about practical applications for decentralized mesh technology.',
  keywords: [
    'mesh network use cases',
    'emergency communication mesh',
    'off-grid communication',
    'community mesh network',
    'Colorado mesh network applications',
    'disaster communication network',
    'backcountry communication',
    'neighborhood mesh network',
    'LoRa mesh applications',
    'decentralized communication uses',
    'MeshCore applications',
    'Colorado mesh use cases',
  ],
  alternates: {
    canonical: '/use-cases',
  },
  openGraph: {
    title: 'MeshCore Use Cases | Colorado MeshCore',
    description:
      'Explore practical applications for mesh networks: emergency preparedness, off-grid communication, and community networks across Colorado.',
    url: `${BASE_URL}/use-cases`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MeshCore Use Cases | Colorado MeshCore',
    description:
      'Explore practical applications for mesh networks: emergency preparedness, off-grid communication, and community networks across Colorado.',
  },
};

const breadcrumbData = generateBreadcrumbSchema([
  { name: 'Home', url: BASE_URL },
  { name: 'Use Cases', url: `${BASE_URL}/use-cases` },
]);

const useCases = [
  {
    slug: 'emergency-communication',
    title: 'Emergency Communication',
    shortTitle: 'Emergency',
    description:
      'Build disaster-ready communication infrastructure that works when cell towers fail. Ideal for wildfire evacuations, blizzards, power outages, and search & rescue operations across Colorado.',
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    color: 'sunset',
    highlights: [
      'Works when cell towers fail',
      'No internet dependency',
      'Battery/solar powered',
      'Encrypted communication',
    ],
  },
  {
    slug: 'off-grid-communication',
    title: 'Off-Grid Communication',
    shortTitle: 'Off-Grid',
    description:
      'Stay connected in Colorado backcountry where cell service fails. Perfect for hiking, camping, skiing, and outdoor adventures across the Rocky Mountains and beyond.',
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    color: 'mountain',
    highlights: [
      'No cell service required',
      '10+ mile range',
      'Lightweight & portable',
      'Long battery life',
    ],
  },
  {
    slug: 'community-networks',
    title: 'Community Networks',
    shortTitle: 'Community',
    description:
      'Build resilient neighborhood networks owned and operated by your community. Perfect for HOAs, rural areas, mountain towns, and apartment buildings seeking independent communication.',
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    color: 'forest',
    highlights: [
      'Zero monthly costs',
      'Community owned',
      'Privacy focused',
      'Builds connections',
    ],
  },
];

const getColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; text: string; border: string; badge: string }> = {
    sunset: {
      bg: 'bg-sunset-500/10',
      text: 'text-sunset-500',
      border: 'border-sunset-500/30 hover:border-sunset-500',
      badge: 'bg-sunset-500/10 text-sunset-600 dark:text-sunset-400',
    },
    mountain: {
      bg: 'bg-mountain-500/10',
      text: 'text-mountain-500',
      border: 'border-mountain-500/30 hover:border-mountain-500',
      badge: 'bg-mountain-500/10 text-mountain-600 dark:text-mountain-400',
    },
    forest: {
      bg: 'bg-forest-500/10',
      text: 'text-forest-500',
      border: 'border-forest-500/30 hover:border-forest-500',
      badge: 'bg-forest-500/10 text-forest-600 dark:text-forest-400',
    },
  };
  return colors[color] || colors.sunset;
};

const pageSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'MeshCore Use Cases',
  description:
    'Discover how MeshCore mesh networks are used for emergency communication, off-grid adventures, and community networks in Colorado.',
  url: `${BASE_URL}/use-cases`,
  publisher: {
    '@type': 'Organization',
    name: 'Colorado MeshCore',
    url: BASE_URL,
  },
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: useCases.map((useCase, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: useCase.title,
      url: `${BASE_URL}/use-cases/${useCase.slug}`,
    })),
  },
};

export default function UseCasesPage() {
  return (
    <>
      <JsonLd data={breadcrumbData} />
      <JsonLd data={pageSchema} />
      <div className="min-h-screen bg-mesh">
        {/* Hero Section */}
        <section className="px-6 py-16 md:py-24 text-center">
          <div className="max-w-4xl mx-auto">
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Use Cases' }]} />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              MeshCore <span className="text-mesh">Use Cases</span>
            </h1>
            <p className="text-xl md:text-2xl text-foreground-muted mb-4 max-w-3xl mx-auto">
              Discover how mesh networks are transforming communication in Colorado
              &mdash; from disaster preparedness to outdoor adventures.
            </p>
            <p className="text-lg text-foreground-muted mb-8 max-w-2xl mx-auto">
              MeshCore provides decentralized, resilient communication that works when
              traditional networks fail. Explore our most popular applications below.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/start" className="btn-primary">
                Get Started
              </Link>
              <Link href="/map" className="btn-outline">
                View Network Map
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases Grid */}
        <section className="px-6 py-16 bg-background-secondary">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground text-center">
              Explore Use Cases
            </h2>
            <p className="text-foreground-muted text-center mb-12 max-w-2xl mx-auto">
              From emergency preparedness to everyday communication, MeshCore adapts to your needs.
              Click on a use case to learn more.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {useCases.map((useCase) => {
                const colors = getColorClasses(useCase.color);
                return (
                  <Link
                    key={useCase.slug}
                    href={`/use-cases/${useCase.slug}`}
                    className={`card-mesh p-8 border-2 ${colors.border} transition-all group flex flex-col`}
                  >
                    <div
                      className={`w-20 h-20 rounded-2xl ${colors.bg} ${colors.text} flex items-center justify-center mb-6`}
                    >
                      {useCase.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-mesh transition-colors">
                      {useCase.title}
                    </h3>
                    <p className="text-foreground-muted mb-6 flex-grow">{useCase.description}</p>

                    <div className="space-y-3 mb-6">
                      {useCase.highlights.map((highlight, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm text-foreground-muted"
                        >
                          <span className={colors.text}>&#10003;</span>
                          <span>{highlight}</span>
                        </div>
                      ))}
                    </div>

                    <div
                      className={`inline-flex items-center gap-2 ${colors.text} font-medium mt-auto`}
                    >
                      Learn More
                      <svg
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform"
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
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why MeshCore Section */}
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-foreground">
              Why Choose MeshCore?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card-mesh p-6 text-center">
                <div className="w-14 h-14 bg-mesh/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <svg
                    className="w-7 h-7 text-mesh"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3"
                    />
                  </svg>
                </div>
                <h3 className="font-bold mb-2 text-foreground">No Internet Required</h3>
                <p className="text-sm text-foreground-muted">
                  Works independently of ISPs and cellular networks
                </p>
              </div>
              <div className="card-mesh p-6 text-center">
                <div className="w-14 h-14 bg-forest-500/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <svg
                    className="w-7 h-7 text-forest-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold mb-2 text-foreground">Zero Monthly Fees</h3>
                <p className="text-sm text-foreground-muted">
                  One-time hardware cost, free to operate forever
                </p>
              </div>
              <div className="card-mesh p-6 text-center">
                <div className="w-14 h-14 bg-mountain-500/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <svg
                    className="w-7 h-7 text-mountain-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold mb-2 text-foreground">Encrypted & Private</h3>
                <p className="text-sm text-foreground-muted">
                  AES-256 encryption keeps your messages secure
                </p>
              </div>
              <div className="card-mesh p-6 text-center">
                <div className="w-14 h-14 bg-sunset-500/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <svg
                    className="w-7 h-7 text-sunset-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold mb-2 text-foreground">No License Needed</h3>
                <p className="text-sm text-foreground-muted">
                  Uses license-free ISM band frequencies
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-6 py-12 bg-background-secondary">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-mesh mb-2">10+</div>
                <div className="text-sm text-foreground-muted">Mile Range</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-forest-500 mb-2">$0</div>
                <div className="text-sm text-foreground-muted">Monthly Cost</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-mountain-500 mb-2">256-bit</div>
                <div className="text-sm text-foreground-muted">Encryption</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-sunset-500 mb-2">24/7</div>
                <div className="text-sm text-foreground-muted">Always On</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-16 bg-night-stars text-white text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-mountain-100 mb-8 text-lg">
              Join the Colorado MeshCore community and build resilient communication infrastructure.
              Whether you&apos;re preparing for emergencies, exploring the backcountry, or
              connecting your neighborhood, we&apos;re here to help.
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
