import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import { generateBreadcrumbSchema } from '@/lib/schemas/breadcrumb';
import { generateFAQSchema } from '@/lib/schemas/faq';

export const metadata: Metadata = {
  title: 'Why MeshCore?',
  description:
    'Discover why MeshCore offers faster messaging, better battery life, and more reliable communication than traditional mesh networks. Learn about the advantages of MeshCore for city-scale mesh networking.',
  keywords: [
    'MeshCore',
    'Meshtastic alternative',
    'mesh network comparison',
    'LoRa mesh',
    'off-grid communication',
    'decentralized network',
    'Denver mesh',
  ],
  alternates: {
    canonical: '/why-meshcore',
  },
  openGraph: {
    title: 'Why MeshCore? | Denver MeshCore',
    description:
      'Faster messaging, better battery life, and city-scale reliability. Discover why MeshCore is the choice for serious mesh networking.',
    url: 'https://denvermc.com/why-meshcore',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@denver_meshcore',
    creator: '@denver_meshcore',
    title: 'Why MeshCore? | Denver MeshCore',
    description:
      'Faster messaging, better battery life, and city-scale reliability. Discover why MeshCore is the choice for serious mesh networking.',
    images: ['/logo-512.png'],
  },
};

const breadcrumbData = generateBreadcrumbSchema([
  { name: 'Home', url: 'https://denvermc.com' },
  { name: 'Why MeshCore?', url: 'https://denvermc.com/why-meshcore' },
]);

// FAQ data for MeshCore vs Meshtastic comparison questions
const whyMeshCoreFAQData = [
  {
    question: 'What is the difference between MeshCore and Meshtastic?',
    answer:
      'MeshCore and Meshtastic are both LoRa mesh networking protocols but with different design philosophies. MeshCore uses dedicated repeaters for routing while client devices stay quiet, reducing network congestion. Meshtastic uses a flooding approach where all nodes can relay messages. MeshCore supports up to 64 hops versus Meshtastic\'s 7 hops, making it better suited for city-scale infrastructure networks. Meshtastic has a larger community (~40,000+ users) while MeshCore is growing (~3,500+ users).',
  },
  {
    question: 'Why does MeshCore support 64 hops while Meshtastic only supports 7?',
    answer:
      'MeshCore\'s 64-hop limit versus Meshtastic\'s 7-hop limit comes from their different routing architectures. Meshtastic uses flooding where every node rebroadcasts, so limiting hops prevents exponential message multiplication. MeshCore uses intelligent repeater-based routing where only dedicated repeaters relay messages, allowing much longer routes without network saturation. This makes MeshCore ideal for spanning cities and regions.',
  },
  {
    question: 'Does MeshCore have better battery life than Meshtastic?',
    answer:
      'Yes, MeshCore typically offers better battery life for edge devices because only dedicated repeaters relay messages. In Meshtastic, every node rebroadcasts all messages, consuming more power. MeshCore\'s "repeaters route, edge nodes don\'t pollute" philosophy means companion devices use significantly less power, making it ideal for solar-powered installations and portable use.',
  },
  {
    question: 'How does MeshCore reduce network congestion compared to Meshtastic?',
    answer:
      'MeshCore reduces congestion by separating device roles: Companion devices connect via Bluetooth to phones and don\'t relay traffic, while dedicated Repeaters handle all routing. Meshtastic uses flooding where all nodes rebroadcast messages by default. This means MeshCore networks have more available airtime for actual communication, especially as the network grows larger.',
  },
  {
    question: 'Which is better for emergency communication: MeshCore or Meshtastic?',
    answer:
      'Both work for emergency communication, but they excel in different scenarios. MeshCore is better for planned infrastructure networks with fixed repeaters providing reliable city-wide coverage. Meshtastic excels for ad-hoc mobile groups where everyone brings a radio. For community emergency preparedness with pre-deployed repeater infrastructure, MeshCore\'s reliability and range make it the stronger choice.',
  },
  {
    question: 'Can MeshCore and Meshtastic devices communicate with each other?',
    answer:
      'No, MeshCore and Meshtastic use different protocols and cannot communicate with each other directly. They are separate mesh networks even if using similar LoRa hardware. You need to choose one protocol for your network. Some communities run both networks in parallel for different use cases.',
  },
  {
    question: 'How fast is messaging on MeshCore compared to Meshtastic?',
    answer:
      'MeshCore typically delivers messages faster with sub-second delivery for nearby nodes and sub-2-second responses across 9-hop routes. Meshtastic message speed is more variable, especially on congested networks with many nodes broadcasting. MeshCore\'s optimized bandwidth settings and reduced traffic from non-repeater nodes contribute to faster, more consistent message delivery.',
  },
  {
    question: 'What encryption does MeshCore use compared to Meshtastic?',
    answer:
      'MeshCore supports AES-256-GCM and ChaCha20-Poly1305 encryption with identity attestation and key control. Meshtastic uses AES-256 encryption. Both provide strong encryption for secure communication. MeshCore\'s Room Servers also enable encrypted group messaging for persistent chat rooms.',
  },
];

