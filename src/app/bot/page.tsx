import type { Metadata } from 'next';
import Link from 'next/link';

import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import { HeroPanel, NetworkPanel, SectionEyebrow } from '@/components/brand';
import {
  BASE_URL,
  BOT_FIRMWARE_REPO_URL,
  COMMUNITY_NAME,
  DISCORD_INVITE_URL,
  MESHCORE_FLASHER_URL,
  SITE_NAME,
} from '@/lib/constants';
import { generateBreadcrumbSchema } from '@/lib/schemas/breadcrumb';

import BoardCatalog from './BoardCatalog';
import BotReleasesPanel from './BotReleasesPanel';

const PAGE_TITLE = `${COMMUNITY_NAME} Bot Firmware`;
const PAGE_DESCRIPTION = `Companion-radio firmware for the ${COMMUNITY_NAME} community, built on top of MeshCore. Adds an on-device chat bot — ping, trace, path, status, neighbors — with multi-bot response coordination so nearby Colorado bots don't all reply at once.`;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/bot' },
  openGraph: {
    title: `${PAGE_TITLE} | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    url: `${BASE_URL}/bot`,
    siteName: SITE_NAME,
  },
};

const breadcrumbData = generateBreadcrumbSchema([
  { name: 'Home', url: BASE_URL },
  { name: 'Bot Firmware', url: `${BASE_URL}/bot` },
]);

const heroStats = [
  { value: '133', label: 'Boards built per release', tone: 'text-mesh' },
  { value: 'On-device', label: 'No internet, no cloud', tone: 'text-mountain-300' },
  { value: 'Open', label: 'MIT licensed', tone: 'text-sunset-500' },
] as const;

const upstreamPatches = [
  {
    glyph: '◇',
    title: 'Bot command registry',
    description:
      'Adds ping, hello, path, trace, status, channels, version, stats, magic8, prefix, time, lora, id, neighbors, and more — all answered on-device.',
  },
  {
    glyph: '◉',
    title: 'Channel-aware response policy',
    description:
      'Replies only on #bot and #testing for normal commands. #emergency messages are forwarded to Public. All other channels are silent.',
  },
  {
    glyph: '◊',
    title: 'Multi-bot response coordinator',
    description:
      'Hop-aware delay (~1.5 s per hop, capped at 8 s) with bounded TTL and fingerprint suppression — closest bot wins the race, others stay quiet.',
  },
  {
    glyph: '◈',
    title: 'DM prefixless commands',
    description:
      'Direct-message the bot and skip the prefix. Two-byte path hash by default for compact trace results.',
  },
  {
    glyph: '◎',
    title: 'Tunable host-side prefs',
    description:
      'CLI-tunable channels, response delay, advert intervals, and known-bot list. Private-key import/export is disabled in release builds.',
  },
] as const;

const commandReference = [
  { cmd: 'ping', response: 'Pong' },
  { cmd: 'hello', response: 'Hello @[<your-name>], from <bot-name>' },
  { cmd: 'path', response: 'Compact route summary back to you, e.g. Path 3h@2B SNR -6.25 | 2751 → ea4d → 430d' },
  { cmd: 'trace', response: 'Active trace request along your reverse path' },
  { cmd: 'status', response: 'Bot uptime, battery, storage, send counters' },
  { cmd: 'neighbors', response: 'Nodes heard directly within the last hour' },
  { cmd: 'version', response: 'Firmware version + build date' },
  { cmd: 'magic8 <question>', response: 'Classic 8-ball answer' },
  { cmd: 'help', response: 'List all commands' },
] as const;

const flashSteps = [
  {
    tag: 'EASIEST',
    title: 'MeshCore web flasher',
    description:
      'Open flasher.meshcore.io in Chrome or Edge, pick "Custom firmware," drag in the right file for your board (merged.bin / uf2 / zip), and click Connect → Flash.',
    href: MESHCORE_FLASHER_URL,
    external: true,
  },
  {
    tag: 'SOURCE BUILD',
    title: 'PlatformIO from source',
    description:
      'Clone the repo with --recurse-submodules, apply patches, then pio run -e <board>_companion_radio_usb -t upload. Swap the env for your specific board.',
    href: BOT_FIRMWARE_REPO_URL,
    external: true,
  },
  {
    tag: 'MANUAL',
    title: 'esptool / nrfutil',
    description:
      'ESP32: esptool.py write_flash 0x0 <board>-merged.bin. nRF52: drag the .uf2 onto the bootloader drive, or use adafruit-nrfutil with the .zip.',
    href: `${BOT_FIRMWARE_REPO_URL}#install`,
    external: true,
  },
] as const;

