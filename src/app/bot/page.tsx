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
      'Hop-aware delay (~3 s per hop, capped at 15 s) on top of a ~1.5 s base + 2.2 s jitter, bounded by a 75 s TTL. Each reply carries a 4-hex request token so peer bots can correlate and suppress duplicates — even when reply text differs (hop count, SNR, recv time).',
  },
  {
    glyph: '◈',
    title: 'Prefixless commands everywhere',
    description:
      'No `!` or `bot ` prefix needed — send the command name on its own, whether you\'re on #bot, #testing, or DMing the bot directly. Two-byte path hash by default for compact trace results.',
  },
  {
    glyph: '◎',
    title: 'Plug-and-play discovery',
    description:
      'Sends its first flood advert ~5 s after boot so the rest of the mesh learns the bot is up almost immediately, and auto-overwrites the oldest contact when the table fills. Channel-side coordination is token-based, so dropping a second bot in the area needs no peer config.',
  },
  {
    glyph: '◬',
    title: 'Tunable host-side prefs',
    description:
      'CLI-tunable channels, response delay, advert intervals, and known-bot list. Private-key import/export is disabled in release builds.',
  },
] as const;

const firstSetupSteps = [
  {
    step: '1',
    title: 'Pair the radio with the MeshCore app',
    description:
      'This is a companion-radio firmware — the bot lives on the radio, but the radio still needs a one-time setup from a phone. After flashing, open the MeshCore companion app, pair over BLE (or USB if your board is USB-only), and complete the welcome flow.',
  },
  {
    step: '2',
    title: 'Sync the clock',
    description:
      'The app pushes the phone\'s time to the radio on connect. Without this, timestamps in `time`, received-at fields, and the coordinator\'s TTL window all drift. Re-pair after any long power-off so the clock catches up.',
  },
  {
    step: '3',
    title: 'Add #bot, #testing, and #emergency',
    description:
      'In the app\'s Channels screen, add the three community channels by name (the bot defaults to listening on these plus Public). Without the channels present in the radio\'s table, the bot has nothing to answer on — even though the firmware is configured to use them.',
  },
  {
    step: '4',
    title: 'Wait for the advert',
    description:
      'The bot self-adverts ~5 s after boot and again on its scheduled interval. Once your other contacts see the advert, the bot will appear in their contact list and any nearby bot will auto-add it. From there, send `ping` on `#bot` to confirm it\'s alive.',
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
          description={`Companion-radio firmware built on top of MeshCore — pair the radio with the MeshCore app once, then the on-device bot answers ping, path, trace, status, neighbors, magic8, and more without the phone in the loop. No app bridge, no internet, no cloud.`}
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
                Prefixless on both channels and DMs — just send the command name, no <code className="mono">!</code> or <code className="mono">bot </code> prefix.
                In any channel besides <code className="mono">#bot</code>, <code className="mono">#testing</code>, and{' '}
                <code className="mono">#emergency</code>, the bot stays silent.
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
                hop-aware delay (~3 s per hop, capped at 15 s) on top of a ~1.5 s base + ~2.2 s
                jitter, bounded by a 75 s pending TTL. Each queued reply is prefixed with a 4-hex
                request token derived from the request fingerprint. Peer bots see the token go by,
                mark that request handled, and drop their pending reply. The closest bot wins the
                race; everyone else stays quiet — so <code className="mono">#bot</code> stays
                readable even with dense bot coverage.
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

        {/* First-time setup */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-3xl">
              <SectionEyebrow tone="sunset">After you flash</SectionEyebrow>
              <h2 className="mt-3 text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
                First-time setup — four things, in order.
              </h2>
              <p className="mt-4 text-foreground-muted leading-relaxed">
                Because this is a <strong>companion-radio firmware</strong>, the radio still needs a
                one-time hand-off from a phone before the bot can do its job. Skipping this is the
                most common reason a freshly-flashed bot looks dead — the firmware is fine; it just
                has no clock and no channels yet.
              </p>
            </div>

            <ol className="grid gap-4 sm:gap-5 md:grid-cols-2">
              {firstSetupSteps.map((item) => (
                <li key={item.step}>
                  <NetworkPanel
                    eyebrow={`STEP ${item.step}`}
                    eyebrowTone="mesh"
                    title={item.title}
                    headingLevel="h3"
                    padding="md"
                    className="h-full"
                  >
                    <p className="text-sm text-foreground-muted leading-relaxed">{item.description}</p>
                  </NetworkPanel>
                </li>
              ))}
            </ol>

            <NetworkPanel
              eyebrow="Heads up"
              eyebrowTone="sunset"
              title="The bot listens on #bot, #testing, #emergency, and Public"
              padding="md"
              headingLevel="h3"
              className="mt-6"
            >
              <p className="text-sm text-foreground-muted leading-relaxed">
                Those four are the bot&apos;s entire universe. <code className="mono">#bot</code> and{' '}
                <code className="mono">#testing</code> are where normal commands work.{' '}
                <code className="mono">#emergency</code> messages get re-broadcast on{' '}
                <code className="mono">Public</code>. Every other channel is silent — even DMs work,
                but the channel set is what the bot uses to scope replies.
              </p>
            </NetworkPanel>
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
