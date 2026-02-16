import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import { generateBreadcrumbSchema } from '@/lib/schemas/breadcrumb';
import { BASE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Emergency Communication Network Colorado | Disaster-Ready Mesh Network',
  description:
    'Build a disaster communication mesh network in Colorado. MeshCore provides emergency communication when cell towers fail during wildfires, blizzards, earthquakes, and power outages across the Front Range.',
  keywords: [
    'emergency communication network Colorado',
    'disaster communication mesh',
    'Colorado emergency mesh network',
    'off-grid communication Colorado',
    'emergency preparedness Colorado',
    'wildfire communication',
    'blizzard emergency radio',
    'Front Range emergency network',
    'disaster preparedness mesh',
    'Colorado ham radio alternative',
    'LoRa emergency network',
    'decentralized emergency communication',
  ],
  alternates: {
    canonical: '/use-cases/emergency-communication',
  },
  openGraph: {
    title: 'Emergency Communication Network Colorado | Denver MeshCore',
    description:
      'When cell towers fail during wildfires, blizzards, or power outages, MeshCore keeps Colorado communities connected. Build resilient emergency communication infrastructure.',
    url: `${BASE_URL}/use-cases/emergency-communication`,
  },
};

const breadcrumbData = generateBreadcrumbSchema([
  { name: 'Home', url: BASE_URL },
  { name: 'Use Cases', url: `${BASE_URL}/use-cases` },
  { name: 'Emergency Communication', url: `${BASE_URL}/use-cases/emergency-communication` },
]);

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Emergency Communication Network for Colorado',
  description: 'How MeshCore provides disaster-ready mesh communication when traditional networks fail in Colorado.',
  author: {
    '@type': 'Organization',
    name: 'Denver MeshCore',
    url: BASE_URL,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Denver MeshCore',
    url: BASE_URL,
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${BASE_URL}/use-cases/emergency-communication`,
  },
};

const coloradoScenarios = [
  {
    title: 'Wildfire Evacuation Communication',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>
    ),
    description:
      'Colorado wildfires can move fast and take out cell towers. The Marshall Fire in 2021 left thousands without communication. MeshCore nodes on high points maintain connectivity when smoke and flames compromise infrastructure.',
    locations: ['Boulder County', 'Jefferson County', 'Larimer County', 'El Paso County'],
    benefits: [
      'Works when cell towers are destroyed or overloaded',
      'No internet dependency during power outages',
      'Coordinate evacuations across neighborhoods',
      'Battery-powered nodes run for days on solar',
    ],
  },
  {
    title: 'Blizzard & Winter Storm Communication',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
    description:
      'Colorado blizzards can dump feet of snow in hours, stranding travelers and knocking out power for days. The March 2021 bomb cyclone left 200,000+ without power. MeshCore keeps neighborhoods connected.',
    locations: ['I-70 Mountain Corridor', 'Denver Metro', 'Colorado Springs', 'Fort Collins'],
    benefits: [
      'Check on neighbors without leaving home',
      'Coordinate snow removal and supply sharing',
      'Report road conditions and stranded vehicles',
      'Maintain communication during multi-day outages',
    ],
  },
  {
    title: 'Mountain Search and Rescue',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    description:
      "Colorado's 14ers and backcountry see countless rescues annually. Cell coverage is spotty at best above treeline. MeshCore enables hikers and SAR teams to communicate across valleys and peaks.",
    locations: ['Rocky Mountain National Park', 'Fourteeners', 'Indian Peaks Wilderness', 'San Juan Mountains'],
    benefits: [
      'Coverage where cell phones fail',
      'Coordinate multi-team search operations',
      'Relay location data to base camp',
      'Lightweight companion devices for hikers',
    ],
  },
  {
    title: 'Flash Flood Warning Network',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
    description:
      'Colorado canyons experience dangerous flash floods during monsoon season. The Big Thompson flood of 1976 killed 144 people. MeshCore can relay upstream conditions to downstream communities in seconds.',
    locations: ['Big Thompson Canyon', 'Boulder Creek', 'Clear Creek Canyon', 'Arkansas River Valley'],
    benefits: [
      'Upstream sensors relay water levels in real-time',
      'Faster warning than cell-dependent systems',
      'Works in canyon depths with no cell coverage',
      'Community-to-community alerts',
    ],
  },
  {
    title: 'Power Grid Failure Communication',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    description:
      'Extended power outages stress cell networks as backup batteries drain. The 2020 Colorado outages showed how quickly communication fails. MeshCore nodes with solar panels provide indefinite coverage.',
    locations: ['Denver Metro', 'Aurora', 'Lakewood', 'Westminster'],
    benefits: [
      'Solar-powered nodes run indefinitely',
      'No dependency on grid-connected infrastructure',
      'Coordinate community resource sharing',
      'Check on elderly and vulnerable neighbors',
    ],
  },
  {
    title: 'Earthquake Emergency Response',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
    description:
      "While major earthquakes are rare in Colorado, the state has active fault lines. A significant quake could damage cell infrastructure instantly. MeshCore's decentralized design survives infrastructure damage.",
    locations: ['Denver Basin', 'Front Range', 'San Luis Valley', 'Western Slope'],
    benefits: [
      'No single point of failure',
      'Damage reports flow around affected areas',
      'Coordinate neighborhood response teams',
      'Connect with regional emergency services',
    ],
  },
];

const whyMeshForEmergency = [
  {
    title: 'No Internet Required',
    description:
      'MeshCore operates entirely offline. When ISPs go down, cables are cut, or data centers fail, your mesh network keeps working.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" />
      </svg>
    ),
  },
  {
    title: 'No Cell Towers Needed',
    description:
      'Traditional communication fails when towers are damaged, overloaded, or lose power. MeshCore uses decentralized nodes that route around failures.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
      </svg>
    ),
  },
  {
    title: 'Long Range Coverage',
    description:
      'LoRa technology reaches 10+ miles line-of-sight. Strategic high-point placement provides coverage across entire valleys and metro areas.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Days of Battery Life',
    description:
      'Low-power LoRa radios run for days on batteries. Solar-powered repeater nodes provide indefinite operation without grid power.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    title: 'Encrypted Communication',
    description:
      'AES-256 encryption protects sensitive emergency communications. Your family check-ins and coordination messages stay private.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    title: 'No Licensing Required',
    description:
      'Unlike ham radio, MeshCore uses license-free ISM band frequencies. Anyone can operate a node without FCC certification.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const gettingStartedSteps = [
  {
    step: 1,
    title: 'Get a MeshCore Device',
    description:
      'Start with a Heltec V3 or RAK WisBlock. These affordable devices (~$20-40) are your entry into emergency mesh communication.',
  },
  {
    step: 2,
    title: 'Flash MeshCore Firmware',
    description:
      'Download and flash MeshCore firmware to your device. Our getting started guide walks you through the process step by step.',
  },
  {
    step: 3,
    title: 'Join the Denver Network',
    description:
      'Connect to the existing Denver MeshCore network. Your node automatically discovers and links with nearby repeaters.',
  },
  {
    step: 4,
    title: 'Build Redundancy',
    description:
      'Add a solar-powered repeater on your roof or high point. The more nodes, the more resilient the emergency network becomes.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Does MeshCore work during power outages in Colorado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. MeshCore nodes can run on batteries for days, and solar-powered repeater installations provide indefinite operation. The network continues functioning even when the power grid fails.',
      },
    },
    {
      '@type': 'Question',
      name: 'How far can MeshCore communicate in Colorado mountains?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Line-of-sight communication can reach 10+ miles between nodes. With repeaters placed on peaks and high points, the Denver MeshCore network provides coverage across the Front Range and beyond.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need a license to use MeshCore for emergency communication?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. MeshCore operates on license-free ISM band frequencies (902-928 MHz in the US), so no FCC license is required unlike amateur radio.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can MeshCore replace my cell phone for emergencies?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MeshCore is designed to supplement cell coverage, not replace it entirely. It excels when cell networks fail during disasters, power outages, or in remote areas without coverage.',
      },
    },
  ],
};

export default function EmergencyCommunicationPage() {
  return (
    <>
      <JsonLd data={breadcrumbData} />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />
      <div className="min-h-screen bg-mesh">
        {/* Hero Section */}
        <section className="relative px-6 py-16 md:py-24 text-center bg-gradient-to-b from-sunset-600 to-sunset-800 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg
              className="absolute bottom-0 w-full h-64"
              viewBox="0 0 1440 320"
              preserveAspectRatio="none"
              fill="currentColor"
            >
              <path
                className="text-night-950"
                d="M0,256L48,240C96,224,192,192,288,186.7C384,181,480,203,576,218.7C672,235,768,245,864,234.7C960,224,1056,192,1152,181.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              />
            </svg>
          </div>
          <div className="relative max-w-4xl mx-auto">
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Use Cases', href: '/use-cases' }, { label: 'Emergency Communication' }]} />
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Emergency Preparedness
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Emergency Communication Network for <span className="text-sunset-200">Colorado</span>
            </h1>
            <p className="text-xl md:text-2xl text-sunset-100 mb-8 max-w-3xl mx-auto">
              When wildfires, blizzards, and power outages take down cell towers, MeshCore keeps
              Colorado communities connected. Build disaster-ready communication infrastructure
              that works when traditional networks fail.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/start" className="btn-primary bg-white text-sunset-700 hover:bg-sunset-50">
                Build Your Emergency Network
              </Link>
              <a href="#scenarios" className="btn-outline border-white text-white hover:bg-white/10">
                Colorado Scenarios
              </a>
            </div>
          </div>
        </section>

        {/* Why Mesh for Emergency */}
        <section className="px-6 py-16 bg-background-secondary">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Why Mesh Networks for Disaster Communication?
              </h2>
              <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
                Traditional communication infrastructure has single points of failure. MeshCore&apos;s
                decentralized design keeps working when everything else fails.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {whyMeshForEmergency.map((item) => (
                <div key={item.title} className="card-mesh p-6">
                  <div className="w-12 h-12 rounded-lg bg-mesh/10 flex items-center justify-center mb-4 text-mesh">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground">{item.title}</h3>
                  <p className="text-foreground-muted text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Colorado-Specific Scenarios */}
        <section id="scenarios" className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Colorado Emergency Scenarios
              </h2>
              <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
                From the Front Range to the Western Slope, Colorado faces unique emergency
                communication challenges. MeshCore is built for these real-world scenarios.
              </p>
            </div>

            <div className="space-y-8">
              {coloradoScenarios.map((scenario) => (
                <div key={scenario.title} className="card-mesh p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-xl bg-sunset-500/10 flex items-center justify-center text-sunset-500">
                        {scenario.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-bold mb-3 text-foreground">
                        {scenario.title}
                      </h3>
                      <p className="text-foreground-muted mb-4">{scenario.description}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {scenario.locations.map((location) => (
                          <span
                            key={location}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-mountain-500/10 text-mountain-600 dark:text-mountain-400"
                          >
                            {location}
                          </span>
                        ))}
                      </div>

                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {scenario.benefits.map((benefit, index) => (
                          <li key={index} className="text-sm text-foreground-muted flex items-start gap-2">
                            <span className="text-forest-500 mt-0.5 flex-shrink-0">&#10003;</span>
                            <span>{benefit}</span>
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

        {/* Getting Started Section */}
        <section className="px-6 py-16 bg-background-secondary">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Start Your Emergency Network Today
              </h2>
              <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
                Don&apos;t wait for disaster to strike. Building emergency communication
                infrastructure takes time. Start now and be ready when it matters.
              </p>
            </div>

            <div className="space-y-6">
              {gettingStartedSteps.map((item) => (
                <div key={item.step} className="card-mesh p-6 flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-mesh flex items-center justify-center text-white font-bold text-lg">
                      {item.step}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-foreground">{item.title}</h3>
                    <p className="text-foreground-muted">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link href="/start" className="btn-primary">
                Get Started Guide
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="px-6 py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground text-center">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              {faqSchema.mainEntity.map((item, index) => (
                <div key={index} className="card-mesh p-6">
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{item.name}</h3>
                  <p className="text-foreground-muted">{item.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Community Stats */}
        <section className="px-6 py-16 bg-mountain-gradient text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join Colorado&apos;s Growing Emergency Network
            </h2>
            <p className="text-mountain-100 text-lg mb-8 max-w-2xl mx-auto">
              The Denver MeshCore network is already providing coverage across the Front Range.
              Every new node makes the emergency network more resilient.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/map" className="btn-accent">
                View Network Map
              </Link>
              <a
                href="https://discord.gg/QpaW8FTTCE"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline border-white text-white hover:bg-white hover:text-mountain-700"
              >
                Join Discord Community
              </a>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 py-16 bg-night-stars text-white text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Be Ready When Disaster Strikes
            </h2>
            <p className="text-mountain-100 mb-8 text-lg">
              The best time to build emergency communication infrastructure is before you need it.
              Join the Denver MeshCore community and help build Colorado&apos;s disaster-ready mesh network.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/start" className="btn-accent">
                Get Started Now
              </Link>
              <Link href="/why-meshcore" className="btn-outline border-white text-white hover:bg-white hover:text-night-950">
                Learn About MeshCore
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
