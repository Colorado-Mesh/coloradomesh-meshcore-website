'use client';

import { useMemo, useState } from 'react';

import { NetworkPanel } from '@/components/brand';
import {
  BOT_BOARDS,
  boardDisplayName,
  platformLabel,
  variantLabel,
  type BotPlatform,
} from '@/lib/bot-firmware';

type PlatformFilter = 'ALL' | BotPlatform;

const PLATFORM_FILTERS: ReadonlyArray<{ key: PlatformFilter; label: string }> = [
  { key: 'ALL', label: 'All' },
  { key: 'ESP32', label: 'ESP32' },
  { key: 'NRF52', label: 'nRF52' },
  { key: 'RP2040', label: 'RP2040' },
  { key: 'STM32', label: 'STM32' },
];

const PLATFORM_COUNTS = BOT_BOARDS.reduce<Record<BotPlatform, number>>(
  (acc, b) => {
    acc[b.platform] += 1;
    return acc;
  },
  { ESP32: 0, NRF52: 0, RP2040: 0, STM32: 0 },
);

export default function BoardCatalog() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<PlatformFilter>('ALL');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BOT_BOARDS.filter((b) => {
      if (filter !== 'ALL' && b.platform !== filter) return false;
      if (!q) return true;
      return (
        b.env.toLowerCase().includes(q) ||
        b.board.toLowerCase().includes(q) ||
        boardDisplayName(b.env).toLowerCase().includes(q)
      );
    });
  }, [query, filter]);

  return (
    <NetworkPanel
      eyebrow="Supported boards"
      eyebrowTone="mesh"
      title={`${BOT_BOARDS.length} board variants build on every release`}
      subtitle={`ESP32: ${PLATFORM_COUNTS.ESP32} · nRF52: ${PLATFORM_COUNTS.NRF52} · RP2040: ${PLATFORM_COUNTS.RP2040} · STM32: ${PLATFORM_COUNTS.STM32}. Each board ships in USB and BLE variants where supported.`}
      tone="default"
      padding="lg"
      headingLevel="h2"
    >
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search boards (e.g. heltec, rak, t-echo)…"
          className="flex-1 min-w-[14rem] rounded-md border border-card-border bg-background px-3 py-2 text-sm placeholder:text-foreground-dim focus:outline-none focus:ring-2 focus:ring-mesh/40"
          aria-label="Filter boards by name"
        />
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by platform">
          {PLATFORM_FILTERS.map((opt) => {
            const active = opt.key === filter;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setFilter(opt.key)}
                className={`text-xs mono uppercase px-2.5 py-1.5 rounded-md border transition-colors ${
                  active
                    ? 'bg-mesh text-background border-mesh'
                    : 'border-card-border text-foreground-muted hover:text-foreground hover:border-mesh/50'
                }`}
                aria-pressed={active}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-foreground-dim mb-3 mono uppercase tracking-wide">
        {filtered.length} of {BOT_BOARDS.length} shown
      </p>

      {filtered.length === 0 ? (
        <p className="text-sm text-foreground-muted py-6 text-center">
          No boards match your search.
        </p>
      ) : (
        <div className="max-h-[28rem] overflow-y-auto rounded-md border border-card-border">
          <table className="w-full text-sm">
            <thead className="bg-background-secondary sticky top-0 z-10">
              <tr className="text-xs uppercase mono text-foreground-dim">
                <th className="px-3 py-2 text-left">Board</th>
                <th className="px-3 py-2 text-left">Platform</th>
                <th className="px-3 py-2 text-left">Variant</th>
                <th className="px-3 py-2 text-left hidden md:table-cell">PlatformIO env</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {filtered.map((b) => (
                <tr key={b.env} className="hover:bg-background-secondary/60">
                  <td className="px-3 py-2 text-foreground">{boardDisplayName(b.env)}</td>
                  <td className="px-3 py-2 mono text-xs text-foreground-muted">
                    {platformLabel(b.platform)}
                  </td>
                  <td className="px-3 py-2 mono text-xs text-foreground-muted">
                    {variantLabel(b.variant)}
                  </td>
                  <td className="px-3 py-2 mono text-xs text-foreground-dim hidden md:table-cell">
                    {b.env}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </NetworkPanel>
  );
}
