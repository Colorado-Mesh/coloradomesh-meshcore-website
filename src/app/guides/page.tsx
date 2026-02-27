import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { generateBreadcrumbSchema } from "@/lib/schemas/breadcrumb";
import { BASE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Guides | Denver MeshCore",
  description: "Guides for getting started, radio settings, repeater setup, naming standards, and troubleshooting on the Denver MeshCore mesh network.",
  keywords: ["MeshCore", "guides", "Denver", "mesh network", "LoRa", "setup", "repeater", "troubleshooting"],
  alternates: {
    canonical: '/guides',
  },
  openGraph: {
    title: "Guides | Denver MeshCore",
    description: "Guides for getting started, radio settings, repeater setup, naming standards, and troubleshooting on the Denver MeshCore mesh network.",
    url: `${BASE_URL}/guides`,
  },
};

const guides = [
  {
    title: "Getting Started",
    description: "Get your first node up and running on the Denver mesh network. Hardware recommendations, firmware flashing, and configuration.",
    href: "/guides/getting-started",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    color: "text-mountain-500 bg-mountain-500/10",
  },
  {
    title: "Radio Settings & Channels",
    description: "Frequencies, presets, and channel list for the Denver/Front Range area.",
    href: "/guides/radio-settings",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
      </svg>
    ),
    color: "text-mesh bg-mesh/10",
  },
  {
    title: "Repeater Setup",
    description: "Set up and tune a repeater node with TX/RX delay profiles optimized for the Denver metro area.",
    href: "/guides/repeater-setup",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    color: "text-forest-500 bg-forest-500/10",
  },
  {
    title: "Naming Standard",
    description: "Name your node following the Denver MeshCore v2.0 naming standard. Interactive wizard included.",
    href: "/guides/naming-standard",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    color: "text-sunset-500 bg-sunset-500/10",
  },
  {
    title: "Troubleshooting",
    description: "Common issues and solutions, plus helpful resources and community links.",
    href: "/guides/troubleshooting",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: "text-sunset-700 bg-sunset-700/10",
  },
];

const breadcrumbData = generateBreadcrumbSchema([
  { name: 'Home', url: BASE_URL },
  { name: 'Guides', url: `${BASE_URL}/guides` },
]);

export default function GuidesPage() {
  return (
    <>
      <JsonLd data={breadcrumbData} />
      <div className="min-h-screen bg-mesh">
        {/* Hero Section */}
        <section className="px-6 py-16 md:py-24 text-center">
          <div className="max-w-4xl mx-auto">
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides' }]} />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              <span className="text-mesh">Guides</span>
            </h1>
            <p className="text-xl md:text-2xl text-foreground-muted mb-8">
              Everything you need to join and contribute to the Denver mesh network
            </p>
          </div>
        </section>

        {/* Card Grid */}
        <section className="px-6 pb-16 md:pb-24">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {guides.map((guide) => (
              <Link
                key={guide.href}
                href={guide.href}
                className="card-mesh p-6 flex items-start gap-4 hover:ring-2 hover:ring-mesh transition-all group"
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${guide.color}`}>
                  {guide.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-foreground mb-2 group-hover:text-mesh transition-colors">
                    {guide.title}
                  </h2>
                  <p className="text-foreground-muted text-sm">{guide.description}</p>
                </div>
                <svg className="w-5 h-5 text-foreground-muted flex-shrink-0 mt-1 group-hover:text-mesh transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
