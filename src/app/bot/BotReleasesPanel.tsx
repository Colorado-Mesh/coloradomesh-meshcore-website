'use client';

import { useEffect, useMemo, useState } from 'react';

import { NetworkPanel, SectionEyebrow } from '@/components/brand';
import {
  BOT_FIRMWARE_API_LATEST_URL,
  BOT_FIRMWARE_RELEASES_URL,
  MESHCORE_FLASHER_URL,
} from '@/lib/constants';
import {
  boardDisplayName,
  classifyAsset,
  formatLabel,
  platformInstallHint,
  platformLabel,
  variantLabel,
  type BotPlatform,
  type BotRelease,
  type BotReleaseAsset,
  type BotReleaseAssetClassification,
} from '@/lib/bot-firmware';

interface FetchState {
  status: 'loading' | 'ready' | 'empty' | 'error';
  release: BotRelease | null;
  error: string | null;
}

interface GithubRelease {
  tag_name: string;
  name: string | null;
  html_url: string;
  published_at: string | null;
  prerelease: boolean;
  draft: boolean;
  body: string | null;
  assets: Array<{
    name: string;
    size: number;
    browser_download_url: string;
    content_type: string;
  }>;
}

function toBotRelease(raw: GithubRelease): BotRelease {
  return {
    tagName: raw.tag_name,
    name: raw.name ?? raw.tag_name,
    htmlUrl: raw.html_url,
    publishedAt: raw.published_at,
    prerelease: raw.prerelease,
    draft: raw.draft,
    body: raw.body ?? '',
    assets: raw.assets.map((a) => ({
      name: a.name,
      size: a.size,
      downloadUrl: a.browser_download_url,
      contentType: a.content_type,
    })),
  };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

interface GroupedAssets {
  platform: BotPlatform | 'UNKNOWN';
  assets: Array<{ asset: BotReleaseAsset; classification: BotReleaseAssetClassification }>;
}

const PLATFORM_ORDER: ReadonlyArray<BotPlatform | 'UNKNOWN'> = ['ESP32', 'NRF52', 'RP2040', 'STM32', 'UNKNOWN'];

function groupAssets(assets: BotReleaseAsset[]): GroupedAssets[] {
  const buckets = new Map<BotPlatform | 'UNKNOWN', GroupedAssets['assets']>();
  for (const asset of assets) {
    const classification = classifyAsset(asset.name);
    const key = classification.platform;
    const bucket = buckets.get(key) ?? [];
    bucket.push({ asset, classification });
    buckets.set(key, bucket);
  }
  return PLATFORM_ORDER.filter((p) => buckets.has(p)).map((platform) => ({
    platform,
    assets: (buckets.get(platform) ?? []).sort((a, b) => a.asset.name.localeCompare(b.asset.name)),
  }));
}

export default function BotReleasesPanel() {
  const [state, setState] = useState<FetchState>({ status: 'loading', release: null, error: null });

  useEffect(() => {
    const controller = new AbortController();

    fetch(BOT_FIRMWARE_API_LATEST_URL, {
      signal: controller.signal,
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then(async (res) => {
        if (res.status === 404) {
          setState({ status: 'empty', release: null, error: null });
          return;
        }
        if (res.status === 403) {
          setState({
            status: 'error',
            release: null,
            error: 'GitHub rate limit reached for your IP — try again in a few minutes, or open the release page directly.',
          });
          return;
        }
        if (!res.ok) {
          setState({ status: 'error', release: null, error: `GitHub returned ${res.status}` });
          return;
        }
        const raw = (await res.json()) as GithubRelease;
        setState({ status: 'ready', release: toBotRelease(raw), error: null });
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        setState({
          status: 'error',
          release: null,
          error: err instanceof Error ? err.message : 'Network error',
        });
      });

    return () => controller.abort();
  }, []);

  const grouped = useMemo(
    () => (state.release ? groupAssets(state.release.assets) : []),
    [state.release],
  );

  return (
    <NetworkPanel
      eyebrow="Latest release"
      eyebrowTone="sky"
      title={state.release ? state.release.name : 'Firmware releases'}
      subtitle={
        state.release
          ? `${state.release.assets.length} build${state.release.assets.length === 1 ? '' : 's'} · published ${formatDate(state.release.publishedAt)}${state.release.prerelease ? ' · pre-release' : ''}`
          : 'Published builds from the meshcore-bot-firmware repo.'
      }
      tone="elevated"
      padding="lg"
      headingLevel="h2"
      actions={
        <a
          href={BOT_FIRMWARE_RELEASES_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-sm"
        >
          All releases ↗
        </a>
      }
    >
      {state.status === 'loading' && (
        <p className="text-sm text-foreground-muted">Checking GitHub for the latest release…</p>
      )}

      {state.status === 'empty' && (
        <div className="space-y-3 text-sm text-foreground-muted leading-relaxed">
          <p>
            No published releases yet. Once a <code className="mono text-xs">cmesh-bot-vX.Y.Z</code> tag is
            pushed, the release workflow publishes builds for all 133 supported boards here.
          </p>
          <p>
            In the meantime, you can build from source with PlatformIO — see the firmware repo
            README for steps.
          </p>
        </div>
      )}

      {state.status === 'error' && (
        <div className="space-y-3 text-sm leading-relaxed">
          <p className="text-amber-signal">{state.error}</p>
          <p className="text-foreground-muted">
            <a
              href={BOT_FIRMWARE_RELEASES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="link"
            >
              Open releases on GitHub →
            </a>
          </p>
        </div>
      )}

      {state.status === 'ready' && state.release && (
        <div className="space-y-6">
          <div className="rounded-lg border border-card-border bg-background-secondary px-4 py-3 text-sm leading-relaxed text-foreground-muted">
            <p>
              To flash, open{' '}
              <a href={MESHCORE_FLASHER_URL} target="_blank" rel="noopener noreferrer" className="link">
                {MESHCORE_FLASHER_URL.replace(/^https?:\/\//, '')}
              </a>{' '}
              in Chrome or Edge, choose <strong>Custom firmware</strong>, and drop in the right file
              for your board. Per-platform hints below.
            </p>
          </div>

          {grouped.map((group) => (
            <div key={group.platform} className="space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-semibold text-foreground tracking-tight">
                  {platformLabel(group.platform)}{' '}
                  <span className="text-foreground-muted font-normal">
                    · {group.assets.length} build{group.assets.length === 1 ? '' : 's'}
                  </span>
                </h3>
                <p className="text-xs text-foreground-dim max-w-xl text-right">
                  {platformInstallHint(group.platform)}
                </p>
              </div>
              <ul className="divide-y divide-card-border rounded-lg border border-card-border">
                {group.assets.map(({ asset, classification }) => (
                  <li
                    key={asset.name}
                    className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">
                        {classification.env ? boardDisplayName(classification.env) : asset.name}
                      </p>
                      <p className="text-xs text-foreground-muted mono truncate">
                        {asset.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="mono uppercase text-foreground-dim">
                        {variantLabel(classification.variant)}
                      </span>
                      <span className="mono text-foreground-dim">
                        {formatLabel(classification.format)}
                      </span>
                      <span className="mono text-foreground-dim">{formatBytes(asset.size)}</span>
                      <a
                        href={asset.downloadUrl}
                        className="btn-secondary text-xs px-3 py-1"
                        download
                      >
                        Download
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {state.release.body && (
            <details className="text-sm">
              <summary className="cursor-pointer text-foreground-muted hover:text-foreground transition-colors">
                Release notes
              </summary>
              <pre className="mt-3 whitespace-pre-wrap break-words text-xs text-foreground-muted leading-relaxed">
                {state.release.body}
              </pre>
            </details>
          )}
        </div>
      )}

      <SectionEyebrow tone="mesh" className="mt-6 sr-only">
        Release information
      </SectionEyebrow>
    </NetworkPanel>
  );
}
