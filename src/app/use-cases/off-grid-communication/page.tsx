import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import { HeroPanel, NetworkPanel, SectionEyebrow } from '@/components/brand';
import { generateBreadcrumbSchema } from '@/lib/schemas/breadcrumb';
import { BASE_URL, COMMUNITY_NAME, DISCORD_INVITE_URL, SITE_NAME } from '@/lib/constants';

const PAGE_TITLE = 'Off-grid communication';

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
    title: `Off-grid communication | ${SITE_NAME}`,
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
    title: 'Backcountry hiking',
    description:
      'Stay in contact with your hiking group on Colorado 14ers and remote trails where cell service is nonexistent. MeshCore radios reach beyond line-of-sight through repeater networks.',
    glyph: '◊',
    tone: 'sky' as const,
  },
  {
    title: 'Camping & dispersed recreation',
    description:
      'Coordinate between campsites spread across remote areas — Roosevelt National Forest, Pike National Forest, and other Colorado wilderness.',
    glyph: '◇',
    tone: 'mesh' as const,
  },
  {
    title: 'Skiing & snowsports',
    description:
      'Keep your group connected at Colorado ski resorts and in the backcountry. Cell towers overload on busy days; mesh radios stay reliable.',
    glyph: '◉',
    tone: 'mesh' as const,
  },
  {
    title: 'Search & rescue support',
    description:
      'Support search and rescue operations in remote Colorado wilderness. Mesh networks provide infrastructure where traditional methods fail.',
    glyph: '◈',
    tone: 'sunset' as const,
  },
] as const;

const coloradoLocations = [
  {
    name: 'Colorado 14ers',
    description:
      'From Longs Peak to Pikes Peak, mesh radios provide communication across Colorado\'s famous fourteeners.',
  },
  {
    name: 'Rocky Mountain National Park',
    description: 'Navigate RMNP trails with confidence. Mesh networks work through rugged terrain.',
  },
  {
    name: 'Indian Peaks Wilderness',
    description:
      'Popular backcountry near Boulder with limited cell coverage. MeshCore fills the gap.',
  },
  {
    name: 'San Juan Mountains',
    description:
      'Remote wilderness in southwestern Colorado. Mesh radios are essential for multi-day backpacking.',
  },
  {
    name: 'Front Range foothills',
    description:
      'Even areas close to Denver have spotty coverage. MeshCore provides reliable local communication.',
  },
  {
    name: 'Continental Divide Trail',
    description:
      'Colorado\'s CDT section crosses remote high country where mesh communication is invaluable.',
  },
] as const;

const features = [
  {
    title: 'No cell service required',
    description:
      'MeshCore radios talk peer-to-peer over LoRa. Messages travel through the mesh, not cell towers.',
    glyph: '◊',
  },
  {
    title: 'Long-range communication',
    description:
      'LoRa signals can travel 10+ miles in open terrain. With repeaters, messages span the Front Range.',
    glyph: '◇',
  },
  {
    title: 'Battery efficient',
    description:
      'Companion devices last days on a single charge — or run indefinitely on small solar panels.',
    glyph: '◉',
  },
  {
    title: 'Lightweight & portable',
    description:
      'A few ounces, fits in any pack. Designed for adventurers who count every gram.',
    glyph: '◈',
  },
  {
    title: 'Works through mountains',
    description:
      `${COMMUNITY_NAME} repeaters on high points extend coverage through valleys and mountain passes.`,
    glyph: '◊',
  },
  {
    title: 'Emergency SOS capability',
    description:
      'Send SOS messages through the mesh — your location and message can reach help without direct line of sight.',
    glyph: '◇',
  },
] as const;

const comparisons = [
  {
    method: 'Cell phones',
    coverage: 'Limited in backcountry',
    reliability: 'Fails in remote areas',
    advantage: 'MeshCore works where cell phones cannot reach',
  },
  {
    method: 'Satellite messengers',
    coverage: 'Global (clear sky required)',
    reliability: 'Good, but slow',
    advantage: 'MeshCore is free with no subscriptions',
  },
  {
    method: 'Ham radio',
    coverage: 'Excellent with proper setup',
    reliability: 'Very reliable',
    advantage: 'MeshCore requires no license (Part 15 compliant)',
  },
  {
    method: 'FRS / GMRS radios',
    coverage: '0.5–2 miles typical',
    reliability: 'Line-of-sight only',
    advantage: 'MeshCore extends range through mesh networking',
  },
] as const;

const faqs = [
  {
    question: 'Do I need a license to use MeshCore in Colorado?',
    answer:
      'No. MeshCore operates on the 915 MHz ISM band, which is license-free in the United States under FCC Part 15 rules. Anyone can use MeshCore devices without any radio license or permits.',
  },
  {
    question: 'How far can MeshCore communicate in the mountains?',
    answer:
      `Direct line-of-sight range is typically 5–15 miles depending on terrain. With the ${COMMUNITY_NAME} repeater network, messages can travel across the entire Front Range through multiple hops.`,
  },
  {
    question: 'Will MeshCore work in deep canyons or valleys?',
    answer:
      `Yes, if there are repeaters on nearby high points. The ${COMMUNITY_NAME} network is designed with repeaters strategically placed to provide coverage through valleys and mountain passes.`,
  },
  {
    question: "What happens if I'm the only MeshCore user in an area?",
    answer:
      'You can still communicate with anyone in direct radio range (typically several miles). For extended range, you\'ll benefit from the network of repeaters that volunteers maintain.',
  },
  {
    question: 'Is MeshCore reliable enough for emergency use?',
    answer:
      'MeshCore provides a reliable backup communication method, but should not be your only emergency option. Carry multiple communication methods for backcountry safety.',
  },
  {
    question: 'How do I get started with off-grid communication in Colorado?',
    answer:
      `Get a compatible LoRa radio, flash it with MeshCore firmware, and join the ${COMMUNITY_NAME} Discord for help with setup and to connect with other operators in your area.`,
  },
] as const;

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
};

