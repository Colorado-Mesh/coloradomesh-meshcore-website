import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import { HeroPanel, NetworkPanel, SectionEyebrow } from '@/components/brand';
import { generateBreadcrumbSchema } from '@/lib/schemas/breadcrumb';
import { BASE_URL, COMMUNITY_NAME, DISCORD_INVITE_URL, SITE_NAME } from '@/lib/constants';

const PAGE_TITLE = 'Emergency communication';

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
    title: `Emergency communication | ${SITE_NAME}`,
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
  description:
    'How MeshCore provides disaster-ready mesh communication when traditional networks fail in Colorado.',
  author: { '@type': 'Organization', name: 'Colorado MeshCore', url: BASE_URL },
  publisher: { '@type': 'Organization', name: 'Colorado MeshCore', url: BASE_URL },
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}/use-cases/emergency-communication` },
};

const coloradoScenarios = [
  {
    title: 'Wildfire evacuation',
    glyph: '◊',
    description:
      'Colorado wildfires move fast and take out cell towers. The Marshall Fire in 2021 left thousands without communication. MeshCore nodes on high points maintain connectivity when smoke and flames compromise infrastructure.',
    locations: ['Boulder County', 'Jefferson County', 'Larimer County', 'El Paso County'],
    benefits: [
      'Works when cell towers are destroyed or overloaded',
      'No internet dependency during power outages',
      'Coordinate evacuations across neighborhoods',
      'Battery-powered nodes run for days on solar',
    ],
  },
  {
    title: 'Blizzard & winter storm',
    glyph: '◇',
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
    title: 'Mountain search & rescue',
    glyph: '◉',
    description:
      "Colorado's 14ers and backcountry see countless rescues annually. Cell coverage is spotty above treeline. MeshCore lets hikers and SAR teams communicate across valleys and peaks.",
    locations: [
      'Rocky Mountain National Park',
      'Fourteeners',
      'Indian Peaks Wilderness',
      'San Juan Mountains',
    ],
    benefits: [
      'Coverage where cell phones fail',
      'Coordinate multi-team search operations',
      'Relay location data to base camp',
      'Lightweight companion devices for hikers',
    ],
  },
  {
    title: 'Flash flood warning',
    glyph: '◈',
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
    title: 'Power grid failure',
    glyph: '◊',
    description:
      'Extended power outages stress cell networks as backup batteries drain. The 2020 Colorado outages showed how quickly communication fails. Solar-powered MeshCore nodes provide indefinite coverage.',
    locations: ['Denver Metro', 'Aurora', 'Lakewood', 'Westminster'],
    benefits: [
      'Solar-powered nodes run indefinitely',
      'No dependency on grid-connected infrastructure',
      'Coordinate community resource sharing',
      'Check on elderly and vulnerable neighbors',
    ],
  },
  {
    title: 'Earthquake response',
    glyph: '◇',
    description:
      "Colorado has active fault lines. A significant quake could damage cell infrastructure instantly. MeshCore's decentralized design survives infrastructure damage.",
    locations: ['Denver Basin', 'Front Range', 'San Luis Valley', 'Western Slope'],
    benefits: [
      'No single point of failure',
      'Damage reports flow around affected areas',
      'Coordinate neighborhood response teams',
      'Connect with regional emergency services',
    ],
  },
] as const;

const whyMeshForEmergency = [
  {
    title: 'No internet required',
    description:
      'MeshCore operates entirely offline. When ISPs go down, cables are cut, or data centers fail, your mesh keeps working.',
    glyph: '◊',
  },
  {
    title: 'No cell towers needed',
    description:
      'Decentralized nodes route around damaged or overloaded towers. No carrier dependency.',
    glyph: '◇',
  },
  {
    title: 'Long-range coverage',
    description:
      'LoRa reaches 10+ miles line-of-sight. Strategic high-point placement covers entire valleys.',
    glyph: '◉',
  },
  {
    title: 'Days of battery life',
    description:
      'Low-power radios run for days on batteries. Solar repeaters provide indefinite operation.',
    glyph: '◈',
  },
  {
    title: 'Encrypted communication',
    description:
      'AES-256 protects sensitive emergency communications — family check-ins stay private.',
    glyph: '◊',
  },
  {
    title: 'No licensing required',
    description:
      'License-free ISM band frequencies. Anyone can run a node — no FCC certification needed.',
    glyph: '◇',
  },
] as const;

const gettingStartedSteps = [
  {
    step: 1,
    title: 'Get a MeshCore device',
    description:
      'Start with a Heltec V3 or RAK WisBlock. Affordable devices (~$20–40) are your entry into emergency mesh communication.',
  },
  {
    step: 2,
    title: 'Flash MeshCore firmware',
    description:
      'Download and flash MeshCore firmware to your device. Our getting started guide walks you through every step.',
  },
  {
    step: 3,
    title: `Join the ${COMMUNITY_NAME} network`,
    description:
      'Connect to the existing Colorado MeshCore network. Your node automatically discovers and links with nearby repeaters.',
  },
  {
    step: 4,
    title: 'Build redundancy',
    description:
      'Add a solar-powered repeater on your roof or high point. The more nodes, the more resilient the network.',
  },
] as const;

const faqs = [
  {
    name: 'Does MeshCore work during power outages in Colorado?',
    answer:
      'Yes. MeshCore nodes can run on batteries for days, and solar-powered repeater installations provide indefinite operation. The network keeps functioning even when the power grid fails.',
  },
  {
    name: 'How far can MeshCore communicate in Colorado mountains?',
    answer:
      'Line-of-sight communication can reach 10+ miles between nodes. With repeaters on peaks and high points, the network provides coverage across the Front Range and beyond.',
  },
  {
    name: 'Do I need a license to use MeshCore for emergency communication?',
    answer:
      'No. MeshCore operates on license-free ISM band frequencies (902–928 MHz in the US), so no FCC license is required unlike amateur radio.',
  },
  {
    name: 'Can MeshCore replace my cell phone for emergencies?',
    answer:
      'MeshCore is designed to supplement cell coverage, not replace it entirely. It excels when cell networks fail during disasters, power outages, or in remote areas without coverage.',
  },
] as const;

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((item) => ({
    '@type': 'Question',
    name: item.name,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
};

export default function EmergencyCommunicationPage() {
  return (
    <>
      <JsonLd data={breadcrumbData} />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />
      <div className="min-h-screen">
        <HeroPanel
          background="topo-grid"
          showMountains
          eyebrow="Use case · Emergency"
          eyebrowTone="sunset"
          title={
            <>
              Emergency communication
              <span className="block text-mesh">for Colorado</span>
            </>
          }
          description="When wildfires, blizzards, and power outages take down cell towers, MeshCore keeps Colorado communities connected. Build disaster-ready communication infrastructure that works when traditional networks fail."
          actions={
            <>
              <Link href="/start" className="btn-primary">
                Build your network
              </Link>
              <a href="#scenarios" className="btn-secondary">
                Colorado scenarios
              </a>
              <Link href="/map" className="btn-outline">
                Live map
              </Link>
            </>
          }
          meta={
            <div className="panel px-5 sm:px-6 py-4 backdrop-blur-md bg-card/85">
              <Breadcrumbs
                items={[
                  { label: 'Home', href: '/' },
                  { label: 'Use Cases', href: '/use-cases' },
                  { label: PAGE_TITLE },
                ]}
              />
            </div>
          }
        />

        {/* Why mesh for emergency */}
        <section className="relative z-10 px-4 sm:px-6 lg:px-8 pb-16 -mt-10">
          <div className="mx-auto max-w-7xl">
            <SectionEyebrow tone="sunset" className="mb-3">
              Why mesh for disaster comms?
            </SectionEyebrow>
            <p className="mb-8 text-foreground-muted max-w-2xl">
              Traditional infrastructure has single points of failure. MeshCore&apos;s decentralized
              design keeps working when everything else fails.
            </p>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {whyMeshForEmergency.map((item) => (
                <NetworkPanel
                  key={item.title}
                  eyebrow={item.title}
                  eyebrowTone="sunset"
                  padding="md"
                  className="h-full"
                >
                  <div className="flex items-start gap-3">
                    <span aria-hidden className="text-3xl text-mesh leading-none">
                      {item.glyph}
                    </span>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </NetworkPanel>
              ))}
            </div>
          </div>
        </section>

        {/* Colorado scenarios */}
        <section id="scenarios" className="bg-background-secondary py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <SectionEyebrow tone="mesh" className="justify-center">
                Colorado scenarios
              </SectionEyebrow>
              <h2 className="mt-3 text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
                Front Range to Western Slope.
              </h2>
              <p className="mt-3 text-foreground-muted max-w-2xl mx-auto">
                Colorado faces unique communication challenges. MeshCore is built for these
                real-world scenarios.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {coloradoScenarios.map((scenario) => (
                <article key={scenario.title} className="panel p-6 sm:p-7 h-full">
                  <div className="flex items-start gap-4">
                    <span aria-hidden className="text-4xl text-sunset-500 leading-none">
                      {scenario.glyph}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-foreground tracking-tight">
                        {scenario.title}
                      </h3>
                      <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
                        {scenario.description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {scenario.locations.map((location) => (
                          <span key={location} className="tag-mono">
                            {location}
                          </span>
                        ))}
                      </div>

                      <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {scenario.benefits.map((benefit) => (
                          <li
                            key={benefit}
                            className="text-sm text-foreground-muted flex items-start gap-2"
                          >
                            <span aria-hidden className="text-mesh mt-0.5">
                              ◊
                            </span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Getting started steps */}
        <section className="bg-background py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <SectionEyebrow tone="mesh" className="justify-center">
                Start your emergency network
              </SectionEyebrow>
              <h2 className="mt-3 text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
                Build it before you need it.
              </h2>
              <p className="mt-3 text-foreground-muted max-w-2xl mx-auto">
                Don&apos;t wait for disaster. Emergency communication infrastructure takes time —
                start now.
              </p>
            </div>

            <div className="space-y-4">
              {gettingStartedSteps.map((item) => (
                <div key={item.step} className="panel p-6 flex gap-5 items-start">
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-full bg-mesh/15 border border-mesh/40 flex items-center justify-center font-mono font-semibold text-mesh"
                    aria-hidden
                  >
                    {item.step.toString().padStart(2, '0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-foreground-muted leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link href="/start" className="btn-primary">
                Get started guide
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-background-secondary py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <SectionEyebrow tone="sky" className="justify-center">
                FAQ
              </SectionEyebrow>
              <h2 className="mt-3 text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
                Frequently asked questions.
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.name} className="panel p-6">
                  <h3 className="text-lg font-semibold text-foreground tracking-tight">
                    {faq.name}
                  </h3>
                  <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-night-stars py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <SectionEyebrow tone="sunset" className="justify-center">
              Be ready when disaster strikes
            </SectionEyebrow>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold text-snow-100 tracking-tight">
              Build it before you need it.
            </h2>
            <p className="mt-4 text-lg text-mountain-100 leading-relaxed">
              The best time to build emergency communication infrastructure is before you need it.
              Join {COMMUNITY_NAME} and help build Colorado&apos;s disaster-ready mesh.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/start" className="btn-primary">
                Get Started
              </Link>
              <Link href="/why-meshcore" className="btn-secondary">
                Why MeshCore
              </Link>
              <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                Discord
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
