import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { HeroPanel, SectionEyebrow } from "@/components/brand";
import { generateBreadcrumbSchema } from "@/lib/schemas/breadcrumb";
import { BASE_URL, COMMUNITY_NAME, DISCORD_INVITE_URL } from "@/lib/constants";
import { channels } from "@/lib/data/channels";

export const metadata: Metadata = {
  title: "Common ColoradoMesh Channels",
  description: "Join the conversation by subscribing to common community channels across Colorado",
  keywords: ["MeshCore", "mesh network", "getting started", "help", "Colorado", "Denver", "Front Range", "LoRa", "ESP32", "channels", "conversations", "bot", "weather", "testing", "chat", "message", "setup guide"],
  alternates: {
    canonical: '/guides/common-channels',
  },
  openGraph: {
    title: "Join the Conversation | Colorado MeshCore",
    description: "Find common MeshCore channels in Colorado and start chatting.",
    url: `${BASE_URL}/guides/common-channels`,
  },
};

const breadcrumbData = generateBreadcrumbSchema([
  { name: 'Home', url: BASE_URL },
  { name: 'Guides', url: `${BASE_URL}/guides` },
  { name: 'Common Channels', url: `${BASE_URL}/guides/common-channels` },
]);

export default function CommonChannelsPage() {
  return (
    <>
      <JsonLd data={breadcrumbData} />
      <div className="min-h-screen">
        <HeroPanel
          background="topo-grid"
          showMountains
          eyebrow={`${COMMUNITY_NAME} · Chat`}
          eyebrowTone="mesh"
          title={
            <>
              Common MeshCore
              <span className="block text-mesh">channels</span>
            </>
          }
          description={`Join the conversation on the ${COMMUNITY_NAME} network — subscribe to common community channels`}
          actions={
            <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
            >
              Discord
            </a>
          }
          meta={
            <div className="panel px-5 sm:px-6 py-4 backdrop-blur-md bg-card/85">
              <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides' }, { label: 'Common Channels' }]} />
            </div>
          }
        />

        {/* Channels */}
        <section className="bg-background-secondary py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <SectionEyebrow tone="mesh" className="mb-3">
              Channels
            </SectionEyebrow>
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
              Common {COMMUNITY_NAME} channels.
            </h2>
            <p className="mt-3 text-foreground-muted max-w-2xl mb-8">
              Join these channels to communicate with other {COMMUNITY_NAME} operators.
            </p>

            <div className="panel overflow-hidden">
              <div className="p-6 border-b border-card-border">
                <p className="text-foreground-muted text-sm">
                  Hashtag topic keys are auto-calculated by the system. Click on an invite link on your mobile device to join the channel in your MeshCore app.
                </p>
              </div>
              <table className="w-full">
                <thead className="bg-night-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground"/>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Topic</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Description</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Invite Link</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-card-border">
                {channels.map((channel) => (
                    <tr key={channel.name} className="hover:bg-night-800/30 transition-colors">
                      <td className="px-6 py-3 font-semibold text-foreground-muted break-all">
                        <img src={channel.image_uri} alt={channel.description}/>
                      </td>
                      <td className="px-6 py-3 font-semibold text-mountain-300">{channel.name}</td>
                      <td className="px-6 py-3 font-semibold text-foreground-muted break-all">{channel.description}</td>
                      <td className="px-6 py-3 font-mono text-xs text-foreground-muted break-all">
                        <a href={channel.url}>{channel.url}</a>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 text-center">
              <Link href="/guides/repeater-setup" className="btn-primary inline-flex items-center gap-2">
                Repeater Setup Guide
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