const faqData = generateFAQSchema(whyMeshCoreFAQData);

const keyAdvantages = [
  {
    title: 'Faster Messaging',
    description:
      'Sub-second delivery for nearby nodes and sub-2-second responses across 9-hop routes. MeshCore is optimized for speed with default configurations.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: 'mesh',
  },
  {
    title: 'Better Battery Life',
    description:
      'Less LoRa traffic and smarter power management means significantly longer battery runtime. Ideal for solar-powered installations.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    color: 'forest-500',
  },
  {
    title: 'Less Network Congestion',
    description:
      'Client devices don\'t flood the network by default. Dedicated repeaters handle routing, leaving more airtime for actual messages.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
      </svg>
    ),
    color: 'mountain-500',
  },
  {
    title: 'City-Scale Coverage',
    description:
      'Up to 64 hops (vs 7 for alternatives). Communities have achieved reliable communication spanning hundreds of miles across multiple states.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'sunset-500',
  },
];

const comparisonPoints = [
  {
    feature: 'Maximum Hops',
    meshcore: 'Up to 64',
    alternative: 'Up to 7',
    winner: 'meshcore',
  },
  {
    feature: 'Message Speed',
    meshcore: 'Sub-second to 2s',
    alternative: 'Variable, often slower',
    winner: 'meshcore',
  },
  {
    feature: 'Network Traffic',
    meshcore: 'Minimal (repeaters only)',
    alternative: 'All nodes broadcast',
    winner: 'meshcore',
  },
  {
    feature: 'Battery Life',
    meshcore: 'Excellent',
    alternative: 'Good',
    winner: 'meshcore',
  },
  {
    feature: 'Message Delivery Feedback',
    meshcore: 'Precise status & retry',
    alternative: 'Basic',
    winner: 'meshcore',
  },
  {
    feature: 'Encryption',
    meshcore: 'AES-256-GCM / ChaCha20',
    alternative: 'AES-256',
    winner: 'meshcore',
  },
  {
    feature: 'Community Size',
    meshcore: 'Growing (~3,500+)',
    alternative: 'Large (~40,000+)',
    winner: 'alternative',
  },
  {
    feature: 'Best For',
    meshcore: 'Planned networks, city-scale',
    alternative: 'Ad-hoc, mobile groups',
    winner: 'tie',
  },
];

