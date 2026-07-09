import type { Metadata } from "next";
import Link from "next/link";

import Breadcrumbs from "@/components/Breadcrumbs";
import { CopyButton } from "@/components/CopyButton";
import JsonLd from "@/components/JsonLd";
import { HeroPanel, NetworkPanel, SectionEyebrow } from "@/components/brand";
import {
  BASE_URL,
  COMMUNITY_NAME,
  DISCORD_INVITE_URL,
  MESHCORE_FLASHER_URL,
  SITE_NAME,
} from "@/lib/constants";
import { generateBreadcrumbSchema } from "@/lib/schemas/breadcrumb";
import { generateFAQSchema } from "@/lib/schemas/faq";
import { generateHowToSchema } from "@/lib/schemas/howto";

const PAGE_PATH = "/guides/observer-mqtt";
const PAGE_TITLE = "Observer & MQTT Setup";
const PAGE_DESCRIPTION =
  "Build a Companion-radio observer and securely contribute packet observations to the Colorado Mesh MQTT broker.";

const PACKET_CAPTURE_REPO =
  "https://github.com/agessaman/meshcore-packet-capture";
const PACKET_CAPTURE_RELEASE = `${PACKET_CAPTURE_REPO}/releases/tag/v2.0.0`;
const MESHCORE_TO_MQTT_REPO = "https://github.com/Cisien/meshcoretomqtt";
const MESH_MAPPER_OVERVIEW = "https://wiki.meshmapper.net/mqtt-main/";
const RANGE_CHECK_URL = "https://rangecheck.meshcore.coloradomesh.org/";
const OBSERVER_STATUS_URL = "https://analyzer.meshcore.coloradomesh.org/#/observers";

const INSTALL_COMMANDS = `curl -fsSLo meshcore-packet-capture-install.sh \\
  https://raw.githubusercontent.com/agessaman/meshcore-packet-capture/42521260a92feec9ea806eebe1249acde0ef2a7f/install.sh
less meshcore-packet-capture-install.sh
sudo bash meshcore-packet-capture-install.sh --tag v2.0.0
rm meshcore-packet-capture-install.sh`;

const COLORADO_BROKER_CONFIG = `[[broker]]
name = "Colorado Mesh"
enabled = true
server = "mqtt.meshcore.coloradomesh.org"
port = 1883
transport = "websockets"
keepalive = 60
qos = 0
retain = true

[broker.tls]
enabled = true
verify = true

[broker.auth]
method = "token"
audience = "mqtt.meshcore.coloradomesh.org"`;

const SERVICE_COMMANDS = `sudo systemctl restart meshcore-packet-capture
sudo systemctl status meshcore-packet-capture --no-pager
sudo journalctl -u meshcore-packet-capture -f`;

const MACOS_SERVICE_COMMANDS = `# BLE connection · per-user LaunchAgent
launchctl kickstart -k "gui/$(id -u)/com.meshcore.meshcore_packet_capture"
launchctl list | grep com.meshcore.meshcore_packet_capture
tail -f "$HOME/Library/Logs/meshcore-packet-capture.log"

# Serial or TCP · system LaunchDaemon
sudo launchctl kickstart -k system/com.meshcore.meshcore_packet_capture
sudo launchctl list | grep com.meshcore.meshcore_packet_capture
tail -f /var/log/meshcore-packet-capture.log`;

const signalStages = [
  {
    step: "01",
    label: "Hear",
    title: "Companion radio",
    detail: "Observes local LoRa traffic and may send its own scheduled observer advert.",
  },
  {
    step: "02",
    label: "Capture",
    title: "Always-on host",
    detail: "Reads packets from the radio over USB, BLE, or TCP.",
  },
  {
    step: "03",
    label: "Sign",
    title: "Device identity",
    detail: "Creates a time-limited token signed by the observer identity.",
  },
  {
    step: "04",
    label: "Publish",
    title: "Colorado MQTT",
    detail: "Sends observations over a secure WebSocket connection.",
  },
] as const;

