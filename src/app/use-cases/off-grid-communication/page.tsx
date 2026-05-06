import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import { generateBreadcrumbSchema } from '@/lib/schemas/breadcrumb';
import { BASE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Off-Grid Communication Colorado | Backcountry & Hiking Mesh Network',
  description:
    'Stay connected in Colorado backcountry with off-grid mesh communication. MeshCore provides reliable hiking mesh networks for outdoor adventures, emergency preparedness, and remote area communication across the Rocky Mountains.',
  keywords: [
    'off-grid communication Colorado',
    'backcountry communication',
    'hiking mesh network',
    'Colorado wilderness communication',
    'Rocky Mountain mesh network',
    'off-grid radio Colorado',
    'backcountry emergency communication',
    'hiking communication device',
    'outdoor mesh network',
    'wilderness communication Colorado',
    'no cell service communication',
    'mountain mesh radio',
    'Colorado 14er communication',
    'trail communication device',
    'off-grid messaging Colorado',
  ],
  alternates: {
    canonical: '/use-cases/off-grid-communication',
  },
  openGraph: {
    title: 'Off-Grid Communication for Colorado Backcountry | Colorado MeshCore',
    description:
      'Reliable mesh network communication for hiking, camping, and wilderness adventures in Colorado. Stay connected where cell service fails.',
    url: `${BASE_URL}/use-cases/off-grid-communication`,
  },
};

const breadcrumbData = generateBreadcrumbSchema([
  { name: 'Home', url: BASE_URL },
  { name: 'Use Cases', url: `${BASE_URL}/use-cases` },
  { name: 'Off-Grid Communication', url: `${BASE_URL}/use-cases/off-grid-communication` },
]);