const detailedBenefits = [
  {
    title: 'Infrastructure-Focused Design',
    description:
      'MeshCore concentrates airtime on purpose-built repeater nodes rather than relying on end-user devices to relay messages. This "repeaters route; edge nodes don\'t pollute" philosophy dramatically reduces network congestion.',
    details: [
      'Companion devices connect via Bluetooth to your phone',
      'Only dedicated Repeaters relay messages across the network',
      'Room Servers enable persistent chat rooms',
      'Each role is optimized for its specific purpose',
    ],
  },
  {
    title: 'Reliable Message Delivery',
    description:
      'MeshCore provides precise control over message delivery and status. The app shows exact sending attempts, automatically switches between direct and flood routing if delivery fails, and gives clear feedback.',
    details: [
      'See exactly how many delivery attempts were made',
      'Automatic retry with intelligent routing fallback',
      'Define specific repeater paths for critical messages',
      'Clear success/failure feedback for every message',
    ],
  },
  {
    title: 'Optimized Radio Configuration',
    description:
      'MeshCore\'s default preset uses optimized bandwidth and spreading factors that improve signal-to-noise ratio and airtime efficiency while maintaining excellent range.',
    details: [
      '62.5 kHz bandwidth fits between interference sources',
      'Tuned spreading factors for US 902-928 MHz band',
      'Pull-based telemetry minimizes unnecessary broadcasts',
      'More available airtime for actual communication',
    ],
  },
  {
    title: 'Strong Security',
    description:
      'MeshCore supports optional end-to-end encryption with identity attestation, giving you control over your communication security.',
    details: [
      'AES-256-GCM or ChaCha20-Poly1305 encryption',
      'Identity attestation and key control',
      'Secure group messaging with Room Servers',
      'No central authority or data collection',
    ],
  },
];

const useCases = [
  {
    title: 'Emergency Preparedness',
    icon: '🚨',
    description:
      'When cell towers fail, MeshCore keeps communities connected. Fixed repeaters on high points provide reliable coverage across entire regions.',
  },
  {
    title: 'Community Networks',
    icon: '🏘️',
    description:
      'Build a city-scale mesh that grows with your community. Strategic repeater placement creates robust, long-lasting infrastructure.',
  },
  {
    title: 'Outdoor Adventures',
    icon: '🏔️',
    description:
      'Stay connected in the backcountry where cell service doesn\'t exist. Lightweight companion devices pair with your smartphone.',
  },
  {
    title: 'Events & Coordination',
    icon: '📡',
    description:
      'Room Servers enable group chat for events, search and rescue, or community coordination without internet dependency.',
  },
];