const faqItems = [
  {
    question: "Does an observer relay packets over LoRa?",
    answer:
      "No. The Companion captures local RF traffic and reports observations over the Internet; it does not relay other nodes' packets. Packet Capture may still send a periodic advert for the observer itself, depending on its capture settings.",
  },
  {
    question: "Can one observer publish to Colorado Mesh, MeshMapper, and LetsMesh?",
    answer:
      "Yes. MeshCore Packet Capture supports multiple broker presets. Keep your existing brokers enabled and add Colorado Mesh as another destination.",
  },
  {
    question: "Does an observer expose private messages?",
    answer:
      "Observers can forward encrypted packet data and traffic metadata. Private-channel and direct-message contents are not decrypted merely because an observer hears them; the corresponding secret or key is still required. Public-channel traffic should be treated as public.",
  },
  {
    question: "Can I use meshcore-packet-capture with a repeater?",
    answer:
      "No. MeshCore Packet Capture is for Companion firmware only. Repeater observers use meshcoretomqtt plus packet-logging-enabled repeater firmware, which is a separate setup path.",
  },
  {
    question: "Why does a TLS connection use port 1883?",
    answer:
      "That is the Colorado broker's configured secure WebSocket endpoint. In this configuration, WebSockets transport and TLS are both enabled; do not infer plaintext MQTT from the port number alone.",
  },
] as const;

const breadcrumbData = generateBreadcrumbSchema([
  { name: "Home", url: BASE_URL },
  { name: "Guides", url: `${BASE_URL}/guides` },
  { name: PAGE_TITLE, url: `${BASE_URL}${PAGE_PATH}` },
]);

const howToData = generateHowToSchema(
  "How to build a Colorado Mesh MQTT observer",
  PAGE_DESCRIPTION,
  [
    {
      name: "Flash Companion firmware",
      text: "Flash a supported MeshCore radio with Companion firmware and apply the Colorado radio settings.",
      url: MESHCORE_FLASHER_URL,
    },
    {
      name: "Connect an always-on host",
      text: "Attach the Companion radio to a Raspberry Pi, Linux host, or macOS computer over USB, BLE, or TCP.",
    },
    {
      name: "Install MeshCore Packet Capture",
      text: "Run the managed-service installer and select the connection method and three-letter location code for the observer.",
      url: PACKET_CAPTURE_REPO,
    },
    {
      name: "Finish the base capture-service setup",
      text: "Choose the Companion connection method, enter the correct three-letter IATA airport or location code, and retain any other community brokers you want to use.",
    },
    {
      name: "Add the Colorado Mesh broker",
      text: "Add the documented Colorado Mesh TOML block to the current managed-service configuration.",
      url: `${BASE_URL}${PAGE_PATH}#configure`,
    },
    {
      name: "Restart and verify",
      text: "Restart the packet-capture service, confirm the radio and broker connections in its logs, and wait for heard traffic.",
      url: `${BASE_URL}${PAGE_PATH}#verify`,
    },
  ],
  {
    totalTime: "PT45M",
    supply: [
      "MeshCore-compatible radio running Companion firmware",
      "Raspberry Pi, Linux host, or macOS computer",
      "USB data cable when using the recommended serial connection",
      "Stable Internet connection",
    ],
    tool: ["MeshCore web flasher", "Terminal access to the observer host"],
  },
);