export default function BotFirmwarePage() {
  return (
    <>
      <JsonLd data={breadcrumbData} />
      <div className="min-h-screen">
        <HeroPanel
          background="topo-grid"
          showMountains
          eyebrow={`${COMMUNITY_NAME} · Bot Firmware`}
          eyebrowTone="mesh"
          title={
            <>
              An on-device bot
              <span className="block text-mesh">for the Colorado mesh.</span>
            </>
          }
          description={`Companion-radio firmware built on top of MeshCore. It adds a chat bot that answers ping, path, trace, status, neighbors, magic8 and more — entirely on-device. No internet bridge, no companion-app dependency, no cloud.`}
          actions={
            <>
              <a
                href={MESHCORE_FLASHER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Open web flasher
              </a>
              <a
                href={BOT_FIRMWARE_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                View on GitHub
              </a>
              <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                Discuss in Discord
              </a>
            </>
          }
          meta={
            <div className="panel px-5 sm:px-6 py-4 backdrop-blur-md bg-card/85">
              <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Bot Firmware' }]} />
            </div>
          }
        >
          <div className="mt-12 grid grid-cols-3 gap-3 sm:gap-5 w-full max-w-2xl">
            {heroStats.map((stat) => (
              <div key={stat.label} className="panel p-4 sm:p-5 text-center">
                <div className={`text-xl sm:text-2xl font-semibold mono tracking-tight mb-1 ${stat.tone}`}>
                  {stat.value}
                </div>
                <div className="metric-label text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </HeroPanel>

        {/* What's different from upstream */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 -mt-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-3xl">
              <SectionEyebrow tone="sky">What it adds</SectionEyebrow>
              <h2 className="mt-3 text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
                A focused patch queue on top of upstream MeshCore.
              </h2>
              <p className="mt-4 text-foreground-muted leading-relaxed">
                The release-built firmware applies an ordered patch queue on top of a pinned MeshCore
                commit, so reviewers can see exactly what deviates from upstream. The patches stay
                small and behavioral — they don&apos;t fork the radio stack.
              </p>
            </div>

            <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
              {upstreamPatches.map((patch) => (
                <NetworkPanel
                  key={patch.title}
                  title={patch.title}
                  headingLevel="h3"
                  padding="md"
                  className="h-full"
                >
                  <div className="flex items-start gap-3">
                    <span aria-hidden className="text-3xl text-mesh leading-none">
                      {patch.glyph}
                    </span>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {patch.description}
                    </p>
                  </div>
                </NetworkPanel>
              ))}
            </div>
          </div>
        </section>

        {/* Command reference */}
        <section className="bg-background-secondary py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 max-w-3xl">
              <SectionEyebrow tone="mesh">Command reference</SectionEyebrow>
              <h2 className="mt-3 text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
                Send these on <code className="mono text-mesh">#bot</code>, or DM the bot directly.
              </h2>
              <p className="mt-4 text-foreground-muted leading-relaxed">
                In any channel besides <code className="mono">#bot</code>, <code className="mono">#testing</code>, and{' '}
                <code className="mono">#emergency</code>, the bot stays silent. DMs work prefixless —
                just send the command name.
              </p>
            </div>

            <div className="rounded-lg border border-card-border bg-background overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-background-secondary">
                  <tr className="text-xs uppercase mono text-foreground-dim">
                    <th className="px-4 py-3 text-left w-1/3">Command</th>
                    <th className="px-4 py-3 text-left">Response</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border">
                  {commandReference.map((row) => (
                    <tr key={row.cmd}>
                      <td className="px-4 py-3 mono text-mesh font-medium align-top">{row.cmd}</td>
                      <td className="px-4 py-3 text-foreground-muted leading-relaxed">{row.response}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <NetworkPanel
              eyebrow="Multi-bot etiquette"
              eyebrowTone="sunset"
              title="Why nearby bots don't spam the channel"
              padding="md"
              headingLevel="h3"
              className="mt-8"
            >
              <p className="text-sm text-foreground-muted leading-relaxed">
                When several Colorado bots hear the same command, the response coordinator adds a
                hop-aware delay (~1.5 s per hop, capped at 8 s) and bounds replies with a TTL +
                fingerprint suppression. The closest bot wins the race; others see the in-flight
                reply and stay quiet. This keeps <code className="mono">#bot</code> readable even
                with dense bot coverage.
              </p>
            </NetworkPanel>
          </div>
        </section>

        {/* Live release panel + board catalog */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
            <BotReleasesPanel />
            <BoardCatalog />
          </div>
        </section>

        {/* How to flash */}
        <section className="bg-background-secondary py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-3xl">
              <SectionEyebrow tone="sky">How to flash</SectionEyebrow>
              <h2 className="mt-3 text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
                Three paths from download to flashed bot.
              </h2>
              <p className="mt-4 text-foreground-muted leading-relaxed">
                The web flasher is the fastest path for most operators. PlatformIO is for anyone
                building from source or running a custom patch. Manual esptool / nrfutil is the
                fallback when the browser-based path isn&apos;t an option.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {flashSteps.map((step) => (
                <NetworkPanel
                  key={step.title}
                  eyebrow={step.tag}
                  eyebrowTone="mesh"
                  title={step.title}
                  headingLevel="h3"
                  padding="md"
                  className="h-full"
                >
                  <p className="text-sm text-foreground-muted leading-relaxed">{step.description}</p>
                  <a
                    href={step.href}
                    target={step.external ? '_blank' : undefined}
                    rel={step.external ? 'noopener noreferrer' : undefined}
                    className="mt-4 inline-block link text-sm"
                  >
                    {step.tag === 'EASIEST' ? 'Open flasher.meshcore.io' : 'Open guide'} →
                  </a>
                </NetworkPanel>
              ))}
            </div>
          </div>
        </section>

        {/* Next steps */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <SectionEyebrow tone="mesh" className="justify-center">
              Get the bot on the mesh
            </SectionEyebrow>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
              Flash, drop into <code className="mono text-mesh">#bot</code>, and say <code className="mono text-mesh">ping</code>.
            </h2>
            <p className="mt-4 text-foreground-muted leading-relaxed">
              Found a bug, want a new command, or curious how the patch queue works? File an issue or
              jump in the Discord — both are open.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <a
                href={`${BOT_FIRMWARE_REPO_URL}/issues/new/choose`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Open an issue
              </a>
              <Link href="/start" className="btn-secondary">
                New to the mesh?
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