const useCaseScenarios = [
  {
    title: 'Backcountry Hiking',
    description:
      'Stay in contact with your hiking group on Colorado 14ers and remote trails where cell service is nonexistent. MeshCore radios work beyond line-of-sight through repeater networks.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'Camping & Dispersed Recreation',
    description:
      'Coordinate between campsites spread across remote areas. Perfect for family camping trips in the Roosevelt National Forest, Pike National Forest, or other Colorado wilderness areas.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    title: 'Skiing & Snowsports',
    description:
      'Keep your group connected at Colorado ski resorts and in the backcountry. Cell towers get overloaded on busy days, but mesh radios maintain reliable communication.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: 'Search & Rescue Support',
    description:
      'Support search and rescue operations in remote Colorado wilderness. Mesh networks provide communication infrastructure where traditional methods fail.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

const coloradoLocations = [
  {
    name: 'Colorado 14ers',
    description:
      'From Longs Peak to Pikes Peak, mesh radios provide communication across Colorado\'s famous fourteeners where cell service is often unavailable.',
  },
  {
    name: 'Rocky Mountain National Park',
    description:
      'Navigate RMNP trails with confidence. Mesh networks work through the rugged terrain where cell signals cannot penetrate.',
  },
  {
    name: 'Indian Peaks Wilderness',
    description:
      'Popular backcountry area near Boulder with limited cell coverage. MeshCore fills the communication gap for hikers and campers.',
  },
  {
    name: 'San Juan Mountains',
    description:
      'Remote wilderness in southwestern Colorado. Mesh radios are essential for multi-day backpacking trips in this rugged terrain.',
  },
  {
    name: 'Front Range Foothills',
    description:
      'Even areas close to Denver can have spotty cell coverage. MeshCore provides reliable local communication for day hikers and trail runners.',
  },
  {
    name: 'Continental Divide Trail',
    description:
      'Colorado\'s section of the CDT crosses remote high country where mesh communication is invaluable for thru-hikers and section hikers.',
  },
];

const features = [
  {
    title: 'No Cell Service Required',
    description:
      'MeshCore radios communicate directly with each other using LoRa technology. Your messages travel through the mesh network, not cell towers.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
      </svg>
    ),
  },
  {
    title: 'Long Range Communication',
    description:
      'LoRa signals can travel 10+ miles in open terrain. With strategically placed repeaters, messages can span the entire Front Range.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
      </svg>
    ),
  },
  {
    title: 'Battery Efficient',
    description:
      'MeshCore companion devices are optimized for low power consumption, lasting days on a single charge or running indefinitely on small solar panels.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    title: 'Lightweight & Portable',
    description:
      'MeshCore devices weigh just a few ounces and fit easily in your pack. Designed for outdoor adventurers who count every gram.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
  },
  {
    title: 'Works Through Mountains',
    description:
      'Colorado MeshCore repeaters are strategically placed on high points across Colorado, extending coverage through valleys and mountain passes.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    title: 'Emergency SOS Capability',
    description:
      'In an emergency, send SOS messages through the mesh network. Your location and message can reach help even without direct line of sight.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
];

const comparisons = [
  {
    method: 'Cell Phones',
    coverage: 'Limited in backcountry',
    reliability: 'Fails in remote areas',
    cost: 'Monthly fees + roaming',
    meshAdvantage: 'MeshCore works where cell phones cannot reach',
  },
  {
    method: 'Satellite Messengers',
    coverage: 'Global (clear sky required)',
    reliability: 'Good, but slow',
    cost: '$15-50/month subscription',
    meshAdvantage: 'MeshCore is free to use with no subscriptions',
  },
  {
    method: 'Ham Radio',
    coverage: 'Excellent with proper setup',
    reliability: 'Very reliable',
    cost: 'License required',
    meshAdvantage: 'MeshCore requires no license (Part 15 compliant)',
  },
  {
    method: 'FRS/GMRS Radios',
    coverage: '0.5-2 miles typically',
    reliability: 'Line of sight only',
    cost: 'Low upfront, limited range',
    meshAdvantage: 'MeshCore extends range through mesh networking',
  },
];

const faqs = [
  {
    question: 'Do I need a license to use MeshCore in Colorado?',
    answer:
      'No. MeshCore operates on the 915MHz ISM band, which is license-free in the United States under FCC Part 15 rules. Anyone can use MeshCore devices without any radio license or permits.',
  },
  {
    question: 'How far can MeshCore communicate in the mountains?',
    answer:
      'Direct line-of-sight range is typically 5-15 miles depending on terrain. With the Colorado MeshCore repeater network, messages can travel across the entire Front Range through multiple hops.',
  },
  {
    question: 'Will MeshCore work in deep canyons or valleys?',
    answer:
      'Yes, if there are repeaters on nearby high points. The Colorado MeshCore network is designed with repeaters strategically placed to provide coverage through valleys and mountain passes.',
  },
  {
    question: 'What happens if I\'m the only MeshCore user in an area?',
    answer:
      'You can still communicate with anyone else in direct radio range (typically several miles). For extended range, you\'ll benefit from the network of repeaters that Colorado MeshCore volunteers maintain.',
  },
  {
    question: 'Is MeshCore reliable enough for emergency use?',
    answer:
      'MeshCore provides a reliable backup communication method, but should not be your only emergency option. We recommend carrying multiple communication methods for backcountry safety.',
  },
  {
    question: 'How do I get started with off-grid communication in Colorado?',
    answer:
      'Get a compatible LoRa radio, flash it with MeshCore firmware, and join the Colorado MeshCore Discord community for help with setup and to connect with other users in your area.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

export default function OffGridCommunicationPage() {
  return (
    <>
      <JsonLd data={breadcrumbData} />
      <JsonLd data={faqSchema} />
      <div className="min-h-screen bg-mesh">
        {/* Hero Section */}
        <section className="px-6 py-16 md:py-24 text-center bg-mountain-gradient text-white">
          <div className="max-w-4xl mx-auto">
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Use Cases', href: '/use-cases' }, { label: 'Off-Grid Communication' }]} />
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
              <svg className="w-5 h-5 text-mesh-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span className="text-sm font-medium">Colorado Backcountry Communication</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Off-Grid Communication for
              <span className="block text-mesh-light">Colorado Adventurers</span>
            </h1>
            <p className="text-xl md:text-2xl text-mountain-100 mb-8 max-w-2xl mx-auto">
              Stay connected on hiking trails, 14ers, and remote wilderness areas where cell phones fail.
              MeshCore provides reliable off-grid messaging across the Rocky Mountains.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/start" className="btn-accent">
                Get Your Mesh Device
              </Link>
              <Link href="/map" className="btn-outline border-white text-white hover:bg-white hover:text-night-950">
                View Network Coverage
              </Link>
            </div>
          </div>
        </section>

        {/* Use Case Scenarios */}
        <section className="px-6 py-16 bg-background-secondary">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground text-center">
              Where Off-Grid Communication Matters
            </h2>
            <p className="text-foreground-muted text-center mb-12 max-w-2xl mx-auto">
              Colorado&apos;s diverse terrain creates endless situations where traditional communication fails.
              MeshCore keeps you connected.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {useCaseScenarios.map((scenario) => (
                <div key={scenario.title} className="card-mesh p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-mesh/10 text-mesh flex-shrink-0">
                      {scenario.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-foreground">{scenario.title}</h3>
                      <p className="text-foreground-muted">{scenario.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Colorado Locations Section */}
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground text-center">
              Off-Grid Areas Across Colorado
            </h2>
            <p className="text-foreground-muted text-center mb-12 max-w-2xl mx-auto">
              These popular Colorado destinations often have limited or no cell service.
              MeshCore provides the communication solution.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coloradoLocations.map((location) => (
                <div key={location.name} className="card-mesh p-6">
                  <h3 className="text-lg font-bold mb-2 text-foreground flex items-center gap-2">
                    <svg className="w-5 h-5 text-forest-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {location.name}
                  </h3>
                  <p className="text-sm text-foreground-muted">{location.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-16 bg-background-secondary">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground text-center">
              Why Choose MeshCore for Backcountry Communication
            </h2>
            <p className="text-foreground-muted text-center mb-12 max-w-2xl mx-auto">
              Purpose-built for outdoor adventurers in Colorado&apos;s challenging terrain.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <div key={feature.title} className="card-mesh p-6">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-mesh/10 text-mesh mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-sm text-foreground-muted">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="px-6 py-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground text-center">
              MeshCore vs. Other Off-Grid Options
            </h2>
            <p className="text-foreground-muted text-center mb-12 max-w-2xl mx-auto">
              How does MeshCore compare to other backcountry communication methods?
            </p>

            <div className="card-mesh overflow-hidden">
              <table className="w-full">
                <thead className="bg-night-800/50">
                  <tr>
                    <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-foreground">Method</th>
                    <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-foreground hidden md:table-cell">Coverage</th>
                    <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-foreground hidden lg:table-cell">Reliability</th>
                    <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-mesh">MeshCore Advantage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border">
                  {comparisons.map((comparison) => (
                    <tr key={comparison.method} className="hover:bg-night-800/30 transition-colors">
                      <td className="px-4 md:px-6 py-4 text-foreground font-medium text-sm">{comparison.method}</td>
                      <td className="px-4 md:px-6 py-4 text-foreground-muted text-sm hidden md:table-cell">{comparison.coverage}</td>
                      <td className="px-4 md:px-6 py-4 text-foreground-muted text-sm hidden lg:table-cell">{comparison.reliability}</td>
                      <td className="px-4 md:px-6 py-4 text-forest-500 text-sm font-medium">{comparison.meshAdvantage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="px-6 py-16 bg-background-secondary">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground text-center">
              Frequently Asked Questions
            </h2>
            <p className="text-foreground-muted text-center mb-12 max-w-2xl mx-auto">
              Common questions about off-grid communication in Colorado with MeshCore.
            </p>

            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.question} className="card-mesh p-6">
                  <h3 className="text-lg font-bold mb-2 text-foreground">{faq.question}</h3>
                  <p className="text-foreground-muted">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-16 bg-night-stars text-white text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready for Off-Grid Adventures?
            </h2>
            <p className="text-mountain-100 mb-8 text-lg">
              Join Colorado MeshCore and stay connected on your next Colorado backcountry adventure.
              Get your device, connect to the network, and explore with confidence.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/start" className="btn-accent">
                Get Started
              </Link>
              <a
                href="https://discord.gg/QpaW8FTTCE"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline border-white text-white hover:bg-white hover:text-night-950"
              >
                Join Discord Community
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