const faqData = generateFAQSchema([...faqItems]);

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "MeshCore observer",
    "Colorado Mesh MQTT",
    "meshcore-packet-capture",
    "MQTT observer",
    "LoRa packet capture",
    "Companion radio",
    "Raspberry Pi",
  ],
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    title: `${PAGE_TITLE} | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    url: `${BASE_URL}${PAGE_PATH}`,
  },
};

function ExternalGlyph() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M14 5h5v5m0-5L10 14M5 7v12h12v-5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}

function CheckGlyph() {
  return (
    <svg
      aria-hidden="true"
      className="mt-0.5 h-5 w-5 shrink-0 text-mesh"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="m5 12 4 4L19 6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}

function CodePanel({ label, code }: { label: string; code: string }) {
  return (
    <div className="min-w-0 max-w-full overflow-hidden rounded-lg border border-card-border bg-night-950 shadow-panel">
      <div className="flex items-center justify-between gap-4 border-b border-card-border bg-night-800 px-4 py-2.5">
        <span className="mono text-[0.6875rem] uppercase text-foreground-dim">
          {label}
        </span>
        <CopyButton text={code} className="shrink-0" />
      </div>
      <pre
        aria-label={`${label} code`}
        className="focus-ring max-w-full overflow-x-auto p-4 text-sm leading-6 text-foreground-muted"
        tabIndex={0}
      >
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}

export default function ObserverMqttPage() {
  return (
    <>
      <JsonLd data={breadcrumbData} />
      <JsonLd data={howToData} />
      <JsonLd data={faqData} />

      <div className="min-h-screen">
        <HeroPanel
          background="topo-grid"
          showMountains
          eyebrow={`${COMMUNITY_NAME} · Observer uplink`}
          eyebrowTone="sky"
          title={
            <>
              Turn a Companion into{" "}
              <span className="block text-mesh">the mesh&apos;s ears.</span>
            </>
          }
          description="Build a dedicated listening post, then publish what it hears to Colorado Mesh over a signed, encrypted MQTT connection."
          actions={
            <>
              <a href="#build" className="btn-primary">
                Build an observer
              </a>
              <a href="#configure" className="btn-secondary">
                Add the Colorado broker
              </a>
              <Link href="/map" className="btn-outline">
                Open live map
              </Link>
            </>
          }
          meta={
            <div className="panel bg-card/90 p-5 backdrop-blur-md sm:p-6">
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Guides", href: "/guides" },
                  { label: PAGE_TITLE },
                ]}
              />
              <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-[2fr_repeat(4,1fr)]">
                <div className="min-w-0">
                  <div className="metric-label">Host</div>
                  <div className="mt-1 break-all font-mono text-sm text-foreground sm:text-base">
                    mqtt.meshcore.coloradomesh.org
                  </div>
                </div>
                <div>
                  <div className="metric-label">Port</div>
                  <div className="mt-1 font-mono text-base text-foreground">1883</div>
                </div>
                <div>
                  <div className="metric-label">Transport</div>
                  <div className="mt-1 font-mono text-base text-foreground">WebSockets</div>
                </div>
                <div>
                  <div className="metric-label">TLS</div>
                  <div className="mt-1 font-mono text-base text-mesh">Required</div>
                </div>
                <div>
                  <div className="metric-label">Auth</div>
                  <div className="mt-1 font-mono text-base text-foreground">Device signing</div>
                </div>
              </div>
            </div>
          }
        />

        <section className="relative z-10 -mt-10 px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="panel-mesh overflow-hidden">
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-mesh/20 px-5 py-4 sm:px-7">
                <div>
                  <SectionEyebrow tone="mesh">Signal path</SectionEyebrow>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    A listening post, not another repeater.
                  </h2>
                </div>
                <span className="tag-mono border-mesh/30 text-mesh">Observed RF → Internet uplink</span>
              </div>
              <div
                aria-label="Observer signal path"
                className="grid gap-px bg-card-border md:grid-cols-4"
              >
                {signalStages.map((stage) => (
                  <div key={stage.step} className="bg-card px-5 py-6 sm:px-6">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-xs tracking-[0.18em] text-mesh">
                        {stage.step} / {stage.label.toUpperCase()}
                      </span>
                      <span className="h-1.5 w-1.5 rounded-full bg-mesh shadow-[0_0_12px_rgba(0,212,170,0.8)]" />
                    </div>
                    <h3 className="mt-5 font-semibold text-foreground">{stage.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                      {stage.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <div className="panel p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-mesh/30 bg-mesh/10 font-mono text-mesh">
                    C
                  </span>
                  <div>
                    <div className="tag-mono mb-3 text-mesh">This guide</div>
                    <h2 className="text-xl font-semibold text-foreground">
                      Companion radio + always-on host
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                      Use <span className="text-foreground">meshcore-packet-capture</span> with
                      a Companion connected over USB, BLE, or TCP. USB serial is the most
                      reliable choice for an unattended station.
                    </p>
                  </div>
                </div>
              </div>

              <div className="panel p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-sunset-500/30 bg-sunset-500/10 font-mono text-sunset-500">
                    R
                  </span>
                  <div>
                    <div className="tag-mono mb-3 text-sunset-500">Different software</div>
                    <h2 className="text-xl font-semibold text-foreground">
                      Repeater observer
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                      Do not install Packet Capture on a repeater. Repeater observers use the
                      separate{" "}
                      <a
                        href={MESHCORE_TO_MQTT_REPO}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-mesh underline decoration-mesh/40 underline-offset-2 hover:text-mesh-light"
                      >
                        meshcoretomqtt project <ExternalGlyph />
                      </a>
                      . It requires packet-logging-enabled repeater firmware; a standard repeater
                      build alone is not enough.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="build" className="scroll-mt-24 bg-background-secondary px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
              <div className="min-w-0">
                <SectionEyebrow tone="sky">Companion observer · Fresh install</SectionEyebrow>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Build the listening post.
                </h2>
                <p className="mt-4 max-w-3xl text-foreground-muted">
                  The managed installer creates the background service, configures the radio
                  connection, and lets you select multiple MQTT destinations. Plan on roughly
                  30–45 minutes for a first build.
                </p>

                <ol className="mt-9 space-y-5">
                  <li className="panel grid min-w-0 gap-5 p-6 sm:grid-cols-[3rem_minmax(0,1fr)] sm:p-7">
                    <div className="font-mono text-2xl text-mesh">01</div>
                    <div className="min-w-0">
                      <h3 className="text-xl font-semibold text-foreground">
                        Flash Companion firmware
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                        Use a supported radio, attach its antenna before powering it, and flash
                        <span className="text-foreground"> Companion</span> firmware—not Repeater
                        or Room Server. Then apply the Colorado frequency and radio settings.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <a
                          href={MESHCORE_FLASHER_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-outline"
                        >
                          Open MeshCore flasher <ExternalGlyph />
                        </a>
                        <Link href="/guides/radio-settings" className="btn-secondary">
                          Colorado radio settings
                        </Link>
                      </div>
                    </div>
                  </li>

                  <li className="panel grid min-w-0 gap-5 p-6 sm:grid-cols-[3rem_minmax(0,1fr)] sm:p-7">
                    <div className="font-mono text-2xl text-mesh">02</div>
                    <div className="min-w-0">
                      <h3 className="text-xl font-semibold text-foreground">
                        Connect an always-on computer
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                        A Raspberry Pi or similar Linux host is ideal. Connect the Companion by
                        USB serial for the most stable unattended setup; BLE and TCP are also
                        supported. Give the host a reliable Internet connection and keep the
                        radio&apos;s antenna in a useful RF location.
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
                        On macOS, BLE installs run in your logged-in session because Bluetooth
                        permission is per-user. Prefer serial or TCP for a headless, unattended
                        macOS observer.
                      </p>
                    </div>
                  </li>

                  <li className="panel grid min-w-0 gap-5 p-6 sm:grid-cols-[3rem_minmax(0,1fr)] sm:p-7">
                    <div className="font-mono text-2xl text-mesh">03</div>
                    <div className="min-w-0">
                      <h3 className="text-xl font-semibold text-foreground">
                        Install the capture service
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                        Run the current upstream managed-service installer on Linux or macOS.
                        These commands download the installer from the immutable commit behind
                        stable release v2.0.0. Inspect it in <span className="font-mono text-foreground">less</span>{" "}
                        before the next command runs it as root.
                      </p>
                      <div className="mt-5">
                        <CodePanel label="Terminal · pinned v2.0.0 installer" code={INSTALL_COMMANDS} />
                      </div>
                      <a
                        href={PACKET_CAPTURE_RELEASE}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-1.5 text-sm text-mesh underline decoration-mesh/40 underline-offset-2 hover:text-mesh-light"
                      >
                        Review the pinned upstream release <ExternalGlyph />
                      </a>
                    </div>
                  </li>

                  <li className="panel grid min-w-0 gap-5 p-6 sm:grid-cols-[3rem_minmax(0,1fr)] sm:p-7">
                    <div className="font-mono text-2xl text-mesh">04</div>
                    <div className="min-w-0">
                      <h3 className="text-xl font-semibold text-foreground">
                        Finish the base setup
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                        During the installer prompts, choose your radio connection, enter the
                        correct three-letter IATA airport/location code, and retain any community
                        brokers you already use. Then continue to the exact Colorado broker block
                        in the next section.
                      </p>
                      <div className="mt-4 rounded-lg border border-mesh/25 bg-mesh/5 p-4 text-sm text-foreground-muted">
                        <span className="font-semibold text-foreground">Do not guess the code.</span>{" "}
                        Keep an existing observer&apos;s IATA value. For a new station, ask in
                        Colorado Mesh Discord which code your area uses, especially outside the
                        Denver metro.
                      </div>
                      <a
                        href="#configure"
                        className="btn-outline mt-4"
                      >
                        Continue to Colorado MQTT ↓
                      </a>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="min-w-0 space-y-5 lg:sticky lg:top-24">
                <NetworkPanel
                  eyebrow="Preflight"
                  eyebrowTone="sky"
                  title="What you need"
                  subtitle="Companion observer hardware"
                  headingLevel="h3"
                  tone="elevated"
                >
                  <ul className="space-y-3 text-sm text-foreground-muted">
                    {[
                      "A MeshCore-compatible radio on Companion firmware",
                      "A Raspberry Pi, Linux host, or macOS computer",
                      "A USB data cable for the recommended serial path",
                      "Stable power, Internet, and a useful antenna location",
                      "Your area's confirmed three-letter IATA airport/location code",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckGlyph />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </NetworkPanel>

                <div className="panel border-sunset-500/30 p-5">
                  <div className="tag-mono border-sunset-500/30 text-sunset-500">
                    Identity safety
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-foreground-muted">
                    The service handles device signing. Do not post or paste your private key
                    into a public form or support channel. Owner public key and email fields are
                    optional metadata—not broker login requirements.
                  </p>
                </div>

                <div className="panel p-5">
                  <div className="metric-label">Background reading</div>
                  <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
                    Want the broader MQTT model before installing anything? MeshMapper documents
                    the observer methods and multi-broker concept.
                  </p>
                  <a
                    href={MESH_MAPPER_OVERVIEW}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm text-mesh hover:text-mesh-light"
                  >
                    MQTT observer overview <ExternalGlyph />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="configure" className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionEyebrow tone="mesh">New + existing Companion observers</SectionEyebrow>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Add Colorado Mesh as another destination.
            </h2>
            <p className="mt-4 max-w-3xl text-foreground-muted">
              Current managed installs use TOML under{" "}
              <code className="rounded border border-card-border bg-night-700 px-1.5 py-0.5 font-mono text-sm text-mesh-light">
                /etc/meshcore-packet-capture/config.d/
              </code>
              . Add this broker block to your local configuration, then restart the service.
            </p>

            <div className="mt-5 max-w-3xl rounded-lg border border-sky-signal/30 bg-sky-signal/5 p-4 text-sm leading-relaxed text-foreground-muted">
              <span className="font-semibold text-foreground">Older install?</span> If your
              service is named <span className="font-mono text-foreground">meshcore-capture</span>{" "}
              or your configuration lives in{" "}
              <span className="font-mono text-foreground">~/.meshcore-packet-capture/.env.local</span>,
              follow the upstream{" "}
              <a
                href={`${PACKET_CAPTURE_REPO}#upgrading-legacy-service-installs`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-mesh underline decoration-mesh/40 underline-offset-2 hover:text-mesh-light"
              >
                managed-service migration notes
              </a>{" "}
              before adding the block.
            </div>

            <div className="mt-9 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)] lg:items-start">
              <div className="min-w-0">
                <CodePanel
                  label="TOML · meshcore-packet-capture · Companion only"
                  code={COLORADO_BROKER_CONFIG}
                />
                <p className="mt-4 text-sm leading-relaxed text-foreground-muted">
                  A conventional local file is{" "}
                  <span className="font-mono text-foreground">
                    /etc/meshcore-packet-capture/config.d/99-user.toml
                  </span>
                  . Append the block without removing any existing broker entries.
                </p>
              </div>

              <div className="min-w-0 space-y-5">
                <NetworkPanel
                  eyebrow="Broker connection"
                  title="Colorado Mesh"
                  subtitle="Secure observer ingest"
                  tone="mesh"
                  headingLevel="h3"
                >
                  <dl className="divide-y divide-card-border text-sm">
                    {[
                      ["Host", "mqtt.meshcore.coloradomesh.org"],
                      ["Port", "1883"],
                      ["Transport", "WebSockets + TLS"],
                      ["Authentication", "Signed token"],
                      ["Audience", "mqtt.meshcore.coloradomesh.org"],
                    ].map(([term, value]) => (
                      <div key={term} className="grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[8rem_1fr]">
                        <dt className="metric-label">{term}</dt>
                        <dd className="break-all font-mono text-xs text-foreground sm:text-right">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </NetworkPanel>

                <div className="rounded-lg border border-sunset-500/35 bg-sunset-500/5 p-5">
                  <div className="tag-mono border-sunset-500/30 text-sunset-500">
                    Avoid a duplicate
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-foreground-muted">
                    Check <span className="font-mono text-foreground">config.d/</span> first. If
                    another block already uses{" "}
                    <span className="font-mono text-foreground">mqtt.meshcore.coloradomesh.org</span>,
                    stop: Colorado Mesh is already configured. Do not create a duplicate under a
                    different broker name.
                  </p>
                </div>

                <div className="rounded-lg border border-sky-signal/30 bg-sky-signal/5 p-5">
                  <h3 className="font-semibold text-foreground">Port 1883 is intentional</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                    This is still encrypted. The combination of{" "}
                    <span className="font-mono text-foreground">transport = &quot;websockets&quot;</span> and
                    TLS <span className="font-mono text-foreground">enabled = true</span> creates
                    the secure connection. Keep both settings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="verify" className="scroll-mt-24 bg-background-secondary px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
              <div className="min-w-0">
                <SectionEyebrow tone="sky">Commissioning check</SectionEyebrow>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Restart, watch, verify.
                </h2>
                <p className="mt-4 text-foreground-muted">
                  Restart the current systemd service and follow its logs while local mesh
                  traffic is active.
                </p>
                <div className="mt-7">
                  <CodePanel label="Terminal · Linux service" code={SERVICE_COMMANDS} />
                </div>
                <div className="mt-5">
                  <CodePanel label="Terminal · macOS launchd" code={MACOS_SERVICE_COMMANDS} />
                </div>
                <p className="mt-4 text-sm leading-relaxed text-foreground-muted">
                  Use the BLE group only for a per-user LaunchAgent in the logged-in desktop
                  session. Serial and TCP installs use the system LaunchDaemon group. The
                  installer summary confirms which one it created.
                </p>
              </div>

              <NetworkPanel
                eyebrow="Expected state"
                eyebrowTone="sky"
                title="You are online when…"
                subtitle="Confirm each condition before leaving the station unattended."
                tone="elevated"
                headingLevel="h3"
                padding="lg"
              >
                <ul className="space-y-4">
                  {[
                    "The service reports active (running).",
                    "Logs show a successful Companion connection.",
                    "Logs show the Colorado broker connected without a TLS or token error.",
                    "Heard traffic produces packet activity after the next local transmission or advert.",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-foreground-muted">
                      <CheckGlyph />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  <a
                    href={OBSERVER_STATUS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    Observer status <ExternalGlyph />
                  </a>
                  <a
                    href={RANGE_CHECK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                  >
                    Run a range check <ExternalGlyph />
                  </a>
                  <Link href="/map" className="btn-outline">
                    View live map
                  </Link>
                </div>
              </NetworkPanel>
            </div>

            <div className="mt-8 rounded-lg border border-sunset-500/30 bg-sunset-500/5 p-5 sm:p-6">
              <h3 className="font-semibold text-foreground">No packets yet is not always a failure.</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                The broker can be connected while the radio has nothing new to report. Send a
                test message or wait for a nearby advert, then re-check the logs. If either the
                radio or broker is disconnected, copy the relevant error—not any private
                key—and ask in the Colorado Mesh Discord.
              </p>
            </div>
          </div>
        </section>

        <section id="privacy" className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <SectionEyebrow tone="sunset">Know what is observed</SectionEyebrow>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  RF is shared. Encryption still matters.
                </h2>
                <p className="mt-4 text-foreground-muted">
                  Observers receive packet telemetry and traffic metadata from anything their
                  radios hear. That visibility powers useful community tools, but it does not
                  bypass MeshCore encryption.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="panel p-6">
                  <div className="tag-mono border-sunset-500/30 text-sunset-500">Public channel</div>
                  <h3 className="mt-5 text-xl font-semibold text-foreground">Treat it as public.</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                    Public-channel traffic may be captured, stored, visualized, or relayed by
                    Colorado Mesh and third-party services such as MeshMapper and LetsMesh.
                  </p>
                </div>
                <div className="panel-mesh p-6">
                  <div className="tag-mono border-mesh/30 text-mesh">Private + direct</div>
                  <h3 className="mt-5 text-xl font-semibold text-foreground">Contents stay encrypted.</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                    An observer can forward ciphertext and metadata, but private-channel and
                    direct-message contents still require the corresponding secret or key to
                    decrypt.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-14">
              <SectionEyebrow tone="mesh">What your station powers</SectionEyebrow>
              <div className="mt-5 grid gap-5 md:grid-cols-3">
                <Link href="/map" className="panel group p-6 transition hover:-translate-y-0.5 hover:border-mesh/50">
                  <div className="font-mono text-xs tracking-[0.16em] text-mesh">01 / NETWORK CONTEXT</div>
                  <h3 className="mt-5 text-xl font-semibold text-foreground group-hover:text-mesh-light">
                    Live map + analytics
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                    Give the network another vantage point for node, route, and coverage context.
                  </p>
                </Link>
                <a
                  href={RANGE_CHECK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="panel group p-6 transition hover:-translate-y-0.5 hover:border-mesh/50"
                >
                  <div className="flex items-center gap-2 font-mono text-xs tracking-[0.16em] text-mesh">
                    02 / RANGE CHECK <ExternalGlyph />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-foreground group-hover:text-mesh-light">
                    Prove who heard you
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                    Send a test message and see which participating observers received it.
                  </p>
                </a>
                <a
                  href={DISCORD_INVITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="panel group p-6 transition hover:-translate-y-0.5 hover:border-mesh/50"
                >
                  <div className="flex items-center gap-2 font-mono text-xs tracking-[0.16em] text-mesh">
                    03 / PUBLIC RELAY <ExternalGlyph />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-foreground group-hover:text-mesh-light">
                    MQTT relay channel
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                    Help surface Public-channel traffic for connectivity checks and community use.
                  </p>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-background-secondary px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <SectionEyebrow tone="sky">Observer FAQ</SectionEyebrow>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Before you leave it running.
            </h2>
            <div className="mt-8 divide-y divide-card-border overflow-hidden rounded-lg border border-card-border bg-card">
              {faqItems.map((item) => (
                <details key={item.question} className="group px-5 py-5 sm:px-7">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mesh [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <span
                      aria-hidden="true"
                      className="font-mono text-xl text-mesh transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="max-w-3xl pt-4 text-sm leading-7 text-foreground-muted">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>

            <div className="panel-mesh mt-10 p-7 text-center sm:p-9">
              <div className="metric-label text-mesh">Need another set of eyes?</div>
              <h2 className="mt-3 text-2xl font-semibold text-foreground">
                Bring the error, not your keys.
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-foreground-muted">
                Share the service status and a redacted log excerpt in Colorado Mesh Discord.
                Operators can help check the radio connection, location code, TLS, and broker
                token flow.
              </p>
              <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-6"
              >
                Ask the Colorado Mesh community <ExternalGlyph />
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