export default function WhyMeshCorePage() {
  return (
    <>
      <JsonLd data={breadcrumbData} />
      <JsonLd data={faqData} />
      <div className="min-h-screen bg-mesh">
        {/* Hero Section */}
        <section className="px-6 py-16 md:py-24 text-center">
          <div className="max-w-4xl mx-auto">
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Why MeshCore?' }]} />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              Why <span className="text-mesh">MeshCore</span>?
            </h1>
            <p className="text-xl md:text-2xl text-foreground-muted mb-8 max-w-2xl mx-auto">
              Faster messaging, better battery life, and city-scale reliability.
              Discover why communities are choosing MeshCore for serious mesh networking.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/start" className="btn-primary">
                Get Started
              </Link>
              <a href="#comparison" className="btn-outline">
                See Comparison
              </a>
            </div>
          </div>
        </section>

        {/* Key Advantages Grid */}
        <section className="px-6 py-16 bg-background-secondary">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground text-center">
              Key Advantages
            </h2>
            <p className="text-foreground-muted text-center mb-12 max-w-2xl mx-auto">
              MeshCore is designed from the ground up for reliable, city-scale communication.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {keyAdvantages.map((advantage) => (
                <div key={advantage.title} className="card-mesh p-6">
                  <div
                    className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 bg-${advantage.color}/10 text-${advantage.color}`}
                    style={{
                      backgroundColor: advantage.color === 'mesh' ? 'rgba(14, 165, 233, 0.1)' : undefined,
                      color: advantage.color === 'mesh' ? '#0ea5e9' : undefined,
                    }}
                  >
                    {advantage.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">{advantage.title}</h3>
                  <p className="text-foreground-muted">{advantage.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section id="comparison" className="px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground text-center">
              How Does MeshCore Compare?
            </h2>
            <p className="text-foreground-muted text-center mb-12 max-w-2xl mx-auto">
              A fair comparison with other LoRa mesh solutions. Each has its strengths.
            </p>

            <div className="card-mesh overflow-hidden">
              <table className="w-full">
                <thead className="bg-night-800/50">
                  <tr>
                    <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-foreground">Feature</th>
                    <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-mesh">MeshCore</th>
                    <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-foreground-muted">Alternatives</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border">
                  {comparisonPoints.map((point) => (
                    <tr key={point.feature} className="hover:bg-night-800/30 transition-colors">
                      <td className="px-4 md:px-6 py-4 text-foreground font-medium text-sm">{point.feature}</td>
                      <td className="px-4 md:px-6 py-4">
                        <span
                          className={`text-sm ${
                            point.winner === 'meshcore' ? 'text-forest-500 font-semibold' : 'text-foreground-muted'
                          }`}
                        >
                          {point.meshcore}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <span
                          className={`text-sm ${
                            point.winner === 'alternative' ? 'text-forest-500 font-semibold' : 'text-foreground-muted'
                          }`}
                        >
                          {point.alternative}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm text-foreground-muted text-center mt-6">
              Note: MeshCore and other mesh protocols are not compatible with each other. Choose based on your network&apos;s goals.
            </p>
          </div>
        </section>

        {/* Detailed Benefits */}
        <section className="px-6 py-16 bg-background-secondary">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-foreground text-center">
              Built for Real-World Networks
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {detailedBenefits.map((benefit) => (
                <div key={benefit.title} className="card-mesh p-6">
                  <h3 className="text-xl font-bold mb-3 text-foreground">{benefit.title}</h3>
                  <p className="text-foreground-muted mb-4">{benefit.description}</p>
                  <ul className="space-y-2">
                    {benefit.details.map((detail, index) => (
                      <li key={index} className="text-sm text-foreground-muted flex items-start gap-2">
                        <span className="text-mesh mt-0.5">✓</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground text-center">
              Who Uses MeshCore?
            </h2>
            <p className="text-foreground-muted text-center mb-12 max-w-2xl mx-auto">
              From emergency preparedness to outdoor adventures, MeshCore powers communication when it matters most.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {useCases.map((useCase) => (
                <div key={useCase.title} className="card-mesh p-6 text-center">
                  <div className="text-4xl mb-4">{useCase.icon}</div>
                  <h3 className="text-lg font-bold mb-2 text-foreground">{useCase.title}</h3>
                  <p className="text-sm text-foreground-muted">{useCase.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fair Considerations */}
        <section className="px-6 py-16 bg-mountain-gradient text-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              A Note on Choosing Your Protocol
            </h2>
            <div className="space-y-6 text-mountain-100">
              <p className="text-lg">
                We believe in being honest about technology choices. While we&apos;re big fans of MeshCore, it&apos;s
                not the only option. Other LoRa mesh protocols have larger communities and may be better suited for
                certain use cases like ad-hoc mobile groups or events where everyone brings a radio.
              </p>
              <p className="text-lg">
                MeshCore shines when you want to build lasting infrastructure &mdash; fixed repeaters on rooftops
                and high points that create reliable, city-scale coverage. If you&apos;re looking to participate in
                the Denver mesh network, MeshCore is our choice because it&apos;s optimized for exactly what we&apos;re building.
              </p>
            </div>
            <div className="mt-8 text-center">
              <a
                href="https://www.austinmesh.org/learn/meshcore-vs-meshtastic/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white underline hover:text-mountain-100 transition-colors inline-flex items-center gap-2"
              >
                Read a detailed comparison from Austin Mesh
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-16 bg-night-stars text-white text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Try MeshCore?</h2>
            <p className="text-mountain-100 mb-8 text-lg">
              Join the Denver MeshCore community. Get your hardware, flash the firmware, and become part of
              Colorado&apos;s growing mesh network.
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
                Join Discord
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