export default function OffGridCommunicationPage() {
  return (
    <>
      <JsonLd data={breadcrumbData} />
      <JsonLd data={faqSchema} />
      <div className="min-h-screen">
        <HeroPanel
          background="topo-grid"
          showMountains
          eyebrow="Use case · Off-grid"
          eyebrowTone="sky"
          title={
            <>
              Off-grid communication
              <span className="block text-mesh">for Colorado adventurers</span>
            </>
          }
          description="Stay connected on hiking trails, 14ers, and remote wilderness where cell phones fail. MeshCore provides reliable off-grid messaging across the Rockies."
          actions={
            <>
              <Link href="/start" className="btn-primary">
                Get a mesh device
              </Link>
              <Link href="/map" className="btn-secondary">
                Network coverage
              </Link>
              <Link href="/guides/getting-started" className="btn-outline">
                Setup guide
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

        {/* Scenarios */}
        <section className="relative z-10 px-4 sm:px-6 lg:px-8 pb-16 -mt-10">
          <div className="mx-auto max-w-7xl">
            <SectionEyebrow tone="sky" className="mb-3">
              Where off-grid comms matter
            </SectionEyebrow>
            <p className="mb-8 text-foreground-muted max-w-2xl">
              Colorado&apos;s diverse terrain creates endless situations where traditional comms
              fail. MeshCore keeps you connected.
            </p>
            <div className="grid gap-5 lg:grid-cols-2">
              {useCaseScenarios.map((scenario) => (
                <NetworkPanel
                  key={scenario.title}
                  eyebrow={scenario.title}
                  eyebrowTone={scenario.tone}
                  padding="md"
                  className="h-full"
                >
                  <div className="flex items-start gap-3">
                    <span aria-hidden className="text-3xl text-mesh leading-none">
                      {scenario.glyph}
                    </span>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {scenario.description}
                    </p>
                  </div>
                </NetworkPanel>
              ))}
            </div>
          </div>
        </section>

        {/* Locations */}
        <section className="bg-background-secondary py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <SectionEyebrow tone="mesh" className="justify-center">
                Off-grid areas
              </SectionEyebrow>
              <h2 className="mt-3 text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
                Where Colorado loses cell service.
              </h2>
              <p className="mt-3 text-foreground-muted max-w-2xl mx-auto">
                These popular destinations often have limited or no cell coverage. MeshCore is the
                fix.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {coloradoLocations.map((location) => (
                <div key={location.name} className="panel p-6 h-full">
                  <h3 className="text-lg font-semibold text-foreground tracking-tight flex items-center gap-2">
                    <span aria-hidden className="text-mesh">
                      ◊
                    </span>
                    {location.name}
                  </h3>
                  <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
                    {location.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-background py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <SectionEyebrow tone="sky" className="justify-center">
                Why MeshCore for backcountry
              </SectionEyebrow>
              <h2 className="mt-3 text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
                Purpose-built for outdoor adventurers.
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="panel p-6 h-full">
                  <span aria-hidden className="text-3xl text-mesh leading-none mb-3 block">
                    {feature.glyph}
                  </span>
                  <h3 className="text-lg font-semibold text-foreground tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="bg-background-secondary py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <SectionEyebrow tone="sunset" className="justify-center">
                Compared to other options
              </SectionEyebrow>
              <h2 className="mt-3 text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
                MeshCore vs the alternatives.
              </h2>
            </div>

            <div className="panel overflow-hidden">
              <table className="w-full">
                <thead className="bg-night-800/50">
                  <tr>
                    <th className="px-4 md:px-6 py-4 text-left text-xs mono uppercase tracking-[0.18em] text-foreground-dim">
                      Method
                    </th>
                    <th className="px-4 md:px-6 py-4 text-left text-xs mono uppercase tracking-[0.18em] text-foreground-dim hidden md:table-cell">
                      Coverage
                    </th>
                    <th className="px-4 md:px-6 py-4 text-left text-xs mono uppercase tracking-[0.18em] text-foreground-dim hidden lg:table-cell">
                      Reliability
                    </th>
                    <th className="px-4 md:px-6 py-4 text-left text-xs mono uppercase tracking-[0.18em] text-mesh">
                      MeshCore advantage
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border">
                  {comparisons.map((comparison) => (
                    <tr key={comparison.method} className="hover:bg-night-800/30 transition-colors">
                      <td className="px-4 md:px-6 py-4 text-foreground font-medium text-sm">
                        {comparison.method}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-foreground-muted text-sm hidden md:table-cell">
                        {comparison.coverage}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-foreground-muted text-sm hidden lg:table-cell">
                        {comparison.reliability}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-mesh text-sm font-medium">
                        {comparison.advantage}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-background py-16 sm:py-20">
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
                <div key={faq.question} className="panel p-6">
                  <h3 className="text-lg font-semibold text-foreground tracking-tight">
                    {faq.question}
                  </h3>
                  <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-night-stars py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <SectionEyebrow tone="mesh" className="justify-center">
              Ready for off-grid adventures?
            </SectionEyebrow>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold text-snow-100 tracking-tight">
              Join the mesh, then go explore.
            </h2>
            <p className="mt-4 text-lg text-mountain-100 leading-relaxed">
              Get a device, connect to the {COMMUNITY_NAME} network, and head into the
              backcountry with confidence.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/start" className="btn-primary">
                Get Started
              </Link>
              <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
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
